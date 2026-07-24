
// На главную
function goHome() {
  location.href = location.origin + '/' + location.pathname.split('/')[1] + '/';
}

// На уровень выше (одну папку вверх)
function goBack() {
    const currentPath = window.location.pathname;
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
    const upperPath = parentPath.substring(0, parentPath.lastIndexOf("/"));
    window.location.href = upperPath + "/index.html";
}


const dataFiles = {
  Preps: 'data/preps.json'
};

// Загрузка JSON
function loadData(sectionName, callback) {
  fetch(dataFiles[sectionName])
    .then(res => res.json())
    .then(data => callback(data))
    .catch(err => console.error(err));
}

// 🔄 Обновление таблицы при смене языка
function updateTablesByLang(lang) {
  currentLang = lang;
  renderSection('Preps');
}

// Отображение раздела
function renderSection(sectionName) {
  loadData(sectionName, data => createTable(data, sectionName));
}

// Название блюда с учётом языка
function getDishName(dish) {
  return dish.name?.[currentLang] || dish.name?.ru || dish.title || '';
}

// Создание таблицы
function createTable(data) {
  const tableContainer = document.querySelector('.table-container');
  tableContainer.innerHTML = '';

  // Оглавление с якорями на карточки
  const toc = document.createElement('nav');
  toc.className = 'ttk-toc';
  toc.setAttribute('aria-label', 'TOC');

  const tocTitle = document.createElement('div');
  tocTitle.className = 'ttk-toc-title';
  tocTitle.setAttribute('data-i18n', 'ttk_toc');
  tocTitle.textContent =
    (typeof translations !== 'undefined' && translations.ttk_toc?.[currentLang]) ||
    (currentLang === 'en' ? 'Contents' : currentLang === 'vi' ? 'Mục lục' : 'Оглавление');
  toc.appendChild(tocTitle);

  const tocList = document.createElement('ol');
  tocList.className = 'ttk-toc-list';
  toc.appendChild(tocList);
  tableContainer.appendChild(toc);

  const recipes = data.recipes.filter(dish => !dish.hidden);

  recipes.forEach((dish, index) => {
    const cardId = `dish-${index}`;
    const dishName = getDishName(dish);

    const tocItem = document.createElement('li');
    const tocLink = document.createElement('a');
    tocLink.href = `#${cardId}`;
    tocLink.textContent = dishName;
    tocItem.appendChild(tocLink);
    tocList.appendChild(tocItem);

    const card = document.createElement('div');
    card.className = 'dish-card';
    card.id = cardId;

    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent = dishName;
    card.appendChild(title);

    const table = document.createElement('table');
    table.className = 'pf-table';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = currentLang === 'ru'
      ? ['#', 'Продукт', 'Гр/шт', 'Описание']
      : ['#', 'Ingredient', 'Gr/Pcs', 'Process'];

    const trHead = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

      const tdName = document.createElement('td');
      tdName.textContent = currentLang === 'ru' ? ing['Продукт'] : ing['Ingredient'];

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing['Шт/гр'];
      tdAmount.dataset.base = ing['Шт/гр'];

      if (ing['Продукт'] === dish.key) {
        tdAmount.contentEditable = true;
        tdAmount.classList.add('key-ingredient');

        tdAmount.addEventListener('input', () => {
          let newVal = parseFloat(tdAmount.textContent.replace(/[^0-9.]/g, '')) || 0;
          if (parseFloat(tdAmount.dataset.base) === 0) tdAmount.dataset.base = 1;
          const factor = newVal / parseFloat(tdAmount.dataset.base);

          const rows = tdAmount.closest('table').querySelectorAll('tbody tr');
          rows.forEach(r => {
            const cell = r.cells[2];
            if (cell && cell !== tdAmount) {
              let base = parseFloat(cell.dataset.base) || 0;
              cell.textContent = Math.round(base * factor);
            }
          });
        });

        tdAmount.addEventListener('keydown', e => {
          if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight/.test(e.key)) {
            e.preventDefault();
          }
        });
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);

      const tdDesc = document.createElement('td');
      if (i === 0) {
        tdDesc.textContent = dish.process?.[currentLang] || "";
        tdDesc.rowSpan = dish.ingredients.length;
        tr.appendChild(tdDesc);
      }

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    card.appendChild(table);
    tableContainer.appendChild(card);
  });
}

// ✅ Инициализация
document.addEventListener('DOMContentLoaded', () => {
  renderSection('Preps');

  // Подключаемся к глобальному переключению языка
  const originalSwitchLang = window.switchLanguage;
  if (typeof originalSwitchLang === 'function') {
    window.switchLanguage = function (lang) {
      originalSwitchLang(lang);  // стандартное поведение lang.js
      updateTablesByLang(lang);  // плюс обновляем таблицы
    };
  }
});
