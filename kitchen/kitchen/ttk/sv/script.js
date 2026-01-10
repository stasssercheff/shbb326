// ================= ЯЗЫК =================
function getLang() {
  return localStorage.getItem("lang") || "ru";
}

// ================= НАВИГАЦИЯ =================
function goHome() {
  location.href =
    location.origin + "/" + location.pathname.split("/")[1] + "/";
}

function goBack() {
  const path = location.pathname;
  const parent = path.substring(0, path.lastIndexOf("/"));
  const upper = parent.substring(0, parent.lastIndexOf("/"));
  location.href = upper + "/index.html";
}

// ================= DATA =================
const DATA_FILE = "data/sv.json";
let svData = null;

// ================= LOAD =================
function loadSousVide() {
  fetch(DATA_FILE)
    .then(r => r.json())
    .then(j => {
      svData = j;
      renderSousVide();
    })
    .catch(e => console.error("SV load error:", e));
}

// ================= HELPERS =================
function ingredientName(ing) {
  const lang = getLang();
  if (lang === "ru") return ing["Продукт"];
  return ing["Ingredient"]; // en + vi
}

function tableHeaders() {
  const lang = getLang();
  if (lang === "ru")
    return ["#", "Продукт", "Гр/шт", "Темп °C", "Время", "Описание"];
  if (lang === "vi")
    return ["#", "Nguyên liệu", "Gr/Pcs", "Nhiệt °C", "Thời gian", "Mô tả"];
  return ["#", "Ingredient", "Gr/Pcs", "Temp °C", "Time", "Process"];
}

// ================= RENDER =================
function renderSousVide() {
  if (!svData) return;

  const lang = getLang();
  const container = document.querySelector(".table-container");
  if (!container) return;

  container.innerHTML = "";

  svData.recipes.forEach(dish => {
    const card = document.createElement("div");
    card.className = "dish-card";

    // ---- TITLE (СТРОКА, БЕЗ ЯЗЫКОВ) ----
    const title = document.createElement("div");
    title.className = "dish-title";
    title.textContent = dish.title;
    card.appendChild(title);

    const table = document.createElement("table");
    table.className = "sv-table";

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // ---- HEADERS ----
    const trh = document.createElement("tr");
    tableHeaders().forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      trh.appendChild(th);
    });
    thead.appendChild(trh);

    // ---- ROWS ----
    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement("tr");

      const process = dish.process.find(
        p => i + 1 >= p.range[0] && i + 1 <= p.range[1]
      );

      const desc =
        process?.[lang] ||
        process?.ru ||
        "";

      tr.innerHTML = `
        <td>${ing["№"]}</td>
        <td>${ingredientName(ing)}</td>
        <td>${ing["Шт/гр"]}</td>
        <td>${ing["Температура С / Temperature C"]}</td>
        <td>${ing["Время мин / Time"]}</td>
        <td>${desc}</td>
      `;

      tbody.appendChild(tr);
    });

    table.append(thead, tbody);
    card.appendChild(table);
    container.appendChild(card);
  });
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  loadSousVide();

  // 🔴 РЕАЛЬНО РАБОТАЕТ С ТВОИМ lang.js
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setTimeout(renderSousVide, 0);
    });
  });
});
