export default function todosView() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="todos-workspace">
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
            <!-- Tickets per JS -->
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
    <aside class="todo-detail" id="todo-detail" aria-labelledby="todo-detail-name" hidden>
      <header class="todo-detail-header">
        <div class="todo-detail-heading">
          <h2 id="todo-detail-name"></h2>
          <span class="todo-detail-status" id="todo-detail-status"></span>
        </div>
        <button type="button" class="todo-detail-close" aria-label="Close ticket details">✕</button>
      </header>
      <div class="todo-detail-labels" id="todo-detail-labels" hidden></div>
      <section class="todo-detail-description">
        <h3>Description</h3>
        <p id="todo-detail-description"></p>
      </section>
    </aside>
    </div>
  `;

  // Non-modal details: the board stays interactive and keeps its current state.
  const workspace = app.querySelector(".todos-workspace");
  const detail = app.querySelector("#todo-detail");
  const detailName = app.querySelector("#todo-detail-name");
  const detailStatus = app.querySelector("#todo-detail-status");
  const detailLabels = app.querySelector("#todo-detail-labels");
  const detailDescription = app.querySelector("#todo-detail-description");
  let selectedId = null;

  function ticketLabels(todo) {
    return (Array.isArray(todo.labels) ? todo.labels : [todo.label])
      .filter((label) => typeof label === "string" && label.trim());
  }

  function markSelectedCard() {
    workspace.querySelectorAll(".todo-card").forEach((card) => {
      const selected = card.dataset.id === String(selectedId);
      card.classList.toggle("is-selected", selected);
      card.setAttribute("aria-expanded", String(selected));
    });
  }

  function openDetails(todo) {
    selectedId = todo.id;
    detailName.textContent = todo.name || "(Ohne Titel)";
    const statuses = { open: "Open", in_progress: "In Progress", done: "Done" };
    const status = Object.hasOwn(statuses, todo.status) ? todo.status : "open";
    detailStatus.textContent = statuses[status];
    detailStatus.dataset.status = status;
    detailLabels.replaceChildren();
    for (const label of ticketLabels(todo)) {
      const pill = document.createElement("span");
      pill.className = "todo-card-label-pill";
      pill.textContent = label;
      detailLabels.appendChild(pill);
    }
    detailLabels.hidden = !detailLabels.childElementCount;
    const hasDescription = Boolean(todo.description?.trim());
    detailDescription.textContent = hasDescription ? todo.description : "No description added.";
    detailDescription.classList.toggle("is-empty", !hasDescription);
    detail.hidden = false;
    workspace.classList.add("has-detail");
    markSelectedCard();
  }

  function closeDetails() {
    const selectedCard = [...workspace.querySelectorAll(".todo-card")]
      .find((card) => card.dataset.id === String(selectedId));
    detail.hidden = true;
    workspace.classList.remove("has-detail");
    selectedId = null;
    markSelectedCard();
    selectedCard?.focus({ preventScroll: true });
  }

  detail.querySelector(".todo-detail-close").addEventListener("click", closeDetails);
  workspace.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !detail.hidden && modalBackdrop.classList.contains("hidden")) {
      closeDetails();
    }
  });

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
// ------- Spalten-Referenzen & Rendering -------

  const openColumn = document.getElementById("todo-column-open");
  const progressColumn = document.getElementById("todo-column-progress");
  const doneColumn = document.getElementById("todo-column-done");

  const openCountEl = document.getElementById("todo-count-open");
  const progressCountEl = document.getElementById("todo-count-progress");
  const doneCountEl = document.getElementById("todo-count-done");

  function createTicketCard(todo) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "todo-card";
    card.dataset.id = todo.id;
    card.setAttribute("aria-controls", "todo-detail");
    card.setAttribute("aria-expanded", String(todo.id === selectedId));
    card.classList.toggle("is-selected", todo.id === selectedId);
    card.addEventListener("click", () => openDetails(todo));

    const main = document.createElement("span");
    main.className = "todo-card-main";

    const title = document.createElement("span");
    title.className = "todo-card-title";
    title.textContent = todo.name || "(Ohne Titel)";

    main.appendChild(title);

    for (const label of ticketLabels(todo)) {
      const labelRow = document.createElement("span");
      labelRow.className = "todo-card-label-row";

      const labelPill = document.createElement("span");
      labelPill.className = "todo-card-label-pill";
      labelPill.textContent = label;

      labelRow.appendChild(labelPill);
      main.appendChild(labelRow);
    }

    card.appendChild(main);
    return card;
  }

  function renderEmptyState(columnEl, text) {
    const p = document.createElement("p");
    p.className = "todos-empty";
    p.textContent = text;
    columnEl.appendChild(p);
  }

  async function loadTodos() {
    try {
      const res = await fetch("http://localhost:8000/todos");
      console.log("GET /todos status:", res.status);
      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }

      const todos = await res.json();
    console.log("GET /todos data:", todos);

      // Spalten leeren
      openColumn.innerHTML = "";
      progressColumn.innerHTML = "";
      doneColumn.innerHTML = "";

      let openCount = 0;
      let progressCount = 0;
      let doneCount = 0;

      todos.forEach((todo) => {
        const status = todo.status || "open";
        const card = createTicketCard(todo);

        if (status === "open") {
          openColumn.appendChild(card);
          openCount++;
        } else if (status === "in_progress") {
          progressColumn.appendChild(card);
          progressCount++;
        } else if (status === "done") {
          doneColumn.appendChild(card);
          doneCount++;
        } else {
          // Fallback: unbekannte Status in "Open"
          openColumn.appendChild(card);
          openCount++;
        }
      });

      // Counts aktualisieren
      openCountEl.textContent = openCount;
      progressCountEl.textContent = progressCount;
      doneCountEl.textContent = doneCount;

      // Leere-Spalten-Text
      if (openCount === 0) {
        renderEmptyState(openColumn, "Noch keine offenen Tickets.");
      }
      if (progressCount === 0) {
        renderEmptyState(progressColumn, "Hier ist es noch ruhig.");
      }
      if (doneCount === 0) {
        renderEmptyState(doneColumn, "Noch nichts abgeschlossen.");
      }
    } catch (err) {
      console.error(err);
      openColumn.innerHTML = "<p class='todos-error'>Tickets konnten nicht geladen werden.</p>";
      progressColumn.innerHTML = "<p class='todos-error'>Tickets konnten nicht geladen werden.</p>";
      doneColumn.innerHTML = "<p class='todos-error'>Tickets konnten nicht geladen werden.</p>";
      openCountEl.textContent = "–";
      progressCountEl.textContent = "–";
      doneCountEl.textContent = "–";
    }
  }

  // ------- Ticket anlegen & Board aktualisieren -------

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

      await res.json();
      await loadTodos();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Ticket konnte nicht angelegt werden.");
    }
  });

  // Initial laden
  loadTodos();
}
