// === Навигация ===
function goHome() {
  location.href = location.origin + '/' + location.pathname.split('/')[1] + '/';
}

function goBack() {
  const currentPath = window.location.pathname;
  const parentPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
  const upperPath = parentPath.substring(0, parentPath.lastIndexOf("/"));
  window.location.href = upperPath + "/index.html";
}

// === Автоподстановка даты ===
document.addEventListener("DOMContentLoaded", () => {
  const dateEl = document.getElementById("current-date");
  if (dateEl) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    dateEl.textContent = `${day}.${month}.${year}`;
  }
});

// === Переключение языка ===
function switchLanguage(lang) {
  document.documentElement.lang = lang;
  localStorage.setItem("lang", lang);

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (translations[key] && translations[key][lang]) {
      if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
        el.setAttribute("placeholder", translations[key][lang]);
      } else if (el.tagName === "TEXTAREA" && el.hasAttribute("placeholder")) {
        el.setAttribute("placeholder", translations[key][lang]);
      } else {
        el.textContent = translations[key][lang];
      }
    }
  });

  document.querySelectorAll("select").forEach(select => {
    Array.from(select.options).forEach(option => {
      const key = option.dataset.i18n;
      if (key && translations[key] && translations[key][lang]) {
        option.textContent = translations[key][lang];
      }
      if (option.value === "") option.textContent = "—";
    });
  });
}

// === Сохранение/восстановление данных формы ===
function saveFormData() {
  const data = {};
  document.querySelectorAll("select").forEach(select => {
    data[select.name || select.id] = select.value;
  });
  document.querySelectorAll("textarea.comment").forEach(textarea => {
    data[textarea.name || textarea.id] = textarea.value;
  });
  localStorage.setItem("formData", JSON.stringify(data));
}

function restoreFormData() {
  const saved = localStorage.getItem("formData");
  if (!saved) return;
  const data = JSON.parse(saved);
  document.querySelectorAll("select").forEach(select => {
    if (data[select.name || select.id] !== undefined) {
      select.value = data[select.name || select.id];
    }
  });
  document.querySelectorAll("textarea.comment").forEach(textarea => {
    if (data[textarea.name || textarea.id] !== undefined) {
      textarea.value = data[textarea.name || textarea.id];
    }
  });
}

// === DOMContentLoaded ===
document.addEventListener("DOMContentLoaded", () => {
  const lang = localStorage.getItem("lang") || "ru";

  document.querySelectorAll("select.qty").forEach(select => {
    const hasEmpty = Array.from(select.options).some(opt => opt.value === "");
    if (!hasEmpty) {
      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = "—";
      emptyOption.selected = true;
      select.insertBefore(emptyOption, select.firstChild);
    }
  });

  restoreFormData();
  switchLanguage(lang);

  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const formattedDate = `${day}/${month}`;

  document.querySelectorAll("select, textarea.comment").forEach(el => {
    el.addEventListener("input", saveFormData);
  });

  // === Функция сборки сообщения ===
  const buildMessage = lang => {
    let message = `🧾 <b>${lang === "en" ? "COUNTING" : "ОСТАТКИ"}</b>\n\n`;
    message += `📅 ${lang === "en" ? "Date" : "Дата"}: ${formattedDate}\n`;

    const nameSelect = document.querySelector('select[name="chef"]');
    const selectedChef = nameSelect?.options[nameSelect.selectedIndex];
    const name = selectedChef?.dataset.i18n
      ? translations[selectedChef.dataset.i18n][lang]
      : "—";
    message += `${lang === "en" ? "👨‍🍳 Name" : "👨‍🍳 Имя"}: ${name}\n\n`;

    document.querySelectorAll(".menu-section").forEach(section => {
      const sectionTitle = section.querySelector(".section-title");
      const titleKey = sectionTitle?.dataset.i18n;
      const title = translations[titleKey]?.[lang] || sectionTitle?.textContent || "";

      let sectionContent = "";

      const dishes = Array.from(section.querySelectorAll(".dish")).filter(dish => {
        const select = dish.querySelector("select.qty");
        return select && select.value && select.value !== "";
      });

      dishes.forEach((dish, index) => {
        const select = dish.querySelector("select.qty");
        const quantity = select.value;

        const nameEl = dish.querySelector(".product-name");
        const unitEl = dish.querySelector(".product-unit");

        const nameKey = nameEl?.dataset.i18n;
        const unitKey = unitEl?.dataset.i18n;

        const nameText = translations[nameKey]?.[lang] || nameEl?.textContent || "";
        const unitText = translations[unitKey]?.[lang] || unitEl?.textContent || "";

        sectionContent += `${index + 1}. ${nameText} — ${quantity} ${unitText}\n`;
      });

      const commentField = section.querySelector("textarea.comment");
      if (commentField && commentField.value.trim()) {
        sectionContent += `💬 ${lang === "en" ? "Comment" : "Комментарий"}: ${commentField.value.trim()}\n`;
      }

      if (sectionContent.trim()) {
        message += `${title}\n${sectionContent}\n`;
      }
    });

    return message;
  };

  // === Кнопка отправки ===
  const button = document.getElementById("sendToTelegram");
  button.addEventListener("click", async () => {
    const chat_id = "-1002393080811";
    const worker_url = "https://shbb1.stassser.workers.dev/";
    const accessKey = "14d92358-9b7a-4e16-b2a7-35e9ed71de43";

    const sendMessage = msg => fetch(worker_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id, text: msg })
    }).then(res => res.json());

    const sendAllParts = async text => {
      let start = 0;
      while (start < text.length) {
        const chunk = text.slice(start, start + 4000);
        await sendMessage(chunk);
        start += 4000;
      }
    };

    const clearForm = () => {
      document.querySelectorAll("select").forEach(select => (select.value = ""));
      document.querySelectorAll("textarea.comment").forEach(textarea => (textarea.value = ""));
    };

    try {
      for (const lang of window.sendLangs) {
        const msg = buildMessage(lang);
        await sendAllParts(msg);
      }

      alert("✅ ОТПРАВЛЕНО");
      localStorage.clear();
      clearForm();
    } catch (err) {
      alert("❌ Ошибка при отправке: " + err.message);
      console.error(err);
    }
  });
});
