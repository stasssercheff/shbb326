// ===== CURRENT LANGUAGE =====
window.currentLang = window.currentLang || 'ru';

// ===== NAVIGATION =====
function goHome() {
  location.href = location.origin + '/' + location.pathname.split('/')[1] + '/';
}

function goBack() {
  const path = location.pathname;
  const parent = path.substring(0, path.lastIndexOf('/'));
  const upper = parent.substring(0, parent.lastIndexOf('/'));
  location.href = upper + '/index.html';
}

// ===== DATA =====
const DATA_FILE = 'data/sv.json';

// ===== LOAD JSON =====
function loadSousVide() {
  fetch(DATA_FILE)
    .then(r => r.json())
    .then(data => renderSousVide(data))
    .catch(err => console.error('SV load error:', err));
}

// ===== INGREDIENT NAME (NO STRUCTURE CHANGE) =====
function getIngredientName(ing) {
  if (currentLang === 'ru') return ing['Продукт'] || '';
  // en + vi → English name
  return ing['Ingredient'] || '';
}

// ===== PROCESS TEXT (NO STRUCTURE CHANGE) =====
function getProcessText(recipe, index) {
  if (!Array.isArray(recipe.process)) return '';

  const p = recipe.process.find(
    pr => index >= pr.range[0] && index <= pr.range[1]
  );

  if (!p) return '';

  if (currentLang === 'ru') return p.ru || '';
  // en + vi → English text
  return p.en || '';
}

// ===== TABLE HEADERS =====
function getHeaders() {
  if (currentLang === 'ru') {
    return ['№', 'Продукт', 'Кол-во', 'Темп °C', 'Время, мин', 'Процесс'];
  }
  if (currentLang === 'vi') {
    return ['№', 'Nguyên liệu', 'Số lượng', 'Nhiệt độ °C', 'Thời gian (phút)', 'Quy trình'];
  }
  return ['№', 'Ingredient', 'Amount', 'Temp °C', 'Time (min)', 'Process'];
}

// ===== RENDER =====
function renderSousVide(data) {
  const container = document.getElementById('content');
  container.innerHTML = '';

  data.recipes.forEach(recipe => {

    // ---- TITLE ----
    const h2 = document.createElement('h2');
    h2.textContent = recipe.title;
    container.appendChild(h2);

    // ---- TABLE ----
    const table = document.createElement('table');
    table.className = 'sv-table';

    const headers = getHeaders();

    table.innerHTML = `
      <thead>
        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    recipe.ingredients.forEach(ing => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${ing['№']}</td>
        <td>${getIngredientName(ing)}</td>
        <td>${ing['Шт/гр'] || ''}</td>
        <td>${ing['Температура С / Temperature C'] || ''}</td>
        <td>${ing['Время мин / Time'] || ''}</td>
        <td>${getProcessText(recipe, ing['№'])}</td>
      `;

      tbody.appendChild(tr);
    });

    container.appendChild(table);
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', loadSousVide);

// ===== RE-RENDER ON LANGUAGE CHANGE =====
document.addEventListener('languageChanged', loadSousVide);
