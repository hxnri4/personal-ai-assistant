export default function todosView() {
  app.innerHTML = `
    <section class="todos-board">
      <header class="todos-header">
        <div class="todos-header-text">
          <h2>ToDos</h2>
          <p class="todos-subtitle">
            Organisiere deine Aufgaben wie in einem feinen Board – ruhig, klar, geordnet.
          </p>
        </div>
        <button id="todo-add-button" class="todo-primary-btn">
          <span class="todo-btn-icon">＋</span>
          Neues Ticket
        </button>
      </header>

      <div class="todos-columns">
        <!-- Spalte: Open -->
        <article class="todos-column">
          <header class="todos-column-header">
            <div class="todos-column-title-wrap">
              <span class="todos-column-pill pill-open"></span>
              <div>
                <h3>Open</h3>
                <p class="todos-column-subtitle">Ideen & ungeplante Arbeit</p>
              </div>
            </div>
            <span class="todos-column-count" id="todo-count-open">0</span>
          </header>
          <div class="todos-column-body" id="todo-column-open">
            <!-- Später Tickets per JS -->
          </div>
        </article>

        <!-- Spalte: In Progress -->
        <article class="todos-column">
          <header class="todos-column-header">
            <div class="todos-column-title-wrap">
              <span class="todos-column-pill pill-progress"></span>
              <div>
                <h3>In Progress</h3>
                <p class="todos-column-subtitle">aktuelle Arbeit</p>
              </div>
            </div>
            <span class="todos-column-count" id="todo-count-progress">0</span>
          </header>
          <div class="todos-column-body" id="todo-column-progress">
            <!-- Später Tickets per JS -->
          </div>
        </article>

        <!-- Spalte: Done -->
        <article class="todos-column">
          <header class="todos-column-header">
            <div class="todos-column-title-wrap">
              <span class="todos-column-pill pill-done"></span>
              <div>
                <h3>Done</h3>
                <p class="todos-column-subtitle">Abgeschlossene Aufgaben</p>
              </div>
            </div>
            <span class="todos-column-count" id="todo-count-done">0</span>
          </header>
          <div class="todos-column-body" id="todo-column-done">
            <!-- Später Tickets per JS -->
          </div>
        </article>
      </div>

      <!-- Modal zum Erstellen eines neuen Tickets (noch ohne Backend-Logik) -->
      <div class="todo-modal-backdrop hidden" id="todo-modal-backdrop">
        <div class="todo-modal">
          <header class="todo-modal-header">
            <div>
              <h3>Neues Ticket</h3>
              <p class="todo-modal-subtitle">
                Erstelle eine Aufgabe mit Titel, optionalem Label & kurzer Notiz.
              </p>
            </div>
            <button class="todo-modal-close" id="todo-modal-close" aria-label="Modal schließen">
              ✕
            </button>
          </header>

          <form id="todo-create-form" class="todo-modal-form">
            <div class="todo-field">
              <label for="todo-title-input">Titel</label>
              <input
                id="todo-title-input"
                type="text"
                placeholder="z.B. 'API für ToDos erweitern'"
                required
              />
            </div>

            <div class="todo-field">
              <label for="todo-label-input">Label (optional)</label>
              <input
                id="todo-label-input"
                type="text"
                placeholder="z.B. 'Backend', 'Bug', 'Idea'"
              />
            </div>

            <div class="todo-field">
              <label for="todo-notes-input">Kurze Notiz (optional)</label>
              <textarea
                id="todo-notes-input"
                rows="3"
                placeholder="Kontext, nächste Schritte oder Randnotizen…"
              ></textarea>
            </div>

            <div class="todo-field">
              <label for="todo-status-input">Status</label>
              <select id="todo-status-input">
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div class="todo-modal-footer">
              <button type="button" class="todo-secondary-btn" id="todo-modal-cancel">
                Abbrechen
              </button>
              <button type="submit" class="todo-primary-btn">
                Ticket anlegen
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `;

  // --- Nur UI-Logik: Modal öffnen / schließen (ohne Backend) ---

  const addButton = document.getElementById("todo-add-button");
  const modalBackdrop = document.getElementById("todo-modal-backdrop");
  const modalClose = document.getElementById("todo-modal-close");
  const modalCancel = document.getElementById("todo-modal-cancel");
  const createForm = document.getElementById("todo-create-form");

  const openModal = () => {
    modalBackdrop.classList.remove("hidden");
  };

  const closeModal = () => {
    modalBackdrop.classList.add("hidden");
    createForm.reset();
  };

  addButton.addEventListener("click", openModal);
  modalClose.addEventListener("click", closeModal);
  modalCancel.addEventListener("click", closeModal);

  modalBackdrop.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });

  createForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nameInput = document.getElementById("todo-title-input");
  const labelInput = document.getElementById("todo-label-input");
  const notesInput = document.getElementById("todo-notes-input");
  const statusSelect = document.getElementById("todo-status-input");

  const name = nameInput.value.trim();
  const label = labelInput.value.trim();
  const description = notesInput.value.trim();
  const status = statusSelect.value || "open";

  if (!name) {
    // Minimaler Guard: ohne Namen kein Ticket
    nameInput.focus();
    return;
  }

  try {
    const res = await fetch("http://localhost:8000/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        label: label || null,
        description: description || null,
        status,
      }),
    });

    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }

    const created = await res.json();
    console.log("Neues Ticket angelegt:", created);

    // später: Board neu laden (z. B. loadTodos())
    // loadTodos();

    closeModal();
  } catch (err) {
    console.error(err);
    alert("Ticket konnte nicht angelegt werden. Schau ins Backend-Log für Details.");
  }
});

}