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
const DATA_FILE = 'data/preps.json';

// ==== LOAD JSON ====
function loadData(callback) {
  fetch(DATA_FILE)
    .then(r => r.json())
    .then(j => callback(j))
    .catch(e => console.error('Preps load error:', e));
}

// ==== RENDER PREPS ====
function renderPreps(data) {
  const container = document.querySelector('.table-container');
  container.innerHTML = '';

  (data.recipes || data).forEach(dish => {
    const card = document.createElement('div');
    card.className = 'dish-card';

    // ---- TITLE ----
    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent =
      dish.name?.[window.currentLang] ||
      dish.name?.ru ||
      dish.title;
    card.appendChild(title);

    // ---- TABLE ----
    const table = document.createElement('table');
    table.className = 'pf-table';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers =
      window.currentLang === 'ru'
        ? ['#', 'Продукт', 'Гр/шт', 'Описание']
        : window.currentLang === 'vi'
          ? ['#', 'Nguyên liệu', 'Gr/Pcs', 'Cách làm']
          : ['#', 'Ingredient', 'Gr/Pcs', 'Process'];

    const trHead = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    // ---- ROWS ----
    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = i + 1;

      const tdName = document.createElement('td');
      tdName.textContent =
        window.currentLang === 'ru'
          ? ing['Продукт']
          : ing['Ingredient'] || ing['Продукт'];

      const tdAmount = document.createElement('td');
      tdAmount.textContent = ing['Шт/гр'];
      tdAmount.dataset.base = ing['Шт/гр'];

      // === ПЕРЕСЧЁТ ПО КЛЮЧЕВОМУ ===
      if (ing['Продукт'] === dish.key) {
        tdAmount.contentEditable = true;
        tdAmount.classList.add('key-ingredient');

        tdAmount.addEventListener('input', () => {
          const newVal = parseFloat(tdAmount.textContent.replace(/[^0-9.]/g, '')) || 0;
          const baseVal = parseFloat(tdAmount.dataset.base) || 1;
          const factor = newVal / baseVal;

          tbody.querySelectorAll('tr').forEach(r => {
            const cell = r.cells[2];
            if (cell && cell !== tdAmount) {
              const base = parseFloat(cell.dataset.base) || 0;
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

      // ---- DESCRIPTION ----
      if (i === 0) {
        const tdDesc = document.createElement('td');
        tdDesc.textContent =
          dish.process?.[window.currentLang] ||
          dish.process?.ru ||
          '';
        tdDesc.rowSpan = dish.ingredients.length;
        tr.appendChild(tdDesc);
      }

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
  loadData(renderPreps);
}

document.addEventListener('DOMContentLoaded', renderPage);

// ==== LANGUAGE CHANGE ====
document.addEventListener('languageChanged', () => {
  renderPage();
});
