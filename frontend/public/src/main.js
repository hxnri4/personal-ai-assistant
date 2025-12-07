import calendarView from "./pages/calendar.js";
import homeView from "./pages/home.js";
import notesView from "./pages/notes.js";
import todosView from "./pages/todos.js";

const app = document.getElementById("app");
const nav = document.getElementById("nav-main");

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
    app.innerHTML = `<h1>404</h1><p>View "${viewName}" nicht gefunden.</p>`;
    return;
  }

  view();
  setActiveButton(viewName);
}

nav.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-view]");
  if (!btn) return;

  render(btn.dataset.view);
});

render("home");
