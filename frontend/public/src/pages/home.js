import { setText, translate } from "../i18n/i18n.js";

export default function homeView() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <main>
      <section id="calendar">
        <h2 data-i18n="nav.calendar"></h2>
      </section>

      <section id="todos">
        <h2 data-i18n="nav.todos"></h2>
        <form id="todo-form" style="margin-bottom: 0.5rem;">
          <input
            id="todo-title"
            type="text"
            data-i18n-placeholder="home.addTaskPlaceholder"
            data-i18n-aria-label="home.addTaskPlaceholder"
            style="width: 70%; padding: 0.3rem;"
          />
          <button type="submit" data-i18n="home.addTask"></button>
        </form>
        <p id="todo-message" role="status" hidden></p>
        <ul id="todo-list" style="list-style: none; padding-left: 0; margin: 0;"></ul>
      </section>

      <section id="notes">
        <h2 data-i18n="nav.notes"></h2>
      </section>

      <section id="assistant" style="padding: 1rem;">
        <h2 data-i18n="home.askHeading"></h2>
        <form id="ask-form">
          <input
            id="question"
            type="text"
            data-i18n-placeholder="home.questionPlaceholder"
            data-i18n-aria-label="home.questionPlaceholder"
            style="width: 60%; padding: 0.5rem;"
          />
          <button type="submit" data-i18n="home.ask"></button>
        </form>
        <p id="answer" role="status" data-i18n="home.noQuestion" style="margin-top: 1rem; font-style: italic;"></p>
      </section>
    </main>
  `;
  translate(app);

  const form = document.getElementById("ask-form");
  const input = document.getElementById("question");
  const answerEl = document.getElementById("answer");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    setText(answerEl, "home.thinking");
    try {
      const response = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!response.ok) throw new Error("HTTP " + response.status);

      const data = await response.json();
      // Backend responses are user data, so a language change must leave them intact.
      setText(answerEl, null);
      answerEl.textContent = data.answer || JSON.stringify(data);
    } catch (err) {
      console.error(err);
      setText(answerEl, "home.assistantError");
    }
  });

  const todoForm = document.getElementById("todo-form");
  const todoTitleInput = document.getElementById("todo-title");
  const todoListEl = document.getElementById("todo-list");
  const todoMessage = document.getElementById("todo-message");

  function showTodoMessage(key) {
    todoMessage.hidden = !key;
    setText(todoMessage, key);
  }

  function showListMessage(key) {
    const message = document.createElement("li");
    message.style.color = "var(--text-muted)";
    setText(message, key);
    todoListEl.replaceChildren(message);
  }

  async function loadTodos() {
    try {
      const res = await fetch("http://localhost:8000/todos");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const todos = await res.json();
      renderTodos(todos);
    } catch (err) {
      console.error(err);
      showListMessage("home.loadTodosError");
    }
  }

  function renderTodos(todos) {
    todoListEl.replaceChildren();
    if (!todos.length) {
      showListMessage("home.emptyTodos");
      return;
    }

    for (const todo of todos) {
      const li = document.createElement("li");
      li.style.marginBottom = "0.3rem";
      li.style.display = "flex";
      li.style.alignItems = "center";
      li.dataset.id = todo.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.status === "done";
      checkbox.style.marginRight = "0.5rem";

      const span = document.createElement("span");
      span.id = `home-todo-name-${todo.id}`;
      span.textContent = todo.name;
      checkbox.setAttribute("aria-labelledby", span.id);
      if (todo.status === "done") {
        span.style.textDecoration = "line-through";
        span.style.color = "var(--text-muted)";
      }
      checkbox.addEventListener("change", async () => {
        const done = checkbox.checked;
        checkbox.disabled = true;
        const updated = await updateTodoDone(todo.id, done);
        if (!updated) checkbox.checked = todo.status === "done";
        checkbox.disabled = false;
      });

      li.append(checkbox, span);
      todoListEl.appendChild(li);
    }
  }

  async function createTodo(name) {
    showTodoMessage(null);
    try {
      const res = await fetch("http://localhost:8000/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      await loadTodos();
      return true;
    } catch (err) {
      console.error(err);
      showTodoMessage("home.createTodoError");
      return false;
    }
  }

  async function updateTodoDone(id, done) {
    showTodoMessage(null);
    try {
      const res = await fetch(`http://localhost:8000/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: done ? "done" : "open" }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      await loadTodos();
      return true;
    } catch (err) {
      console.error(err);
      showTodoMessage("home.updateTodoError");
      return false;
    }
  }

  todoForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = todoTitleInput.value.trim();
    if (!name) return;
    const button = todoForm.querySelector("button");
    button.disabled = true;
    const created = await createTodo(name);
    if (created && todoTitleInput.value.trim() === name) todoTitleInput.value = "";
    button.disabled = false;
    todoTitleInput.focus();
  });

  showListMessage("home.loadingTodos");
  loadTodos();
}
