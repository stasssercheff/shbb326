// Пути к данным
const dataFile = 'data/preps.json';

function loadData(callback) {
  const baseUrl = window.location.origin + window.location.pathname;
  const currentFolder = baseUrl.substring(0, baseUrl.lastIndexOf("/") + 1);
  const fullPath = new URL(dataFile, currentFolder).href;

  fetch(fullPath)
    .then(res => res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`))
    .then(data => callback(data))
    .catch(err => console.error('Ошибка загрузки Preps:', err));
}

// Таблица Preps
function createTable(data) {
  const container = document.querySelector('.table-container');
  container.innerHTML = '';

  (data.recipes || data).forEach(dish => {
    const card = document.createElement('div');
    card.className = 'dish-card';

    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent = dish.name?.[currentLang] || dish.name?.ru || dish.title;
    card.appendChild(title);

    const table = document.createElement('table');
    table.className = 'pf-table';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = currentLang === 'ru'
      ? ['#', 'Продукт', 'Гр/шт', 'Описание']
      : currentLang === 'vi'
        ? ['#', 'Nguyên liệu', 'Gr/Pcs', 'Cách làm']
        : ['#', 'Ingredient', 'Gr/Pcs', 'Process'];

    const trHead = document.createElement('tr');
    headers.forEach(h => { const th = document.createElement('th'); th.textContent = h; trHead.appendChild(th); });
    thead.appendChild(trHead);

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i+1}</td>
        <td>${currentLang==='ru'?ing['Продукт']:currentLang==='vi'?ing['Ingredient_vi']||ing['Ingredient']||ing['Продукт']:ing['Ingredient']||ing['Продукт']}</td>
        <td>${ing['Шт/гр']}</td>
        ${i===0?`<td rowspan="${dish.ingredients.length}">${dish.process?.[currentLang]||dish.process?.ru||''}</td>`:''}
      `;
      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    card.appendChild(table);
    container.appendChild(card);
  });
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  loadData(createTable);
  if (typeof updateI18nText === "function") updateI18nText();
});
