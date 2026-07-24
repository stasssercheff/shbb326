// ================== ЯЗЫК ==================
function getLang() {
  return localStorage.getItem("lang") || "ru";
}

// ================== НАВИГАЦИЯ ==================
function goHome() {
  location.href = location.origin + "/" + location.pathname.split("/")[1] + "/";
}

function goBack() {
  const path = location.pathname;
  const parent = path.substring(0, path.lastIndexOf("/"));
  const upper = parent.substring(0, parent.lastIndexOf("/"));
  location.href = upper + "/index.html";
}

// ================== DATA ==================
const DATA_FILE = "data/preps.json";
let cachedData = null;

// ================== LOAD JSON ==================
function loadData() {
  if (cachedData) {
    renderPreps(cachedData);
    return;
  }

  fetch(DATA_FILE)
    .then(r => r.json())
    .then(data => {
      cachedData = data;
      renderPreps(data);
    })
    .catch(err => console.error("JSON load error:", err));
}

// ================== RENDER ==================
function renderPreps(data) {
  const lang = getLang();
  const container = document.querySelector(".table-container");
  if (!container) return;

  container.innerHTML = "";

  // Оглавление с якорями на карточки
  const toc = document.createElement("nav");
  toc.className = "ttk-toc";
  toc.setAttribute("aria-label", "TOC");

  const tocTitle = document.createElement("div");
  tocTitle.className = "ttk-toc-title";
  tocTitle.setAttribute("data-i18n", "ttk_toc");
  tocTitle.textContent =
    (typeof translations !== "undefined" && translations.ttk_toc?.[lang]) ||
    (lang === "en" ? "Contents" : lang === "vi" ? "Mục lục" : "Оглавление");
  toc.appendChild(tocTitle);

  const tocList = document.createElement("ol");
  tocList.className = "ttk-toc-list";
  toc.appendChild(tocList);
  container.appendChild(toc);

  const recipes = (data.recipes || []).filter(dish => dish.enabled !== false);

  recipes.forEach((dish, index) => {
    const cardId = `dish-${index}`;
    const dishName = dish.name?.[lang] || dish.name?.ru || dish.title || "";

    const tocItem = document.createElement("li");
    const tocLink = document.createElement("a");
    tocLink.href = `#${cardId}`;
    tocLink.textContent = dishName;
    tocItem.appendChild(tocLink);
    tocList.appendChild(tocItem);

    const card = document.createElement("div");
    card.className = "dish-card";
    card.id = cardId;

    // ---- TITLE ----
    const title = document.createElement("div");
    title.className = "dish-title";
    title.textContent = dishName;
    card.appendChild(title);

    // ---- TABLE ----
    const table = document.createElement("table");
    table.className = "pf-table";

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headers =
      lang === "ru"
        ? ["#", "Продукт", "Гр/шт", "Описание"]
        : lang === "vi"
          ? ["#", "Nguyên liệu", "Gr/Pcs", "Mô tả"]
          : ["#", "Ingredient", "Gr/Pcs", "Process"];

    const trh = document.createElement("tr");
    headers.forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      trh.appendChild(th);
    });
    thead.appendChild(trh);

    // ---- ROWS ----
    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement("tr");

      // №
      const tdNum = document.createElement("td");
      tdNum.textContent = ing["№"] ?? i + 1;

      // NAME (RU / EN / VI)
const tdName = document.createElement("td");

if (lang === "ru") {
  tdName.textContent = ing["Продукт"] || "";
} else if (lang === "vi") {
  tdName.textContent = ing["Ingredient_vi"] || ing["Ingredient"] || ing["Продукт"] || "";
} else {
  tdName.textContent = ing["Ingredient"] || ing["Продукт"] || "";
}

      // AMOUNT
      const tdAmount = document.createElement("td");
      tdAmount.textContent = ing["Шт/гр"];
      tdAmount.dataset.base = ing["Шт/гр"];

      // ==== KEY INGREDIENT (ПЕРЕСЧЁТ) ====
      if (ing["Продукт"] === dish.key) {
        tdAmount.contentEditable = true;
        tdAmount.classList.add("key-ingredient");

        tdAmount.addEventListener("input", () => {
          const newVal = parseFloat(tdAmount.textContent.replace(/[^0-9.]/g, "")) || 0;
          const baseVal = parseFloat(tdAmount.dataset.base) || 1;
          const factor = newVal / baseVal;

          tbody.querySelectorAll("tr").forEach(r => {
            const cell = r.children[2];
            if (cell && cell !== tdAmount) {
              const base = parseFloat(cell.dataset.base) || 0;
              cell.textContent = Math.round(base * factor);
            }
          });
        });

        tdAmount.addEventListener("keydown", e => {
          if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight/.test(e.key)) {
            e.preventDefault();
          }
        });
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);

      // DESCRIPTION
      if (i === 0) {
        const tdDesc = document.createElement("td");
        tdDesc.textContent =
          dish.process?.[lang] ||
          dish.process?.ru ||
          "";
        tdDesc.rowSpan = dish.ingredients.length;
        tr.appendChild(tdDesc);
      }

      tbody.appendChild(tr);
    });

    table.append(thead, tbody);
    card.appendChild(table);
    container.appendChild(card);
  });
}

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
  loadData();

  // 🔴 ВАЖНО: перерисовка при смене языка
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setTimeout(() => {
        if (cachedData) renderPreps(cachedData);
      }, 0);
    });
  });
});
