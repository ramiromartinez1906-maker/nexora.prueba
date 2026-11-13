(function () {
  "use strict";
  window.NexoraModules = window.NexoraModules || {};
  window.NexoraModules.dashboard = function (context) {
    const { config, data, search, filter, from, to, prefs, names, VERSION, heading, stat, table, button, icon, esc, money, today, dateDisplay, sorted, filtered, sum, chart, recentSales } = context;
    const start = today().slice(0, 7) + "-01";
    const sales = filtered(data.sales, start, today());
    const expenses = filtered(data.expenses, start, today());
    const income = sum(sales, "total"), out = sum(expenses, "amount");
    const low = data.products.filter(p => p.stock <= p.minStock);
    return heading("Hola, " + config.businessName, config.tagline || "Una mirada clara a lo que pasa en tu negocio.", config.modules.includes("ventas") ? "new-sale" : "", "Nueva venta") +
      '<div class="grid stats">' + stat("Ingresos del mes", money(income), sales.length + " ventas registradas", "trend") + stat("Gastos del mes", money(out), expenses.length + " gastos registrados", "wallet") + stat("Balance del mes", money(income - out), "Ingresos menos gastos", "reportes") + stat("Clientes", String(data.clients.length), "En tu cartera", "clientes") + '</div>' +
      '<div class="grid dashboard-grid"><section class="card panel"><div class="panel-head"><div><h2>Tu actividad</h2><p>Ingresos y gastos a lo largo del tiempo</p></div><span class="pill">Últimos 6 meses</span></div>' + chart(data.sales, data.expenses) + '</section><section class="card panel"><div class="panel-head"><div><h2>En perspectiva</h2><p>Lo importante, de un vistazo</p></div></div><div class="insight"><div class="insight-icon">' + icon("productos") + '</div><div><strong>' + data.products.length + ' productos</strong><span>En tu catálogo</span></div></div><div class="insight"><div class="insight-icon">' + icon("alert") + '</div><div><strong>' + low.length + ' con stock bajo</strong><span>' + esc(low.length ? low.slice(0, 3).map(p => p.name).join(", ") : "Todo está en orden") + '</span></div></div><div class="insight"><div class="insight-icon">' + icon("ventas") + '</div><div><strong>' + data.sales.length + ' operaciones</strong><span>Ventas históricas registradas</span></div></div></section></div>' +
      '<section class="card"><div class="panel-head panel"><div><h2>Ventas recientes</h2><p>Las últimas operaciones de tu negocio</p></div></div>' + recentSales(5) + "</section>";
  };
}());
