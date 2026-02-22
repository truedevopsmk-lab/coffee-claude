document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("site-search-input");
  const resultsContainer = document.getElementById("site-search-results");
  const status = document.getElementById("site-search-status");

  if (!input || !resultsContainer || !status) {
    return;
  }

  const pages = Array.isArray(window.searchIndex) ? window.searchIndex : [];

  function renderResults(results, query) {
    resultsContainer.innerHTML = "";

    if (!query) {
      status.textContent = "Type to search brews, beans, methods, and tools.";
      return;
    }

    if (results.length === 0) {
      status.textContent = `No results found for "${query}".`;
      return;
    }

    status.textContent = `${results.length} result${results.length === 1 ? "" : "s"} for "${query}".`;

    results.forEach((page) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const snippet = document.createElement("p");

      link.href = page.url;
      link.textContent = page.title || page.url;

      snippet.className = "search-snippet";
      snippet.textContent = page.content.slice(0, 140) + (page.content.length > 140 ? "…" : "");

      item.appendChild(link);
      item.appendChild(snippet);
      resultsContainer.appendChild(item);
    });
  }

  function search(query) {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      renderResults([], "");
      return;
    }

    const terms = normalized.split(/\s+/).filter(Boolean);
    const results = pages.filter((page) => {
      const haystack = `${page.title} ${page.content}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });

    renderResults(results.slice(0, 20), query.trim());
  }

  input.addEventListener("input", (event) => {
    search(event.target.value);
  });
});
