import { t, translate, setText } from "../i18n/i18n.js";

export default function todosView() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="todos-workspace">
    <section class="todos-board">
      <header class="todos-header">
        <div class="todos-header-text">
          <h2 data-i18n="nav.todos"></h2>
          <p class="todos-subtitle" data-i18n="board.subtitle"></p>
        </div>
        <button id="todo-add-button" class="todo-primary-btn">
          <span class="todo-btn-icon">＋</span>
          <span data-i18n="board.new"></span>
        </button>
      </header>

      <p class="todo-move-message" role="status" aria-live="polite" hidden></p>
      <div class="todos-columns">
        <!-- Spalte: Open -->
        <article class="todos-column">
          <header class="todos-column-header">
            <div class="todos-column-title-wrap">
              <span class="todos-column-pill pill-open"></span>
              <div>
                <h3 data-i18n="status.open"></h3>
                <p class="todos-column-subtitle" data-i18n="board.openSubtitle"></p>
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
                <h3 data-i18n="status.in_progress"></h3>
                <p class="todos-column-subtitle" data-i18n="board.progressSubtitle"></p>
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
                <h3 data-i18n="status.done"></h3>
                <p class="todos-column-subtitle" data-i18n="board.doneSubtitle"></p>
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
              <h3 data-i18n="board.new"></h3>
              <p class="todo-modal-subtitle" data-i18n="board.createSubtitle"></p>
            </div>
            <button class="todo-modal-close" id="todo-modal-close" data-i18n-aria-label="common.closeModal">
              ✕
            </button>
          </header>

          <form id="todo-create-form" class="todo-modal-form">
            <div class="todo-field">
              <label for="todo-title-input" data-i18n="ticket.name"></label>
              <input
                id="todo-title-input"
                type="text"
                data-i18n-placeholder="ticket.namePlaceholder"
                required
              />
            </div>

            <div class="todo-field">
              <label for="todo-label-input" data-i18n="ticket.labelOptional"></label>
              <input
                id="todo-label-input"
                type="text"
                data-i18n-placeholder="ticket.labelPlaceholder"
              />
            </div>

            <div class="todo-field">
              <label for="todo-notes-input" data-i18n="ticket.noteOptional"></label>
              <textarea
                id="todo-notes-input"
                rows="3"
                data-i18n-placeholder="ticket.notePlaceholder"
              ></textarea>
            </div>

            <div class="todo-field">
              <label for="todo-status-input" data-i18n="ticket.status"></label>
              <select id="todo-status-input">
                <option value="open" data-i18n="status.open"></option>
                <option value="in_progress" data-i18n="status.in_progress"></option>
                <option value="done" data-i18n="status.done"></option>
              </select>
            </div>

            <div class="todo-modal-footer">
              <button type="button" class="todo-secondary-btn" id="todo-modal-cancel" data-i18n="common.cancel"></button>
              <button type="submit" class="todo-primary-btn" data-i18n="board.create"></button>
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
        <button type="button" class="todo-detail-close" data-i18n-aria-label="ticket.closeDetails">✕</button>
      </header>
      <div class="todo-detail-labels" id="todo-detail-labels" hidden></div>
      <section class="todo-detail-description">
        <h3><label for="todo-detail-description" data-i18n="ticket.description"></label></h3>
        <textarea id="todo-detail-description" rows="8" data-i18n-placeholder="ticket.addDescription" aria-describedby="todo-description-message"></textarea>
        <button type="button" class="todo-secondary-btn todo-description-save" hidden data-i18n="common.save"></button>
        <p id="todo-description-message" role="status" aria-live="polite"></p>
      </section>
      <footer class="todo-detail-danger">
        <button type="button" class="todo-delete-button" data-i18n-aria-label="ticket.delete" data-i18n-title="ticket.delete">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
          </svg>
        </button>
        <p class="todo-delete-message" role="status"></p>
      </footer>
    </aside>
    <dialog class="todo-delete-dialog" aria-labelledby="todo-delete-question" aria-describedby="todo-delete-warning">
      <h2 id="todo-delete-question" data-i18n="ticket.deleteQuestion"></h2>
      <p id="todo-delete-warning" data-i18n="ticket.deleteWarning"></p>
      <p class="todo-delete-error" role="alert"></p>
      <div class="todo-delete-actions">
        <button type="button" class="todo-secondary-btn" data-delete-no autofocus data-i18n="common.no"></button>
        <button type="button" class="todo-delete-confirm" data-delete-yes data-i18n="common.yes"></button>
      </div>
    </dialog>
    </div>
  `;

  translate(app);

  // Non-modal details: the board stays interactive and keeps its current state.
  const workspace = app.querySelector(".todos-workspace");
  const detail = app.querySelector("#todo-detail");
  const detailName = app.querySelector("#todo-detail-name");
  const detailStatus = app.querySelector("#todo-detail-status");
  const detailLabels = app.querySelector("#todo-detail-labels");
  const detailDescription = app.querySelector("#todo-detail-description");
  const descriptionSave = app.querySelector(".todo-description-save");
  const descriptionMessage = app.querySelector("#todo-description-message");
  // Keep unsaved drafts when switching tickets or closing the detail panel.
  const descriptionDrafts = new Map();
  const descriptionSaving = new Set();
  const descriptionErrors = new Map();
  let selectedTodo = null;
  let selectedId = null;
  const deleteButton = workspace.querySelector(".todo-delete-button");
  const deleteMessage = workspace.querySelector(".todo-delete-message");
  const deleteDialog = workspace.querySelector(".todo-delete-dialog");
  const deleteError = deleteDialog.querySelector(".todo-delete-error");
  const deleteNo = deleteDialog.querySelector("[data-delete-no]");
  const deleteYes = deleteDialog.querySelector("[data-delete-yes]");
  let deleting = false;
  let deleteTargetId = null;

  deleteButton.addEventListener("click", () => {
    if (!selectedTodo) return;
    if (savingMove || descriptionSaving.size) {
      setText(deleteMessage, "ticket.waitSave");
      return;
    }
    deleteTargetId = selectedId;
    setText(deleteMessage, null);
    setText(deleteError, null);
    deleteDialog.showModal();
    deleteNo.focus();
  });
  deleteNo.addEventListener("click", () => deleteDialog.close());
  deleteDialog.addEventListener("cancel", (event) => {
    if (deleting) event.preventDefault();
  });
  deleteYes.addEventListener("click", async () => {
    if (deleting || deleteTargetId === null) return;
    const id = deleteTargetId;
    deleting = true;
    deleteNo.disabled = true;
    deleteYes.disabled = true;
    setText(deleteYes, "ticket.deleting");
    setText(deleteError, null);
    try {
      const response = await fetch(`http://localhost:8000/todos/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      // Remove local state only after the backend confirms permanent deletion.
      deleteDialog.close();
      closeDetails();
      workspace.querySelectorAll(".todo-card").forEach((card) => {
        if (card.dataset.id === String(id)) card.remove();
      });
      descriptionDrafts.delete(id);
      descriptionErrors.delete(id);
      refreshCounts();
      addButton.focus({ preventScroll: true });
    } catch (error) {
      console.error(error);
      setText(deleteError, "ticket.deleteError");
    } finally {
      deleting = false;
      deleteNo.disabled = false;
      deleteYes.disabled = false;
      setText(deleteYes, "common.yes");
    }
  });

  function refreshDescriptionEditor() {
    const saving = descriptionSaving.has(selectedId);
    descriptionSave.hidden = !descriptionDrafts.has(selectedId);
    descriptionSave.disabled = saving;
    setText(descriptionSave, saving ? "common.saving" : "common.save");
    detailDescription.readOnly = saving;
    detailDescription.setAttribute("aria-busy", String(saving));
    setText(descriptionMessage, descriptionErrors.get(selectedId) || null);
  }

  detailDescription.addEventListener("input", () => {
    if (!selectedTodo) return;
    if (detailDescription.value === (selectedTodo.description ?? "")) {
      descriptionDrafts.delete(selectedId);
    } else {
      descriptionDrafts.set(selectedId, detailDescription.value);
    }
    descriptionErrors.delete(selectedId);
    refreshDescriptionEditor();
  });

  descriptionSave.addEventListener("click", async () => {
    const todo = selectedTodo;
    if (!todo || !descriptionDrafts.has(todo.id) || descriptionSaving.has(todo.id)) return;
    const description = descriptionDrafts.get(todo.id);
    descriptionSaving.add(todo.id);
    descriptionErrors.delete(todo.id);
    refreshDescriptionEditor();
    try {
      const response = await fetch(`http://localhost:8000/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const updated = await response.json();
      todo.description = updated.description;
      descriptionDrafts.delete(todo.id);
      if (selectedId === todo.id) {
        selectedTodo.description = updated.description;
        detailDescription.value = updated.description ?? "";
        detailDescription.blur();
      }
    } catch (error) {
      console.error(error);
      descriptionErrors.set(todo.id, "ticket.descriptionError");
    } finally {
      descriptionSaving.delete(todo.id);
      if (selectedId === todo.id) refreshDescriptionEditor();
    }
  });

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
    setText(deleteMessage, null);
    selectedId = todo.id;
    selectedTodo = todo;
    setText(detailName, todo.name ? null : "ticket.untitled");
    if (todo.name) detailName.textContent = todo.name;
    const statuses = ["open", "in_progress", "done"];
    const status = statuses.includes(todo.status) ? todo.status : "open";
    setText(detailStatus, `status.${status}`);
    detailStatus.dataset.status = status;
    detailLabels.replaceChildren();
    for (const label of ticketLabels(todo)) {
      const pill = document.createElement("span");
      pill.className = "todo-card-label-pill";
      pill.textContent = label;
      detailLabels.appendChild(pill);
    }
    detailLabels.hidden = !detailLabels.childElementCount;
    detailDescription.value = descriptionDrafts.get(todo.id) ?? todo.description ?? "";
    refreshDescriptionEditor();
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
    selectedTodo = null;
    markSelectedCard();
    selectedCard?.focus({ preventScroll: true });
  }

  detail.querySelector(".todo-detail-close").addEventListener("click", closeDetails);
  workspace.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !deleteDialog.open && !detail.hidden && modalBackdrop.classList.contains("hidden")) {
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

  const moveMessage = workspace.querySelector(".todo-move-message");
  const zones = [
    { body: openColumn, count: openCountEl, status: "open", empty: "board.emptyOpen" },
    { body: progressColumn, count: progressCountEl, status: "in_progress", empty: "board.emptyProgress" },
    { body: doneColumn, count: doneCountEl, status: "done", empty: "board.emptyDone" },
  ];
  let dragging = null;
  let savingMove = false;
  let suppressClick = false;
  let shade = null;

  function endDrag() {
    dragging?.card.classList.remove("is-dragging");
    dragging = null;
    shade?.remove();
    shade = null;
    workspace.classList.remove("is-dragging-ticket");
    zones.forEach(({ body }) => body.parentElement.classList.remove("is-drop-target"));
  }

  function refreshCounts() {
    zones.forEach(({ body, count, empty }) => {
      body.querySelectorAll(".todos-empty").forEach((el) => el.remove());
      const total = body.querySelectorAll(".todo-card").length;
      count.textContent = total;
      if (!total) renderEmptyState(body, empty);
    });
  }

  // Keep the original card in place until PATCH succeeds, so failed or invalid
  // drops preserve its exact position and require no rollback request.
  async function moveTicket(card, todo, zone) {
    savingMove = true;
    card.classList.add("is-saving");
    card.setAttribute("aria-busy", "true");
    moveMessage.hidden = false;
    setText(moveMessage, "board.savingStatus");
    try {
      const response = await fetch(`http://localhost:8000/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: zone.status }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const updated = await response.json();
      todo.status = updated.status;
      zone.body.appendChild(card);
      refreshCounts();
      if (selectedId === todo.id) openDetails(todo);
      setText(moveMessage, "board.statusSaved");
    } catch (error) {
      console.error(error);
      setText(moveMessage, "board.statusError");
    } finally {
      savingMove = false;
      card.classList.remove("is-saving");
      card.removeAttribute("aria-busy");
    }
  }

  zones.forEach((zone) => {
    const column = zone.body.parentElement;
    column.addEventListener("dragover", (event) => {
      if (!dragging) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      zones.forEach(({ body }) => body.parentElement.classList.toggle("is-drop-target", body === zone.body));
    });
    column.addEventListener("dragleave", (event) => {
      if (!column.contains(event.relatedTarget)) column.classList.remove("is-drop-target");
    });
    column.addEventListener("drop", (event) => {
      if (!dragging) return;
      event.preventDefault();
      const { card, todo } = dragging;
      const sameColumn = card.parentElement === zone.body;
      endDrag();
      if (!sameColumn) moveTicket(card, todo, zone);
    });
  });

  function createTicketCard(todo) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "todo-card";
    card.dataset.id = todo.id;
    card.setAttribute("aria-controls", "todo-detail");
    card.setAttribute("aria-expanded", String(todo.id === selectedId));
    card.classList.toggle("is-selected", todo.id === selectedId);
    card.addEventListener("click", () => {
      if (!suppressClick) openDetails(todo);
    });
    card.draggable = true;
    card.addEventListener("dragstart", (event) => {
      if (savingMove) {
        event.preventDefault();
        return;
      }
      dragging = { card, todo };
      suppressClick = true;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(todo.id));
      const bounds = card.getBoundingClientRect();
      event.dataTransfer.setDragImage(card, event.clientX - bounds.left, event.clientY - bounds.top);
      shade = document.createElement("div");
      shade.className = "todo-drag-shade";
      shade.setAttribute("aria-hidden", "true");
      document.body.appendChild(shade);
      workspace.classList.add("is-dragging-ticket");
      // Let the browser capture the full-opacity card for its cursor preview.
      requestAnimationFrame(() => {
        if (dragging?.card === card) card.classList.add("is-dragging");
      });
    });
    card.addEventListener("dragend", () => {
      endDrag();
      setTimeout(() => { suppressClick = false; }, 0);
    });

    const main = document.createElement("span");
    main.className = "todo-card-main";

    const title = document.createElement("span");
    title.className = "todo-card-title";
    if (todo.name) title.textContent = todo.name;
    else setText(title, "ticket.untitled");

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

  function renderEmptyState(columnEl, key) {
    const p = document.createElement("p");
    p.className = "todos-empty";
    setText(p, key);
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
        renderEmptyState(openColumn, "board.emptyOpen");
      }
      if (progressCount === 0) {
        renderEmptyState(progressColumn, "board.emptyProgress");
      }
      if (doneCount === 0) {
        renderEmptyState(doneColumn, "board.emptyDone");
      }
    } catch (err) {
      console.error(err);
      openColumn.innerHTML = '<p class="todos-error" data-i18n="board.loadError"></p>';
      progressColumn.innerHTML = '<p class="todos-error" data-i18n="board.loadError"></p>';
      doneColumn.innerHTML = '<p class="todos-error" data-i18n="board.loadError"></p>';
      translate(workspace);
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
      alert(t("board.createError"));
    }
  });

  // Initial laden
  loadTodos();
}
