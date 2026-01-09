// ======================
// Переходы по кнопкам
// ======================

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

// Обновление даты через lang.js (при загрузке страницы или смене языка)
document.addEventListener("DOMContentLoaded", () => {
    const dateEl = document.getElementById("current-date");
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        // Берём текущий язык из localStorage, если есть
        const lang = localStorage.getItem("lang") || "ru";
        dateEl.textContent = new Date().toLocaleDateString(lang, options);
    }
});
