export default function notesView() {
  const app = document.getElementById("app");
  app.innerHTML = `
   <section>
      <h1 data-i18n="nav.notes"></h1>
      <p data-i18n="notes.welcome"></p>
    </section>
  `;
}
