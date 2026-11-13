(function () {
  "use strict";
  const VERSION = "1.0.0";
  const config = window.NEXORA_CONFIG;
  const storage = window.NexoraStorage;
  const root = document.getElementById("app");
  const configScript = document.querySelector('script[src$="config.js"]');
  const logoUrl = config.logo && configScript ? new URL(config.logo, configScript.src).href : "";
  const names = { dashboard: "Resumen", clientes: "Clientes", productos: "Productos", ventas: "Ventas", gastos: "Gastos", reportes: "Reportes", ajustes: "Configuración" };
  const icons = {
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    clientes: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    productos: '<path d="M21 8v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
    ventas: '<circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M2 3h2l2.4 11.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L21 7H5"/>',
    gastos: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M16 15h2"/>',
    reportes: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.86 3.22-.08-.02a1.7 1.7 0 0 0-1.8.65l-.05.07h-3.72l-.03-.08a1.7 1.7 0 0 0-1.53-1.15h-.08a1.7 1.7 0 0 0-1.53 1.15l-.03.08H5.4l-.05-.07a1.7 1.7 0 0 0-1.8-.65l-.08.02-1.86-3.22.06-.06A1.7 1.7 0 0 0 2 15l-.02-.08 1.86-3.22.09.02a1.7 1.7 0 0 0 1.47-.43 1.7 1.7 0 0 0 .44-1.47l-.02-.09L7.68 6.5l.08.02a1.7 1.7 0 0 0 1.8-.65l.05-.07h3.72l.03.08a1.7 1.7 0 0 0 1.53 1.15h.08a1.7 1.7 0 0 0 1.53-1.15l.03-.08h3.72l.05.07a1.7 1.7 0 0 0 1.8.65l.08-.02 1.86 3.22-.06.06a1.7 1.7 0 0 0-.34 1.88l.02.08-1.86 3.22-.09-.02a1.7 1.7 0 0 0-1.47.43Z" transform="translate(-1 -1) scale(.9)"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    alert: '<path d="M12 3 2 21h20L12 3ZM12 9v4M12 17h.01"/>',
    trend: '<path d="M3 17 9 11l4 4 8-8M15 7h6v6"/>',
    wallet: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M16 12h5"/>'
  };
  const icon = name => '<span class="icon"><svg viewBox="0 0 24 24" aria-hidden="true">' + (icons[name] || icons.dashboard) + "</svg></span>";
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = n => new Intl.NumberFormat(config.locale, { style: "currency", currency: config.currency }).format(n);
  const today = () => { const d = new Date(); return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-"); };
  const dateDisplay = value => value ? value.split("-").reverse().join("/") : "—";
  const id = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  const sum = (items, key) => items.reduce((total, item) => total + item[key], 0);
  const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
  const prefKey = "nexora-preferences-" + config.id;
  let prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(prefKey) || "{}"); } catch (error) { console.error("No se pudieron leer las preferencias.", error); }
  let data = { clients: [], products: [], sales: [], expenses: [] };
  let page = config.modules.includes("dashboard") ? "dashboard" : (config.modules[0] || "ajustes");
  let search = "";
  let filter = "";
  let from = today().slice(0, 7) + "-01";
  let to = today();

  function savePrefs() {
    try { localStorage.setItem(prefKey, JSON.stringify(prefs)); }
    catch (error) { console.error(error); notify("No se pudieron guardar las preferencias.", true); }
  }
  function notify(message, error) {
    const old = document.querySelector(".toast");
    if (old) old.remove();
    const toast = document.createElement("div");
    toast.className = "toast" + (error ? " error" : "");
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.append(toast);
    setTimeout(() => toast.remove(), 6000);
  }
  function showError(error) { console.error(error); notify(error.message || "No se pudo completar la operación.", true); }
  function heading(title, subtitle, action, label) {
    return '<div class="page-heading"><div><div class="eyebrow">Tu espacio de trabajo</div><h1>' + esc(title) + '</h1><p>' + esc(subtitle) + '</p></div>' + (action ? '<button class="button" data-action="' + action + '">' + icon("plus") + esc(label) + "</button>" : "") + "</div>";
  }
  function stat(title, value, note, symbol) {
    return '<div class="card stat"><div class="stat-top"><span>' + esc(title) + '</span><span class="stat-icon">' + icon(symbol) + '</span></div><div class="stat-value">' + esc(value) + '</div><div class="stat-note">' + esc(note) + "</div></div>";
  }
  function table(headers, rows, empty) {
    if (!rows.length) return '<div class="empty">' + esc(empty) + "</div>";
    return '<div class="table-wrap"><table><thead><tr>' + headers.map(h => "<th>" + esc(h) + "</th>").join("") + "</tr></thead><tbody>" + rows.map(row => "<tr>" + row.map(cell => "<td>" + cell + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>";
  }
  const button = (action, label, recordId) => '<button class="button secondary small" data-action="' + action + '" data-id="' + esc(recordId) + '">' + esc(label) + "</button>";
  const sorted = items => [...items].sort((a, b) => b.date.localeCompare(a.date));
  const filtered = (items, start, end) => items.filter(item => item.date >= start && item.date <= end);

  function chart(sales, expenses) {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
      months.push({ label: new Intl.DateTimeFormat(config.locale, { month: "short" }).format(d).replace(".", ""), income: sum(sales.filter(s => s.date.startsWith(key)), "total"), expense: sum(expenses.filter(e => e.date.startsWith(key)), "amount") });
    }
    const max = Math.max(1, ...months.flatMap(m => [m.income, m.expense]));
    return '<div class="legend"><span><i class="dot"></i>Ingresos</span><span><i class="dot light"></i>Gastos</span></div><div class="chart" role="img" aria-label="Ingresos y gastos de los últimos seis meses">' + months.map(m => '<div class="chart-col" title="' + esc(m.label + ": ingresos " + money(m.income) + ", gastos " + money(m.expense)) + '"><div class="bar" style="height:' + (m.income / max * 100) + '%"></div><div class="bar expense" style="height:' + (m.expense / max * 100) + '%"></div></div>').join("") + '</div><div class="chart-labels">' + months.map(m => "<span>" + esc(m.label) + "</span>").join("") + "</div>";
  }
  function recentSales(limit) {
    return table(["Fecha", "Cliente", "Productos", "Pago", "Total", "Detalle"], sorted(data.sales).slice(0, limit).map(s => [esc(dateDisplay(s.date)), "<strong>" + esc(s.clientName || "Consumidor final") + "</strong>", esc(s.items.map(i => i.name + " × " + i.quantity).join(", ")), esc(s.payment), "<strong>" + esc(money(s.total)) + "</strong>", button("sale-detail", "Ver", s.id)]), "Todavía no hay ventas registradas.");
  }
  function viewContext() { return { config, data, search, filter, from, to, prefs, names, VERSION, heading, stat, table, button, icon, esc, money, today, dateDisplay, sorted, filtered, sum, chart, recentSales }; }
  function render() {
    document.body.classList.toggle("dark", prefs.theme === "dark");
    document.title = config.appName;
    document.documentElement.style.setProperty("--accent", config.colors.accent);
    document.documentElement.style.setProperty("--accent-soft", config.colors.accentSoft);
    document.documentElement.style.fontFamily = config.font;
    const nav = [...config.modules, "ajustes"];
    root.innerHTML = '<div class="shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">' + (logoUrl ? '<img src="' + esc(logoUrl) + '" alt="">' : esc(config.appName.charAt(0))) + '</div><div><div class="brand-name">' + esc(config.appName) + '</div><div class="brand-sub">Gestión comercial</div></div></div><div class="nav-label">ESPACIO DE TRABAJO</div><nav class="nav" aria-label="Navegación principal">' + nav.map(n => '<button data-page="' + n + '" class="' + (page === n ? "active" : "") + '"' + (page === n ? ' aria-current="page"' : "") + ">" + icon(n) + esc(names[n]) + "</button>").join("") + '</nav><div class="sidebar-bottom"><strong>' + esc(config.businessName) + '</strong><span>Tu espacio local · v' + VERSION + '</span></div></aside><main class="main"><header class="topbar"><div style="display:flex;align-items:center;gap:12px"><button class="icon-button mobile-menu" data-action="menu" aria-label="Abrir menú">' + icon("menu") + '</button><div class="breadcrumb">Espacio de trabajo &nbsp; / &nbsp; <strong>' + esc(names[page]) + '</strong></div></div><div class="top-actions"><button class="icon-button" data-action="theme" aria-label="Cambiar modo claro u oscuro">' + icon("moon") + '</button><div class="avatar" title="' + esc(config.businessName) + '">' + esc(config.businessName.charAt(0).toUpperCase()) + '</div></div></header><div class="workspace">' + window.NexoraModules[page](viewContext()) + '</div></main></div><dialog id="modal"></dialog>';
  }
  function field(name, label, value, options = {}) {
    return '<div class="field' + (options.full ? " full" : "") + '"><label for="field-' + name + '">' + esc(label) + '</label><input id="field-' + name + '" name="' + name + '" type="' + (options.type || "text") + '" value="' + esc(value == null ? "" : value) + '"' + (options.required ? " required" : "") + (options.number ? ' min="0" max="1000000000" step="' + (options.integer ? "1" : "0.01") + '"' : options.type === "date" ? ' min="0001-01-01" max="9999-12-31"' : ' maxlength="200"') + '></div>';
  }
  function modal(title, body, submitLabel) {
    const dialog = document.getElementById("modal");
    dialog.innerHTML = '<form id="modal-form"><div class="modal-head"><h2>' + esc(title) + '</h2><button type="button" class="icon-button" data-action="close" aria-label="Cerrar">×</button></div><div class="modal-body">' + body + '</div><div class="modal-footer"><button type="button" class="button secondary" data-action="close">Cerrar</button>' + (submitLabel ? '<button class="button" type="submit">' + esc(submitLabel) + "</button>" : "") + "</div></form>";
    dialog.showModal();
  }
  function clientForm(client = {}) {
    modal(client.id ? "Editar cliente" : "Nuevo cliente", '<div class="form-grid">' +
      field("name", "Nombre o razón social", client.name, { required: true, full: true }) +
      field("email", "Correo electrónico", client.email, { type: "email" }) + field("phone", "Teléfono", client.phone) +
      field("notes", "Notas", client.notes, { full: true }) + '</div><input type="hidden" name="id" value="' + esc(client.id || "") + '">', "Guardar cliente");
    document.getElementById("modal-form").dataset.kind = "client";
  }
  function productForm(product = {}) {
    modal(product.id ? "Editar producto" : "Nuevo producto", '<div class="form-grid">' +
      field("name", "Nombre del producto", product.name, { required: true }) + field("category", "Categoría", product.category) +
      field("price", "Precio de venta", product.price == null ? 0 : product.price, { type: "number", number: true, required: true }) +
      field("cost", "Costo", product.cost == null ? 0 : product.cost, { type: "number", number: true, required: true }) +
      field("stock", "Stock disponible", product.stock == null ? 0 : product.stock, { type: "number", number: true, integer: true, required: true }) +
      field("minStock", "Alerta de stock mínimo", product.minStock == null ? 0 : product.minStock, { type: "number", number: true, integer: true, required: true }) +
      '</div><input type="hidden" name="id" value="' + esc(product.id || "") + '"><p class="help">El stock se descuenta automáticamente al registrar una venta.</p>', "Guardar producto");
    document.getElementById("modal-form").dataset.kind = "product";
    if (product.id) document.getElementById("modal-form").dataset.expectedStock = String(product.stock);
  }
  function expenseForm(expense = {}) {
    modal(expense.id ? "Editar gasto" : "Nuevo gasto", '<div class="form-grid">' +
      field("description", "Concepto", expense.description, { required: true }) + field("category", "Categoría", expense.category) +
      field("date", "Fecha", expense.date || today(), { type: "date", required: true }) +
      field("amount", "Importe", expense.amount == null ? "" : expense.amount, { type: "number", number: true, required: true }) +
      '</div><input type="hidden" name="id" value="' + esc(expense.id || "") + '">', "Guardar gasto");
    document.getElementById("modal-form").dataset.kind = "expense";
  }
  function saleLine() {
    return '<div class="sale-line"><select name="product" aria-label="Producto" required><option value="">Elegí un producto</option>' + data.products.map(p => '<option value="' + esc(p.id) + '">' + esc(p.name + " · " + money(p.price) + " · stock " + p.stock) + '</option>').join("") + '</select><input name="quantity" type="number" min="1" max="1000000000" step="1" value="1" aria-label="Cantidad" required><button type="button" class="button secondary small" data-action="remove-line" aria-label="Quitar producto">×</button></div>';
  }
  function saleForm() {
    if (!data.products.length) { notify("Primero agregá un producto para registrar una venta.", true); return; }
    modal("Nueva venta", '<div class="form-grid">' +
      field("date", "Fecha", today(), { type: "date", required: true }) +
      '<div class="field"><label for="sale-client">Cliente</label><select id="sale-client" name="clientId"><option value="">Consumidor final</option>' + data.clients.map(c => '<option value="' + esc(c.id) + '">' + esc(c.name) + "</option>").join("") + '</select></div>' +
      '<div class="field full"><label>Productos y cantidades</label><div id="sale-lines">' + saleLine() + '</div><button type="button" class="button secondary small" data-action="add-line">+ Agregar producto</button></div>' +
      '<div class="field"><label for="sale-payment">Método de pago</label><select id="sale-payment" name="payment"><option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option><option>Otro</option></select></div><div class="field"><label>Total estimado</label><strong id="sale-total">' + esc(money(0)) + '</strong></div></div><p class="help">Se guardan los precios actuales y se descuenta el stock al confirmar. Las ventas registradas no se pueden editar ni eliminar.</p>', "Registrar venta");
    document.getElementById("modal-form").dataset.kind = "sale";
    updateSaleTotal();
  }
  function updateSaleTotal() {
    let total = 0;
    document.querySelectorAll(".sale-line").forEach(line => {
      const product = data.products.find(p => p.id === line.querySelector('[name="product"]').value);
      const quantity = Number(line.querySelector('[name="quantity"]').value);
      if (product && Number.isFinite(quantity) && quantity > 0) total += round(product.price * quantity);
    });
    const target = document.getElementById("sale-total");
    if (target) target.textContent = money(total);
  }
  function history(clientId) {
    const client = data.clients.find(c => c.id === clientId);
    if (!client) throw new Error("No se encontró el cliente.");
    const sales = sorted(data.sales.filter(s => s.clientId === clientId));
    modal("Historial · " + client.name, table(["Fecha", "Productos", "Pago", "Total"], sales.map(s => [esc(dateDisplay(s.date)), esc(s.items.map(i => i.name + " × " + i.quantity + " (" + money(i.subtotal) + ")").join(", ")), esc(s.payment), esc(money(s.total))]), "Este cliente todavía no tiene compras."));
  }
  function saleDetail(saleId) {
    const sale = data.sales.find(s => s.id === saleId);
    if (!sale) throw new Error("No se encontró la venta.");
    modal("Detalle de venta", '<p class="help">' + esc(dateDisplay(sale.date) + " · " + (sale.clientName || "Consumidor final") + " · " + sale.payment) + "</p>" +
      table(["Producto", "Cantidad", "Precio", "Subtotal"], sale.items.map(i => [esc(i.name), String(i.quantity), esc(money(i.price)), esc(money(i.subtotal))]), "") +
      '<p><strong>Total: ' + esc(money(sale.total)) + "</strong></p>");
  }
  async function submitForm(form) {
    const values = new FormData(form);
    const text = key => String(values.get(key) || "").trim();
    const number = key => Number(values.get(key));
    const recordId = text("id") || id();
    if (form.dataset.kind === "client") {
      if (!text("name")) throw new Error("Ingresá el nombre del cliente.");
      await storage.put("clients", { id: recordId, name: text("name"), email: text("email"), phone: text("phone"), notes: text("notes") });
    } else if (form.dataset.kind === "product") {
      if (!text("name")) throw new Error("Ingresá el nombre del producto.");
      await storage.put("products", { id: recordId, name: text("name"), category: text("category"), price: number("price"), cost: number("cost"), stock: number("stock"), minStock: number("minStock") }, form.dataset.expectedStock === undefined ? undefined : Number(form.dataset.expectedStock));
    } else if (form.dataset.kind === "expense") {
      if (!text("description")) throw new Error("Ingresá el concepto del gasto.");
      await storage.put("expenses", { id: recordId, description: text("description"), category: text("category"), date: text("date"), amount: number("amount") });
    } else if (form.dataset.kind === "sale") {
      const quantities = new Map();
      form.querySelectorAll(".sale-line").forEach(line => {
        const productId = line.querySelector('[name="product"]').value;
        const quantity = Number(line.querySelector('[name="quantity"]').value);
        quantities.set(productId, (quantities.get(productId) || 0) + quantity);
      });
      if (!quantities.size) throw new Error("Agregá al menos un producto.");
      const items = [...quantities].map(([productId, quantity]) => {
        const product = data.products.find(p => p.id === productId);
        if (!product || !Number.isSafeInteger(quantity) || quantity <= 0 || quantity > product.stock) throw new Error("Revisá los productos y las cantidades disponibles.");
        return { productId, name: product.name, quantity, price: product.price, subtotal: round(product.price * quantity) };
      });
      const client = data.clients.find(c => c.id === text("clientId"));
      const total = round(sum(items, "subtotal"));
      if (!Number.isFinite(total) || total > 1000000000000) throw new Error("El total de la venta supera el máximo permitido.");
      await storage.saveSale({ id: id(), date: text("date"), clientId: client ? client.id : "", clientName: client ? client.name : "", payment: text("payment"), items, total });
    } else return;
    await refresh();
    render();
    notify("Cambios guardados en este dispositivo.");
  }
  function download(filename, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function backup() {
    await refresh();
    const exportedAt = new Date().toISOString();
    download("nexora-copia-" + today() + ".json", JSON.stringify({ format: "nexora-backup", schema: 1, clientId: config.id, exportedAt, data }, null, 2), "application/json");
    prefs.lastBackup = exportedAt;
    savePrefs();
    render();
    notify("Se inició la descarga de la copia. Guardala en un lugar seguro.");
  }
  function csv() {
    const rows = [["Tipo", "Fecha", "Concepto", "Categoría o pago", "Ingreso", "Gasto"]];
    sorted(filtered(data.sales, from, to)).forEach(s => rows.push(["Venta", s.date, (s.clientName || "Consumidor final") + " - " + s.items.map(i => i.name + " x " + i.quantity).join("; "), s.payment, s.total.toFixed(2), ""]));
    sorted(filtered(data.expenses, from, to)).forEach(e => rows.push(["Gasto", e.date, e.description, e.category, "", e.amount.toFixed(2)]));
    const encode = value => {
      let text = String(value);
      if (/^[\s]*[=+\-@\t\r]/.test(text)) text = "'" + text;
      return '"' + text.replace(/"/g, '""') + '"';
    };
    download("nexora-reporte-" + from + "-a-" + to + ".csv", "\ufeff" + rows.map(row => row.map(encode).join(";")).join("\r\n"), "text/csv;charset=utf-8");
    notify("Se inició la descarga del reporte.");
  }
  function validateBackup(backup) {
    const fail = () => { throw new Error("La copia no tiene un formato válido o contiene datos incompatibles."); };
    const str = (v, required = false) => typeof v === "string" && v.length <= 200 && (!required || v.trim().length > 0);
    const num = v => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1000000000000;
    const integer = v => num(v) && Number.isSafeInteger(v);
    const date = v => {
      if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
      const d = new Date(v + "T00:00:00Z");
      return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
    };
    if (!backup || backup.format !== "nexora-backup" || backup.schema !== 1 || backup.clientId !== config.id || !backup.data || typeof backup.data !== "object") fail();
    const result = {};
    for (const store of storage.stores) {
      const records = backup.data[store];
      if (!Array.isArray(records)) fail();
      const ids = new Set();
      result[store] = records.map(r => {
        if (!r || typeof r !== "object" || !str(r.id, true) || ids.has(r.id)) fail();
        ids.add(r.id);
        if (store === "clients" && (!str(r.name, true) || !str(r.email) || !str(r.phone) || !str(r.notes))) fail();
        if (store === "products" && (!str(r.name, true) || !str(r.category) || !num(r.price) || !num(r.cost) || !integer(r.stock) || !integer(r.minStock))) fail();
        if (store === "expenses" && (!str(r.description, true) || !str(r.category) || !date(r.date) || !num(r.amount))) fail();
        if (store === "sales") {
          if (!date(r.date) || !str(r.clientId) || !str(r.clientName) || !str(r.payment, true) || !num(r.total) || !Array.isArray(r.items) || !r.items.length) fail();
          const products = new Set();
          for (const i of r.items) {
            if (!i || !str(i.productId, true) || products.has(i.productId) || !str(i.name, true) || !integer(i.quantity) || i.quantity < 1 || !num(i.price) || !num(i.subtotal) || round(i.price * i.quantity) !== round(i.subtotal)) fail();
            products.add(i.productId);
          }
          if (round(sum(r.items, "subtotal")) !== round(r.total)) fail();
        }
        return r;
      });
    }
    return result;
  }
  async function importBackup(file) {
    if (!file) return;
    let parsed;
    try { parsed = JSON.parse(await file.text()); } catch (error) { throw new Error("No se pudo leer el archivo JSON: " + error.message); }
    const imported = validateBackup(parsed);
    if (!confirm("La importación reemplazará TODOS los datos actuales de este navegador. Exportá una copia actual antes de continuar. ¿Querés reemplazarlos?")) return;
    await storage.replace(imported);
    await refresh();
    render();
    notify("Copia restaurada correctamente.");
  }
  async function refresh() { data = await storage.all(); }
  root.addEventListener("click", async event => {
    const target = event.target.closest("button");
    if (!target) {
      if (event.target.classList.contains("sidebar")) event.target.classList.remove("open");
      return;
    }
    try {
      if (target.dataset.page) { page = target.dataset.page; search = ""; filter = ""; await refresh(); render(); return; }
      const action = target.dataset.action;
      if (action === "menu") document.querySelector(".sidebar").classList.toggle("open");
      else if (action === "theme") { prefs.theme = prefs.theme === "dark" ? "light" : "dark"; savePrefs(); render(); }
      else if (action === "close") document.getElementById("modal").close();
      else if (action === "new-client") clientForm();
      else if (action === "edit-client") clientForm(data.clients.find(c => c.id === target.dataset.id));
      else if (action === "history-client") history(target.dataset.id);
      else if (action === "sale-detail") saleDetail(target.dataset.id);
      else if (action === "new-product") productForm();
      else if (action === "edit-product") productForm(data.products.find(p => p.id === target.dataset.id));
      else if (action === "new-expense") expenseForm();
      else if (action === "edit-expense") expenseForm(data.expenses.find(e => e.id === target.dataset.id));
      else if (action === "new-sale") saleForm();
      else if (action === "add-line") { document.getElementById("sale-lines").insertAdjacentHTML("beforeend", saleLine()); updateSaleTotal(); }
      else if (action === "remove-line") { target.closest(".sale-line").remove(); updateSaleTotal(); }
      else if (action === "backup") await backup();
      else if (action === "import") document.getElementById("backup-file").click();
      else if (action === "csv") csv();
    } catch (error) { showError(error); }
  });
  root.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.target;
    const submit = form.querySelector('[type="submit"]');
    if (submit) submit.disabled = true;
    try { await submitForm(form); } catch (error) { showError(error); if (submit) submit.disabled = false; }
  });
  root.addEventListener("input", event => {
    if (event.target.id === "search") {
      search = event.target.value;
      const position = event.target.selectionStart;
      render();
      const input = document.getElementById("search");
      input.focus(); input.setSelectionRange(position, position);
    } else if (event.target.closest(".sale-line")) updateSaleTotal();
  });
  root.addEventListener("change", async event => {
    try {
      if (event.target.id === "filter") { filter = event.target.value; render(); }
      else if (event.target.id === "from" || event.target.id === "to") {
        const newFrom = document.getElementById("from").value, newTo = document.getElementById("to").value;
        if (!newFrom || !newTo || newFrom > newTo) { render(); throw new Error("Elegí un período válido: la fecha inicial no puede superar la final."); }
        from = newFrom; to = newTo; render();
      } else if (event.target.id === "backup-file") { const file = event.target.files[0]; event.target.value = ""; await importBackup(file); }
      else if (event.target.closest(".sale-line")) updateSaleTotal();
    } catch (error) { showError(error); }
  });
  async function start() {
    try {
      if (!config || !/^[a-zA-Z0-9_-]+$/.test(config.id) || !Array.isArray(config.modules) || config.modules.some(m => !names[m] || m === "ajustes") || new Set(config.modules).size !== config.modules.length) throw new Error("La configuración del cliente no es válida.");
      new Intl.NumberFormat(config.locale, { style: "currency", currency: config.currency });
      await storage.open();
      await refresh();
      render();
    } catch (error) {
      console.error(error);
      root.innerHTML = '<div class="loading"><h1>No se pudo iniciar NEXORA</h1><p>' + esc(error.message) + '</p><p>Comprobá la configuración, los permisos de almacenamiento y que IndexedDB esté habilitado. Tus datos no fueron modificados.</p></div>';
    }
  }
  start();
}());
