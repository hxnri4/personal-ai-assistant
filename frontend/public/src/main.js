import calendarView from "./pages/calendar.js";
import homeView from "./pages/home.js";
import notesView from "./pages/notes.js";
import todosView from "./pages/todos.js";
import { getLanguage, languages, setLanguage, setText, translate } from "./i18n/i18n.js";

const app = document.getElementById("app");
const nav = document.getElementById("nav-main");
const languageSelector = document.getElementById("language-selector");

for (const language of languages) {
  const option = document.createElement("option");
  option.value = language.code;
  option.textContent = language.label;
  option.lang = language.code;
  languageSelector.appendChild(option);
}

languageSelector.value = getLanguage();
languageSelector.addEventListener("change", () => {
  setLanguage(languageSelector.value);
});
document.addEventListener("languagechange", () => {
  languageSelector.value = getLanguage();
});
translate();

// zentrale Funktion zum Umschalten der Seiten
const views = {
  home: homeView,

  calendar: calendarView,

  todos: todosView,

  notes: notesView,
};

function render(viewName) {
  const view = views[viewName];

  if (!view) {
    app.innerHTML = "<h1>404</h1><p></p>";
    setText(app.querySelector("p"), "common.viewNotFound", { view: viewName });
    return;
  }

  view();
  translate(app);
  setActiveButton(viewName);
}

function setActiveButton(viewName) {
  nav.querySelectorAll("button[data-view]").forEach((button) => {
    const active = button.dataset.view === viewName;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}

nav.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-view]");
  if (!btn) return;

  render(btn.dataset.view);
});

render("home");
