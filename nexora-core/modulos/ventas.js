(function () {
  "use strict";
  window.NexoraModules = window.NexoraModules || {};
  window.NexoraModules.ventas = function (context) {
    const { config, data, search, filter, from, to, prefs, names, VERSION, heading, stat, table, button, icon, esc, money, today, dateDisplay, sorted, filtered, sum, chart, recentSales } = context;
    return heading("Ventas", "Cada operación, en un solo lugar.", "new-sale", "Nueva venta") + '<section class="card">' + recentSales(Infinity) + "</section>";
  };
}());
