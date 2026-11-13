(function () {
  "use strict";
  window.NexoraModules = window.NexoraModules || {};
  window.NexoraModules.gastos = function (context) {
    const { config, data, search, filter, from, to, prefs, names, VERSION, heading, stat, table, button, icon, esc, money, today, dateDisplay, sorted, filtered, sum, chart, recentSales } = context;
    const categories = [...new Set(data.expenses.map(e => e.category).filter(Boolean))].sort();
    const items = sorted(data.expenses).filter(e => !filter || e.category === filter);
    return heading("Gastos", "Registrá y seguí las salidas de tu negocio.", "new-expense", "Nuevo gasto") +
      '<div class="toolbar"><select id="filter" aria-label="Filtrar gastos"><option value="">Todas las categorías</option>' + categories.map(c => '<option ' + (filter === c ? "selected " : "") + 'value="' + esc(c) + '">' + esc(c) + "</option>").join("") + '</select></div><section class="card">' +
      table(["Fecha", "Concepto", "Categoría", "Importe", "Acciones"], items.map(e => [esc(dateDisplay(e.date)), "<strong>" + esc(e.description) + "</strong>", esc(e.category || "—"), esc(money(e.amount)), button("edit-expense", "Editar", e.id)]), "Todavía no hay gastos registrados.") + "</section>";
  };
}());
