(function () {
  "use strict";
  window.NexoraModules = window.NexoraModules || {};
  window.NexoraModules.reportes = function (context) {
    const { config, data, search, filter, from, to, prefs, names, VERSION, heading, stat, table, button, icon, esc, money, today, dateDisplay, sorted, filtered, sum, chart, recentSales } = context;
    const sales = filtered(data.sales, from, to), expenses = filtered(data.expenses, from, to);
    const income = sum(sales, "total"), out = sum(expenses, "amount");
    return heading("Reportes", "Transformá tus números en decisiones.") +
      '<div class="toolbar"><label>Desde <input type="date" id="from" value="' + esc(from) + '"></label><label>Hasta <input type="date" id="to" value="' + esc(to) + '"></label><button class="button secondary" data-action="csv">Exportar CSV</button></div>' +
      '<div class="grid stats">' + stat("Ingresos", money(income), sales.length + " ventas en el período", "trend") + stat("Gastos", money(out), expenses.length + " gastos en el período", "wallet") + stat("Balance", money(income - out), "Ingresos menos gastos", "reportes") + stat("Ticket promedio", money(sales.length ? income / sales.length : 0), "Por venta", "ventas") + '</div><section class="card panel"><div class="panel-head"><div><h2>Actividad mensual</h2><p>Comparación histórica, independiente del filtro de período</p></div><span class="pill">Últimos 6 meses</span></div>' + chart(data.sales, data.expenses) + "</section>";
  };
}());
