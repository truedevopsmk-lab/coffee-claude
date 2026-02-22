document.addEventListener("DOMContentLoaded", () => {
  const methods = [
    {
      id: "v60",
      name: "V60",
      recipes: [
        {
          id: "tetsu",
          name: "Tetsu Kasuya 4:6",
          render: (coffee) => {
            const ratio = "1:16.6";
            const temp = "90–92°C";
            const total = Math.round(coffee * 16.6);
            const first = Math.round(total * 0.4);
            const second = total - first;

            return `
              <h3>Tetsu Kasuya 4:6 (V60)</h3>
              <ul>
                <li>Coffee: ${coffee} g</li>
                <li>Total water: ${total} g</li>
                <li>Ratio: ${ratio}</li>
                <li>Water temp: ${temp}</li>
                <li>Pour 1: ${Math.round(first * 0.25)} g</li>
                <li>Pour 2: ${Math.round(first * 0.75)} g</li>
                <li>Pour 3–5: ${Math.round(second / 3)} g each</li>
              </ul>
              <p><strong>Why this works:</strong><br>
              The first 40% controls sweetness vs acidity, while the final pours
              tune strength. Lower temperatures preserve clarity.</p>
            `;
          }
        },
        {
          id: "hoffmann",
          name: "Hoffmann V60",
          render: (coffee) => {
            const ratio = "1:16.7";
            const temp = "96–98°C";
            const total = Math.round(coffee * 16.67);
            const bloom = Math.round(coffee * 2);

            return `
              <h3>Hoffmann V60</h3>
              <ul>
                <li>Coffee: ${coffee} g</li>
                <li>Total water: ${total} g</li>
                <li>Ratio: ${ratio}</li>
                <li>Water temp: ${temp}</li>
                <li>Bloom: ${bloom} g (30–45 sec)</li>
                <li>Single continuous pour</li>
              </ul>
              <p><strong>Why this works:</strong><br>
              High temperature and a single pour maximize extraction
              uniformity and clarity.</p>
            `;
          }
        }
      ]
    },
    {
      id: "aeropress",
      name: "AeroPress",
      recipes: [
        {
          id: "ap-standard",
          name: "AeroPress (Inverted)",
          render: (coffee) => {
            const ratio = "1:15";
            const temp = "85–90°C";
            const water = Math.round(coffee * 15);

            return `
              <h3>AeroPress (Inverted)</h3>
              <ul>
                <li>Coffee: ${coffee} g</li>
                <li>Water: ${water} g</li>
                <li>Ratio: ${ratio}</li>
                <li>Water temp: ${temp}</li>
                <li>Grind: Medium-fine</li>
                <li>Brew time: 2:00</li>
              </ul>
              <p><strong>Why this works:</strong><br>
              Immersion brewing allows even extraction with lower bitterness,
              producing a rich, balanced cup.</p>
            `;
          }
        },
        {
          id: "ap-concentrate",
          name: "AeroPress Concentrate",
          render: (coffee) => {
            const ratio = "1:4 (brew) + dilution";
            const temp = "85–90°C";
            const brewWater = Math.round(coffee * 4);
            const dilution = Math.round(coffee * 8);

            return `
              <h3>AeroPress Concentrate</h3>
              <ul>
                <li>Coffee: ${coffee} g</li>
                <li>Brew water: ${brewWater} g</li>
                <li>Dilution water: ${dilution} g</li>
                <li>Effective ratio: ${ratio}</li>
                <li>Water temp: ${temp}</li>
              </ul>
              <p><strong>Why this works:</strong><br>
              Strong extraction followed by dilution gives body
              without over-extracting.</p>
            `;
          }
        }
      ]
    },
    {
      id: "mokapot",
      name: "Moka Pot",
      recipes: [
        {
          id: "moka-classic",
          name: "Moka Pot (Classic)",
          render: (coffee) => {
            const ratio = "≈1:10–1:15 (by yield)";
            const temp = "Boiling water in base";
            const water = Math.round(coffee * 15);

            return `
              <h3>Moka Pot (Classic)</h3>
              <ul>
                <li>Coffee: ${coffee} g</li>
                <li>Water (boiler): ${water} g</li>
                <li>Ratio: ${ratio}</li>
                <li>Water temp: ${temp}</li>
                <li>Grind: Medium-fine (coarser than espresso)</li>
                <li>Heat: Medium–low</li>
              </ul>
              <p><strong>Why this works:</strong><br>
              Starting with hot water and gentle heat reduces bitterness
              and produces a sweeter, fuller-bodied cup.</p>
            `;
          }
        }
      ]
    },
    {
      id: "frenchpress",
      name: "French Press",
      recipes: [
        {
          id: "fp-classic",
          name: "French Press (Classic)",
          render: (coffee) => {
            const ratio = "1:15";
            const temp = "93–96°C";
            const water = Math.round(coffee * 15);

            return `
              <h3>French Press (Classic)</h3>
              <ul>
                <li>Coffee: ${coffee} g</li>
                <li>Water: ${water} g</li>
                <li>Ratio: ${ratio}</li>
                <li>Water temp: ${temp}</li>
                <li>Grind: Coarse</li>
                <li>Steep time: 4:00</li>
              </ul>
              <p><strong>Why this works:</strong><br>
              Full-immersion with coarse grind yields rich body and low astringency.</p>
            `;
          }
        }
      ]
    },
    {
      id: "chemex",
      name: "Chemex",
      recipes: [
        {
          id: "chemex-classic",
          name: "Chemex (Classic 1:15)",
          render: (coffee) => {
            const ratio = "1:15";
            const total = Math.round(coffee * 15);

            return `
              <h3>Chemex (Classic)</h3>
              <ul>
                <li>Coffee: ${coffee} g</li>
                <li>Total water: ${total} g</li>
                <li>Ratio: ${ratio}</li>
                <li>Water temp: 94–96°C</li>
                <li>Bloom: ${Math.round(coffee * 2.5)} g (45 sec)</li>
                <li>Brew time: 4:00–5:00</li>
              </ul>
              <p><strong>Why this works:</strong><br>
              Thicker filters reduce oils and fines for a clean, tea-like cup.</p>
            `;
          }
        }
      ]
    },
    {
      id: "b75",
      name: "B75",
      recipes: [
        {
          id: "b75-fast-flatbed",
          name: "B75 (Fast Flat-bed)",
          render: (coffee) => {
            const ratio = "1:15.5";
            const total = Math.round(coffee * 15.5);

            return `
              <h3>B75 (Fast Flat-bed)</h3>
              <ul>
                <li>Coffee: ${coffee} g</li>
                <li>Total water: ${total} g</li>
                <li>Ratio: ${ratio}</li>
                <li>Water temp: 90–94°C</li>
                <li>Pour pattern: 4 pulses</li>
                <li>Brew time: 2:00–2:45</li>
              </ul>
              <p><strong>Why this works:</strong><br>
              The B75 flat-bed geometry and fast flow favor high clarity with sweetness.</p>
            `;
          }
        }
      ]
    },
    {
      id: "espresso",
      name: "Espresso",
      recipes: [
        {
          id: "espresso-standard",
          name: "Espresso (1:2)",
          render: (coffee) => {
            const ratio = "1:2";
            const yieldGrams = Math.round(coffee * 2);

            return `
              <h3>Espresso (Standard)</h3>
              <ul>
                <li>Dose: ${coffee} g</li>
                <li>Target yield: ${yieldGrams} g</li>
                <li>Ratio: ${ratio}</li>
                <li>Water temp: 92–94°C</li>
                <li>Pressure: 9 bar</li>
                <li>Shot time: 25–32 sec</li>
              </ul>
              <p><strong>Why this works:</strong><br>
              Balanced ratio and shot time target sweetness and structure.</p>
            `;
          }
        }
      ]
    },
    {
      id: "coldbrew",
      name: "Cold Brew",
      recipes: [
        {
          id: "cb-immersion",
          name: "Cold Brew (Immersion)",
          render: (coffee) => {
            const ratio = "1:8 concentrate";
            const water = Math.round(coffee * 8);

            return `
              <h3>Cold Brew (Immersion)</h3>
              <ul>
                <li>Coffee: ${coffee} g</li>
                <li>Water: ${water} g</li>
                <li>Ratio: ${ratio}</li>
                <li>Water temp: Room temp / cold</li>
                <li>Grind: Coarse</li>
                <li>Steep time: 12–16 hours</li>
              </ul>
              <p><strong>Why this works:</strong><br>
              Long cool extraction emphasizes chocolatey sweetness and low acidity.</p>
            `;
          }
        }
      ]
    }
  ];

  let currentMethod = methods[0].id;

  const methodsContainer = document.getElementById("methods");
  const recipeSelect = document.getElementById("recipe");
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

  if (
    !methodsContainer ||
    !recipeSelect ||
    !output ||
    !brewLogActions ||
    !markdownOutput ||
    !copyButton ||
    !downloadButton ||
    !brewerValue ||
    !grinderSelect ||
    !scaleSelect ||
    !serverSelect ||
    !strengthInput ||
    !acidityInput ||
    !sweetnessInput ||
    !strengthValue ||
    !acidityValue ||
    !sweetnessValue
  ) {
    return;
  }

  function getCurrentBrewerName() {
    const selectedMethod = getMethodById(currentMethod);
    return selectedMethod ? selectedMethod.name : "";
  }

  function getMethodById(methodId) {
    return methods.find((method) => method.id === methodId);
  }

  function resetGeneratedLog() {
    markdownOutput.style.display = "none";
    markdownOutput.textContent = "";
    copyButton.style.display = "none";
    downloadButton.style.display = "none";
  }

  function renderMethodButtons() {
    methodsContainer.innerHTML = "";

    methods.forEach((method) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "method";
      button.dataset.method = method.id;
      button.textContent = method.name;

      if (method.id === currentMethod) {
        button.classList.add("active");
      }

      button.addEventListener("click", () => {
        currentMethod = method.id;
        renderMethodButtons();
        loadRecipes();
        output.innerHTML = "<em>Select a method, recipe, and dose.</em>";
        brewLogActions.style.display = "none";
        brewerValue.value = getCurrentBrewerName();
        resetGeneratedLog();
      });

      methodsContainer.appendChild(button);
    });
  }

  function loadRecipes() {
    const selectedMethod = getMethodById(currentMethod);
    const methodRecipes = selectedMethod ? selectedMethod.recipes : [];

    recipeSelect.innerHTML = "";

    methodRecipes.forEach((recipe) => {
      const option = document.createElement("option");
      option.value = recipe.id;
      option.textContent = recipe.name;
      recipeSelect.appendChild(option);
    });
  }

  function syncSliderLabels() {
    strengthValue.textContent = strengthInput.value;
    acidityValue.textContent = acidityInput.value;
    sweetnessValue.textContent = sweetnessInput.value;
  }

  renderMethodButtons();
  loadRecipes();
  brewerValue.value = getCurrentBrewerName();
  syncSliderLabels();

  strengthInput.addEventListener("input", syncSliderLabels);
  acidityInput.addEventListener("input", syncSliderLabels);
  sweetnessInput.addEventListener("input", syncSliderLabels);

  window.calculate = function () {
    const selectedMethod = getMethodById(currentMethod);
    const recipeId = recipeSelect.value;
    const coffeeInput = document.getElementById("coffee").value;
    const coffee = Number.parseFloat(coffeeInput);

    if (!Number.isFinite(coffee) || coffee <= 0) {
      output.innerHTML = "<strong>Please enter a valid coffee dose.</strong>";
      brewLogActions.style.display = "none";
      resetGeneratedLog();
      return;
    }

    if (!selectedMethod) {
      output.innerHTML = "<strong>Please select a valid brewing method.</strong>";
      brewLogActions.style.display = "none";
      resetGeneratedLog();
      return;
    }

    const selectedRecipe = selectedMethod.recipes.find(
      (recipe) => recipe.id === recipeId
    );

    if (!selectedRecipe) {
      output.innerHTML = "<strong>Please select a valid recipe.</strong>";
      brewLogActions.style.display = "none";
      resetGeneratedLog();
      return;
    }

    output.innerHTML = selectedRecipe.render(coffee);
    brewLogActions.style.display = "block";
    resetGeneratedLog();
  };

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
    const grinder = grinderSelect.value;
    const scale = scaleSelect.value;
    const server = serverSelect.value;

    const today = new Date().toISOString().split("T")[0];
    const recipeName = recipeSelect.options[recipeSelect.selectedIndex].text;

    const brewParams = Array.from(output.querySelectorAll("li"))
      .map((item) => `- ${item.textContent}`)
      .join("\n");

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

---

## 🧰 Brewing Equipment
- **Brewer**: ${brewer}
- **Grinder**: ${grinder}
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

  navigator.clipboard.writeText(pre.textContent).then(
    () => {
      const originalText = button.textContent;
      button.textContent = "Copied ✓";

      setTimeout(() => {
        button.textContent = originalText;
      }, 1500);
    },
    () => {
      button.textContent = "Copy failed";

      setTimeout(() => {
        button.textContent = "Copy Brew Log";
      }, 1500);
    }
  );
};
