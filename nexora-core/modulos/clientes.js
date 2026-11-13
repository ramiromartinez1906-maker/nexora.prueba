(function () {
  "use strict";
  window.NexoraModules = window.NexoraModules || {};
  window.NexoraModules.clientes = function (context) {
    const { config, data, search, filter, from, to, prefs, names, VERSION, heading, stat, table, button, icon, esc, money, today, dateDisplay, sorted, filtered, sum, chart, recentSales } = context;
    const q = search.toLocaleLowerCase(config.locale);
    const items = data.clients.filter(c => [c.name, c.email, c.phone].some(v => v.toLocaleLowerCase(config.locale).includes(q)));
    return heading("Clientes", "Tu cartera de contactos, siempre organizada.", "new-client", "Nuevo cliente") +
      '<div class="toolbar"><input id="search" aria-label="Buscar clientes" placeholder="Buscar por nombre, email o teléfono" value="' + esc(search) + '"></div><section class="card">' +
      table(["Cliente", "Contacto", "Teléfono", "Compras", "Acciones"], items.map(c => ["<strong>" + esc(c.name) + "</strong>", esc(c.email || "—"), esc(c.phone || "—"), String(data.sales.filter(s => s.clientId === c.id).length), '<div class="actions">' + button("history-client", "Historial", c.id) + button("edit-client", "Editar", c.id) + "</div>"]), "No hay clientes para mostrar. Agregá el primero para comenzar.") + "</section>";
  };
}());
