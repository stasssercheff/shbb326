// ================== CURRENT LANGUAGE ==================
window.currentLang = window.currentLang || 'ru';

// ================== DATA FILE ==================
const DATA_FILE = 'data/preps.json';

// ================== LOAD DATA ==================
async function loadData() {
  const res = await fetch(DATA_FILE);
  return await res.json();
}

// ================== HELPERS ==================
function getIngredientName(ing) {
  if (window.currentLang === 'ru') return ing['Продукт'];
  if (window.currentLang === 'vi') return ing['Ingredient_vi'] || ing['Ingredient'] || ing['Продукт'];
  return ing['Ingredient'] || ing['Продукт'];
}

function getProcessText(dish) {
  return (
    dish.process?.[window.currentLang] ||
    dish.process?.ru ||
    ''
  );
}

function getHeaders() {
  if (window.currentLang === 'ru') return ['#', 'Продукт', 'Гр/шт', 'Процесс'];
  if (window.currentLang === 'vi') return ['#', 'Nguyên liệu', 'Gr/Pcs', 'Quy trình'];
  return ['#', 'Ingredient', 'Gr/Pcs', 'Process'];
}

// ================== RENDER ==================
async function renderPage() {
  const data = await loadData();
  const container = document.querySelector('.table-container');
  container.innerHTML = '';

  (data.recipes || []).forEach(dish => {
    const card = document.createElement('div');
    card.className = 'dish-card';

    // ---------- TITLE ----------
    const title = document.createElement('div');
    title.className = 'dish-title';
    title.textContent =
      dish.name?.[window.currentLang] ||
      dish.name?.ru ||
      '';
    card.appendChild(title);

    // ---------- TABLE ----------
    const table = document.createElement('table');
    table.className = 'pf-table';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // HEADERS
    const trHead = document.createElement('tr');
    getHeaders().forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    // BASE VALUE OF KEY INGREDIENT
    let keyBaseValue = null;

    dish.ingredients.forEach(ing => {
      if (ing['Продукт'] === dish.key) {
        keyBaseValue = parseFloat(
          String(ing['Шт/гр']).replace(',', '.')
        );
      }
    });

    // ROWS
    dish.ingredients.forEach((ing, index) => {
      const tr = document.createElement('tr');

      // №
      const tdNum = document.createElement('td');
      tdNum.textContent = index + 1;

      // NAME
      const tdName = document.createElement('td');
      tdName.textContent = getIngredientName(ing);

      // AMOUNT
      const tdAmount = document.createElement('td');
      const baseValue = parseFloat(
        String(ing['Шт/гр']).replace(',', '.')
      );

      tdAmount.textContent = ing['Шт/гр'];
      tdAmount.dataset.base = baseValue;

      // KEY INGREDIENT (EDITABLE)
      if (ing['Продукт'] === dish.key) {
        tdAmount.contentEditable = true;
        tdAmount.classList.add('key-ingredient');

        tdAmount.addEventListener('input', () => {
          const newVal = parseFloat(
            tdAmount.textContent.replace(',', '.')
          );
          if (!newVal || !keyBaseValue) return;

          const factor = newVal / keyBaseValue;

          tbody.querySelectorAll('tr').forEach(row => {
            const cell = row.cells[2];
            if (!cell || cell === tdAmount) return;

            const base = parseFloat(cell.dataset.base);
            if (isNaN(base)) return;

            const result = Math.round(base * factor * 100) / 100;
            cell.textContent = result;
          });
        });

        tdAmount.addEventListener('keydown', e => {
          if (!/[0-9.,]|Backspace|Delete|ArrowLeft|ArrowRight/.test(e.key)) {
            e.preventDefault();
          }
        });
      }

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);

      // PROCESS (ONE CELL)
      if (index === 0) {
        const tdProcess = document.createElement('td');
        tdProcess.textContent = getProcessText(dish);
        tdProcess.rowSpan = dish.ingredients.length;
        tr.appendChild(tdProcess);
      }

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    card.appendChild(table);
    container.appendChild(card);
  });
}

// ================== INIT ==================
document.addEventListener('DOMContentLoaded', renderPage);

// ================== LANGUAGE SWITCH (NO RELOAD) ==================
document.addEventListener('languageChanged', () => {
  renderPage();
});
