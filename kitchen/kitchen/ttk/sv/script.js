// ==== ТЕКУЩИЙ ЯЗЫК ====
window.currentLang = window.currentLang || 'ru';

// ==== НАВИГАЦИЯ ====
function goHome() {
  location.href = location.origin + '/' + location.pathname.split('/')[1] + '/';
}

function goBack() {
  const path = location.pathname;
  const parent = path.substring(0, path.lastIndexOf('/'));
  const upper = parent.substring(0, parent.lastIndexOf('/'));
  location.href = upper + '/index.html';
}

// ==== DATA FILE ====
const DATA_FILE = 'data/sv.json';

// ==== LOAD JSON ====
function loadData(callback) {
  const base = location.origin + location.pathname;
  const folder = base.substring(0, base.lastIndexOf('/') + 1);
  const fullPath = new URL(DATA_FILE, folder).href;

  fetch(fullPath)
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(j => callback(j))
    .catch(e => console.error('Sous-Vide load error:', e));
}

// ==== RENDER SOUS-VIDE ====
function renderSousVide(data) {
  const container = document.querySelector('.table-container');
  container.innerHTML = '';

  data.recipes.forEach(dish => {
    const card = document.createElement('div');
    card.className = 'dish-card';

    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent = dish.name?.[currentLang] || dish.name?.ru || dish.title;
    card.appendChild(title);

    const table = document.createElement('table');
    table.className = 'sv-table';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers =
      currentLang === 'ru'
        ? ['#', 'Продукт', 'Гр/шт', 'Темп °C', 'Время', 'Описание']
        : currentLang === 'vi'
          ? ['#', 'Nguyên liệu', 'Gr/Pcs', 'Temp °C', 'Time', 'Cách làm']
          : ['#', 'Ingredient', 'Gr/Pcs', 'Temp °C', 'Time', 'Process'];

    const trHead = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    dish.ingredients.forEach((ing, i) => {
      const desc =
        dish.process.find(p => i + 1 >= p.range[0] && i + 1 <= p.range[1])?.[currentLang]
        || dish.process.find(p => i + 1 >= p.range[0] && i + 1 <= p.range[1])?.ru
        || '';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${ing['№']}</td>
        <td>${
          currentLang === 'ru'
            ? ing['Продукт']
            : currentLang === 'vi'
              ? ing['Ingredient_vi'] || ing['Ingredient'] || ing['Продукт']
              : ing['Ingredient'] || ing['Продукт']
        }</td>
        <td>${ing['Шт/гр']}</td>
        <td>${ing['Температура С / Temperature C'] || ''}</td>
        <td>${ing['Время мин / Time'] || ''}</td>
        <td>${desc}</td>
      `;
      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    card.appendChild(table);
    container.appendChild(card);
  });
}

// ==== INIT ====
function renderPage() {
  loadData(renderSousVide);
}

document.addEventListener('DOMContentLoaded', () => {
  renderPage();
  if (typeof updateI18nText === 'function') updateI18nText();
});

// ==== RE-RENDER ON LANGUAGE CHANGE ====
document.addEventListener('languageChanged', () => {
  renderPage();
});
