// ===== ЯЗЫК =====
let currentLang = localStorage.getItem("lang") || "ru";

// ===== ДАННЫЕ =====
let recipesData = [];
let currentRecipe = null;

// ===== ЗАГРУЗКА JSON =====
fetch("./recipes.json")
  .then(res => res.json())
  .then(data => {
    recipesData = data.recipes;
    renderRecipeList();
    applyLanguage();
  });

// ===== СПИСОК РЕЦЕПТОВ =====
function renderRecipeList() {
  const list = document.getElementById("recipe-list");
  list.innerHTML = "";

  recipesData.forEach((recipe, index) => {
    const btn = document.createElement("button");
    btn.textContent = recipe.name[currentLang];
    btn.onclick = () => selectRecipe(index);
    list.appendChild(btn);
  });
}

// ===== ВЫБОР РЕЦЕПТА =====
function selectRecipe(index) {
  currentRecipe = recipesData[index];
  renderRecipe();
}

// ===== ОТОБРАЖЕНИЕ РЕЦЕПТА =====
function renderRecipe() {
  if (!currentRecipe) return;

  // Название
  document.getElementById("recipe-title").textContent =
    currentRecipe.name[currentLang];

  // Процесс
  document.getElementById("process").textContent =
    currentRecipe.process[currentLang];

  // Таблица
  renderTable();
}

// ===== ТАБЛИЦА =====
function renderTable() {
  const tbody = document.querySelector("#ingredients tbody");
  tbody.innerHTML = "";

  currentRecipe.ingredients.forEach(row => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row["№"]}</td>
      <td>${getIngredientName(row)}</td>
      <td>${row["Шт/гр"]}</td>
    `;

    tbody.appendChild(tr);
  });
}

// ===== ИМЯ ИНГРИДИЕНТА =====
function getIngredientName(row) {
  if (currentLang === "ru") return row["Продукт"];
  if (currentLang === "en") return row["Ingredient"];
  if (currentLang === "vi") return row["Ingredient_vi"] || row["Ingredient"];
  return row["Продукт"];
}

// ===== СМЕНА ЯЗЫКА (БЕЗ ПЕРЕЗАГРУЗКИ) =====
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);

  renderRecipeList();
  renderRecipe();

  // уведомляем интерфейс
  document.dispatchEvent(new Event("languageChanged"));
}

// ===== КНОПКИ =====
document.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    setLanguage(btn.dataset.lang);
  });
});
