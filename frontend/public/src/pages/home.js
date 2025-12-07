export default function homeView() {
  app.innerHTML = `
    <main>
    <section id="calendar">
      <h2>Kalender</h2>
      <!-- später Kalender-Einträge -->
    </section>

    <section id="todos">
      <h2>ToDos</h2>
      <form id="todo-form" style="margin-bottom: 0.5rem;">
        <input
          id="todo-title"
          type="text"
          placeholder="Neue Aufgabe hinzufügen…"
          style="width: 70%; padding: 0.3rem;"
        />
        <button type="submit">Hinzufügen</button>
      </form>

      <ul id="todo-list" style="list-style: none; padding-left: 0; margin: 0;">
        <!-- ToDos kommen hier rein -->
      </ul>
    </section>

    <section id="notes">
      <h2>Notizen</h2>
      <!-- später Notizen -->
    </section>

    <section id="assistant" style="padding: 1rem;">
      <h2>Frag deinen Assistenten</h2>
        <form id="ask-form">
          <input
            id="question"
            type="text"
            placeholder="Was soll ich für dich planen?"
            style="width: 60%; padding: 0.5rem;"
          />
          <button type="submit">Fragen</button>
        </form>
        <p id="answer" style="margin-top: 1rem; font-style: italic;">
          Noch keine Frage gestellt.
        </p>
    </section>
  </main>
  `;

  const form = document.getElementById("ask-form");
  const input = document.getElementById("question");
  const answerEl = document.getElementById("answer");

  form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const question = input.value.trim();
  if (!question) return;

      answerEl.textContent = "Ich denke nach… 🤔";

  try {
    const response = await fetch("http://localhost:8000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const data = await response.json();
    answerEl.textContent = data.answer || JSON.stringify(data);
  } catch (err) {
    console.error(err);
    answerEl.textContent =
      "Fehler beim Kontakt mit dem lokalen Assistenten. Läuft Docker?";
  }
  });

    // === ToDo-Logik ===

  const todoForm = document.getElementById("todo-form");
  const todoTitleInput = document.getElementById("todo-title");
  const todoListEl = document.getElementById("todo-list");

  async function loadTodos() {
    try {
      const res = await fetch("http://localhost:8000/todos");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const todos = await res.json();
      renderTodos(todos);
    } catch (err) {
      console.error(err);
      todoListEl.innerHTML =
        "<li>Fehler beim Laden der ToDos. Läuft die API?</li>";
    }
  }

  function renderTodos(todos) {
    todoListEl.innerHTML = "";
    if (!todos.length) {
      todoListEl.innerHTML =
        '<li style="color: #777;">Noch keine Aufgaben.</li>';
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
      checkbox.checked = todo.done;
      checkbox.style.marginRight = "0.5rem";

      const span = document.createElement("span");
      span.textContent = todo.title;
      if (todo.done) {
        span.style.textDecoration = "line-through";
        span.style.color = "#777";
      }
      checkbox.addEventListener("change", () => {
        updateTodoDone(todo.id, checkbox.checked);
      });

      li.appendChild(checkbox);
      li.appendChild(span);
      todoListEl.appendChild(li);
    }
  }

  async function createTodo(title) {
    try {
      const res = await fetch("http://localhost:8000/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      // Nach dem Erstellen neu laden
      await loadTodos();
    } catch (err) {
      console.error(err);
      alert("Fehler beim Erstellen des ToDos.");
    }
  }

  async function updateTodoDone(id, done) {
    try {
      const res = await fetch(`http://localhost:8000/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ done }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      // Nach dem Update neu laden, damit Darstellung stimmt
      await loadTodos();
    } catch (err) {
      console.error(err);
      alert("Fehler beim Aktualisieren des ToDos.");
    }
  }

  todoForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = todoTitleInput.value.trim();
    if (!title) return;
    await createTodo(title);
    todoTitleInput.value = "";
    todoTitleInput.focus();
  });

  // Direkt beim Laden der Seite ToDos holen
  loadTodos();
}