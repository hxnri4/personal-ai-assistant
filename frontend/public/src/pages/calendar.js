export default function calendarView() {
  const app = document.getElementById("app");
  app.innerHTML = `
  <section>
      <h1 data-i18n="nav.calendar"></h1>
      <p data-i18n="calendar.welcome"></p>
    </section>
   `;
}
