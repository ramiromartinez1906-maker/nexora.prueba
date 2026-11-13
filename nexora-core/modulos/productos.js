(function () {
  "use strict";
  window.NexoraModules = window.NexoraModules || {};
  window.NexoraModules.productos = function (context) {
    const { config, data, search, filter, from, to, prefs, names, VERSION, heading, stat, table, button, icon, esc, money, today, dateDisplay, sorted, filtered, sum, chart, recentSales } = context;
    const q = search.toLocaleLowerCase(config.locale);
    const categories = [...new Set(data.products.map(p => p.category).filter(Boolean))].sort();
    const items = data.products.filter(p => (p.name.toLocaleLowerCase(config.locale).includes(q) || p.category.toLocaleLowerCase(config.locale).includes(q)) && (!filter || p.category === filter));
    return heading("Productos", "Tu catálogo y tu stock bajo control.", "new-product", "Nuevo producto") +
      '<div class="toolbar"><input id="search" aria-label="Buscar productos" placeholder="Buscar producto o categoría" value="' + esc(search) + '"><select id="filter" aria-label="Filtrar por categoría"><option value="">Todas las categorías</option>' + categories.map(c => '<option ' + (filter === c ? "selected " : "") + 'value="' + esc(c) + '">' + esc(c) + "</option>").join("") + '</select></div><section class="card">' +
      table(["Producto", "Categoría", "Precio", "Costo", "Stock", "Estado", "Acciones"], items.map(p => ["<strong>" + esc(p.name) + "</strong>", esc(p.category || "—"), esc(money(p.price)), esc(money(p.cost)), String(p.stock), '<span class="status' + (p.stock <= p.minStock ? ' warn">Stock bajo' : '">Disponible') + "</span>", button("edit-product", "Editar", p.id)]), "No hay productos para mostrar. Creá tu catálogo para empezar a vender.") + "</section>";
  };
}());
