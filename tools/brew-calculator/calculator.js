document.addEventListener("DOMContentLoaded", () => {
  // Recipes live in _data/recipes.yml; index.md inlines them as window.recipeData.
  const data = window.recipeData || { methods: [] };
  const methods = data.methods || [];
  const grinder = data.grinder || {};
  const baseUrl = window.siteBaseUrl || "";
  const pageUrl = (path) => (path ? baseUrl + path : "");
  const GROUPS = [
    { id: "mine", label: "My gear" },
    { id: "someday", label: "Someday" }
  ];

  const params = new URLSearchParams(location.search);
  let currentMethod = (methods.find((m) => m.id === params.get("method")) || methods[0] || {}).id;

  const methodsContainer = document.getElementById("methods");
  const recipeSelect = document.getElementById("recipe");
  const coffeeInput = document.getElementById("coffee");
  const doseField = document.getElementById("dose-field");
  const output = document.getElementById("output");
  const brewLogActions = document.getElementById("brew-log-actions");
  const markdownOutput = document.getElementById("brew-markdown-output");
  const copyButton = document.getElementById("copy-brew-log");
  const downloadButton = document.getElementById("download-brew-log");
  const brewerValue = document.getElementById("brewer-value");
  const grinderSelect = document.getElementById("grinder-select");
  const scaleSelect = document.getElementById("scale-select");
  const serverSelect = document.getElementById("server-select");
  const strengthInput = document.getElementById("strength");
  const acidityInput = document.getElementById("acidity");
  const sweetnessInput = document.getElementById("sweetness");
  const strengthValue = document.getElementById("strengthVal");
  const acidityValue = document.getElementById("acidityVal");
  const sweetnessValue = document.getElementById("sweetnessVal");

  if (!methodsContainer || !recipeSelect || !coffeeInput || !output || !brewerValue) {
    return;
  }

  function getMethodById(methodId) {
    return methods.find((method) => method.id === methodId);
  }

  function getCurrentRecipe() {
    const method = getMethodById(currentMethod);
    return method ? method.recipes.find((r) => r.id === recipeSelect.value) : null;
  }

  function getCurrentBrewerName() {
    const method = getMethodById(currentMethod);
    return method ? method.gear || method.name : "";
  }

  function resetGeneratedLog() {
    markdownOutput.style.display = "none";
    markdownOutput.textContent = "";
    copyButton.style.display = "none";
    downloadButton.style.display = "none";
  }

  function renderMethodButtons() {
    methodsContainer.innerHTML = "";
    GROUPS.forEach((group) => {
      const groupMethods = methods.filter((m) => (m.group || "mine") === group.id);
      if (!groupMethods.length) return;
      const label = document.createElement("span");
      label.className = "method-group";
      label.textContent = group.label;
      methodsContainer.appendChild(label);
      const row = document.createElement("div");
      row.className = "method-row";
      methodsContainer.appendChild(row);
      groupMethods.forEach((method) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `method${method.id === currentMethod ? " active" : ""}${group.id === "someday" ? " someday" : ""}`;
        button.dataset.method = method.id;
        button.textContent = `${method.icon || ""} ${method.name}`.trim();
        button.setAttribute("aria-pressed", method.id === currentMethod ? "true" : "false");
        button.addEventListener("click", () => {
          currentMethod = method.id;
          renderMethodButtons();
          loadRecipes();
          brewerValue.value = getCurrentBrewerName();
          calculate();
        });
        row.appendChild(button);
      });
    });
    // Scroll only the chip row (not the page) so the active chip is visible on phones
    const active = methodsContainer.querySelector(".method.active");
    if (active) {
      const row = active.parentElement;
      row.scrollLeft = Math.max(0, active.offsetLeft - row.offsetLeft - 16);
    }
  }

  function loadRecipes(selectedId) {
    const method = getMethodById(currentMethod);
    recipeSelect.innerHTML = "";
    (method ? method.recipes : []).forEach((recipe) => {
      const option = document.createElement("option");
      option.value = recipe.id;
      option.textContent = recipe.event && /champion/i.test(recipe.event) ? `🏆 ${recipe.name}` : recipe.name;
      recipeSelect.appendChild(option);
    });
    if (selectedId && method && method.recipes.some((r) => r.id === selectedId)) recipeSelect.value = selectedId;
    applyRecipeDefaults();
  }

  // Each recipe's reference dose becomes the starting dose; fixed recipes hide the dose field.
  function applyRecipeDefaults() {
    const recipe = getCurrentRecipe();
    if (!recipe) return;
    doseField.hidden = Boolean(recipe.fixed);
    if (!recipe.fixed) coffeeInput.value = recipe.dose;
  }

  function syncSliderLabels() {
    strengthValue.textContent = strengthInput.value;
    acidityValue.textContent = acidityInput.value;
    sweetnessValue.textContent = sweetnessInput.value;
  }

  const round = (n) => Math.round(n);
  const ratioLabel = (dose, water) => `1:${(water / dose).toFixed(1).replace(/\.0$/, "")}`;
  const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  // Cumulative scale targets are rounded from the published fractions, so each target is
  // exact for the chosen dose and the "add" column always sums to the total.
  function renderRecipe(method, recipe, coffee) {
    const scale = recipe.fixed ? 1 : coffee / recipe.dose;
    const total = recipe.fixed ? recipe.water : round(recipe.water * scale);
    const items = [];
    if (recipe.fixed) {
      if (recipe.dose) items.push(`Coffee: ${recipe.dose} g`);
      if (recipe.water) items.push(`Water: ${recipe.water} ml`);
    } else {
      items.push(`Coffee: ${coffee} g`);
      items.push(`${recipe.output ? "Yield (in the cup)" : "Total water"}: ${total} g`);
      items.push(`Ratio: ${ratioLabel(coffee, total)}`);
    }
    if (recipe.bypass) items.push(`Bypass water: ${round(recipe.bypass * scale)} g (in the server, not the brewer)`);
    if (recipe.ice) items.push(`Ice: ${round(recipe.ice * scale)} g (in the server)`);
    if (recipe.yield) items.push(`Yield: ${recipe.yield}`);
    if (recipe.temp) items.push(`Water temp: ${recipe.temp}`);
    if (recipe.grind) items.push(`Grind: ${recipe.grind}`);
    const clicks = recipe.clicks || method.clicks;
    if (clicks) items.push(`${grinder.name || "Grinder"}: ${clicks}${/^\d/.test(clicks) ? " clicks" : ""}`);
    if (recipe.time) items.push(`Brew time: ${recipe.time}`);

    let prev = 0;
    let pourNo = 0;
    const rows = (recipe.steps || []).map((step) => {
      const at = step.at || "";
      if (step.to === undefined || recipe.fixed) {
        return `<tr class="step-action"><td>${esc(at)}</td><td colspan="2">${esc(step.note || "")}</td><td></td></tr>`;
      }
      pourNo++;
      const target = round(total * step.to);
      const add = target - prev;
      prev = target;
      return `<tr><td>${esc(at)}</td><td>${esc(step.note || `Pour ${pourNo}`)}</td><td>${pourNo === 1 ? add : `+${add}`} g</td><td><strong>${target} g</strong></td></tr>`;
    }).join("");
    const pours = (recipe.steps || []).filter((s) => s.to !== undefined && !recipe.fixed).length;

    const chips = [
      recipe.event ? `<span class="chip chip-method">${esc(recipe.event)}</span>` : "",
      `<span class="chip conf-${esc(recipe.confidence)}" title="How well the numbers are sourced">${recipe.confidence === "high" ? "✓ Well sourced" : recipe.confidence === "medium" ? "≈ Partly sourced" : "⚠ Loosely sourced"}</span>`
    ].join("");

    return `
      <h3>${esc(recipe.name)}</h3>
      <p class="recipe-meta">${recipe.author ? `<span>${esc(recipe.author)}</span>` : ""}<span class="chip-row">${chips}</span></p>
      ${recipe.warn ? `<p class="recipe-warn">⚠ ${esc(recipe.warn)}</p>` : ""}
      <ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      ${rows ? `
      <p class="pour-caption"><strong>${pours > 1 ? "Scale targets (cumulative)" : "Steps"}</strong>${pours > 1 ? " — pour up to each number, don't add in your head:" : ""}</p>
      <table class="pour-schedule">
        <thead><tr><th>Time</th><th>Step</th><th>Add</th><th>Scale reads</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>` : ""}
      ${recipe.serve ? `<p><strong>Serve:</strong> ${esc(recipe.serve)}</p>` : ""}
      ${recipe.tips ? `<p><strong>Tips:</strong> ${esc(recipe.tips)}</p>` : ""}
      <p class="recipe-source"><a href="${esc(recipe.source)}" target="_blank" rel="noopener">Source ↗</a>${method.page ? ` · <a href="${esc(pageUrl(method.page))}">All ${esc(method.name)} recipes</a>` : ""}</p>
    `;
  }

  function calculate() {
    const method = getMethodById(currentMethod);
    const recipe = getCurrentRecipe();
    if (!method || !recipe) {
      output.innerHTML = "<strong>Pick a method and recipe.</strong>";
      brewLogActions.style.display = "none";
      return;
    }
    const coffee = Number.parseFloat(coffeeInput.value);
    if (!recipe.fixed && (!Number.isFinite(coffee) || coffee <= 0)) {
      output.innerHTML = "<strong>Please enter a valid coffee dose.</strong>";
      brewLogActions.style.display = "none";
      resetGeneratedLog();
      return;
    }
    output.innerHTML = renderRecipe(method, recipe, coffee);
    brewLogActions.style.display = "block";
    resetGeneratedLog();
    history.replaceState(null, "", `?method=${encodeURIComponent(method.id)}&recipe=${encodeURIComponent(recipe.id)}`);
  }
  window.calculate = calculate;

  renderMethodButtons();
  loadRecipes(params.get("recipe"));
  brewerValue.value = getCurrentBrewerName();
  syncSliderLabels();
  calculate();

  recipeSelect.addEventListener("change", () => { applyRecipeDefaults(); calculate(); });
  coffeeInput.addEventListener("input", calculate);
  strengthInput.addEventListener("input", syncSliderLabels);
  acidityInput.addEventListener("input", syncSliderLabels);
  sweetnessInput.addEventListener("input", syncSliderLabels);

  window.openBrewLogBuilder = function () {
    const builder = document.getElementById("brew-log-builder");
    const beanSelect = document.getElementById("bean-select");

    builder.style.display = "block";
    beanSelect.innerHTML = "";

    const beans = Array.isArray(window.beans) ? window.beans : [];

    beans.forEach((bean) => {
      const option = document.createElement("option");
      option.value = bean.title;
      option.textContent = bean.title;
      beanSelect.appendChild(option);
    });

    brewerValue.value = getCurrentBrewerName();
  };

  window.generateBrewMarkdown = function () {
    const bean = document.getElementById("bean-select").value;
    const strength = document.getElementById("strength").value;
    const acidity = document.getElementById("acidity").value;
    const sweetness = document.getElementById("sweetness").value;
    const notes = document.getElementById("notes").value;
    const brewer = brewerValue.value || getCurrentBrewerName();
    const grinderName = grinderSelect.value;
    const scale = scaleSelect.value;
    const server = serverSelect.value;

    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    const recipe = getCurrentRecipe();
    const recipeName = recipe ? recipe.name : recipeSelect.options[recipeSelect.selectedIndex].text;

    const brewParams = Array.from(output.querySelectorAll("li"))
      .map((item) => `- ${item.textContent}`)
      .join("\n");

    // Keep the cumulative pour schedule in the log as a Markdown table.
    const scheduleTable = output.querySelector("table.pour-schedule");
    let pourSchedule = "";
    if (scheduleTable) {
      const headers = Array.from(scheduleTable.querySelectorAll("thead th")).map(
        (cell) => cell.textContent.trim()
      );
      const bodyRows = Array.from(scheduleTable.querySelectorAll("tbody tr")).map((row) => {
        const cells = Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent.trim());
        while (cells.length < headers.length) cells.splice(2, 0, "");
        return "| " + cells.join(" | ") + " |";
      });
      pourSchedule = [
        "",
        "**Pour schedule (cumulative scale targets)**",
        "",
        "| " + headers.join(" | ") + " |",
        "| " + headers.map(() => "---").join(" | ") + " |",
        ...bodyRows
      ].join("\n");
    }

    const markdown = `
---
layout: brew
title: ${recipeName} — ${bean}
date: ${today}
---

This entry documents my **${recipeName}** brew and tasting notes for **${bean}**.

---

## 📦 Coffee Details
- **Bean**: ${bean}

---

## ⚖️ Brew Recipe
${brewParams}
${pourSchedule}
${recipe && recipe.source ? `\nRecipe source: ${recipe.source}\n` : ""}
---

## 🧰 Brewing Equipment
- **Brewer**: ${brewer}
- **Grinder**: ${grinderName}
- **Scale**: ${scale}
- **Server / Cup**: ${server}

---

## 👅 Cup Profile & Notes
- **Strength**: ${strength}
- **Acidity**: ${acidity}
- **Sweetness**: ${sweetness}

${notes}

---

## 📝 Journal Thoughts
Overall impressions, adjustments, and reflections from this brew.
`.trim();

    markdownOutput.style.display = "block";
    markdownOutput.textContent = markdown;
    copyButton.style.display = "inline-block";
    downloadButton.style.display = "inline-block";
  };
});

window.downloadBrewLog = function () {
  const pre = document.getElementById("brew-markdown-output");
  const markdown = pre.textContent.trim();

  if (!markdown) {
    return;
  }

  const firstLine = markdown
    .split("\n")
    .find((line) => line.startsWith("title:"));
  const fileBase = firstLine
    ? firstLine
        .replace("title:", "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    : `brew-log-${new Date().toISOString().split("T")[0]}`;

  const blob = new Blob([markdown + "\n"], {
    type: "text/markdown;charset=utf-8"
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = `${fileBase || "brew-log"}.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
};

window.copyBrewLog = function () {
  const pre = document.getElementById("brew-markdown-output");
  const button = document.getElementById("copy-brew-log");

  navigator.clipboard.writeText(pre.textContent).then(
    () => {
      const originalText = button.textContent;
      button.textContent = "Copied ✓";
      setTimeout(() => { button.textContent = originalText; }, 1500);
    },
    () => {
      button.textContent = "Copy failed";
      setTimeout(() => { button.textContent = "Copy"; }, 1500);
    }
  );
};
