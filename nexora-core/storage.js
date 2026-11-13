(function () {
  "use strict";
  const stores = ["clients", "products", "sales", "expenses"];
  const config = window.NEXORA_CONFIG;
  const dbName = "nexora-" + config.id;
  let db;

  function requestResult(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function transactionDone(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error || new Error("La operación fue cancelada."));
      tx.onerror = () => {};
    });
  }

  async function open() {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      stores.forEach(name => database.createObjectStore(name, { keyPath: "id" }));
    };
    request.onblocked = () => console.error("Cerrá las otras pestañas de NEXORA para continuar.");
    db = await requestResult(request);
    db.onversionchange = () => db.close();
  }

  async function all() {
    const tx = db.transaction(stores, "readonly");
    const done = transactionDone(tx);
    const results = await Promise.all(stores.map(name => requestResult(tx.objectStore(name).getAll())));
    await done;
    return Object.fromEntries(stores.map((name, i) => [name, results[i]]));
  }

  async function put(store, record, expectedStock) {
    const tx = db.transaction(store, "readwrite");
    const done = transactionDone(tx);
    const objectStore = tx.objectStore(store);
    let failure;
    if (store === "products" && expectedStock !== undefined) {
      const request = objectStore.get(record.id);
      request.onsuccess = () => {
        if (!request.result || request.result.stock !== expectedStock) {
          failure = "El stock cambió en otra pestaña. Volvé a abrir el producto y revisá los datos.";
          tx.abort();
        } else objectStore.put(record);
      };
    } else objectStore.put(record);
    try { await done; } catch (error) { throw new Error(failure || error.message); }
  }

  async function saveSale(sale) {
    const tx = db.transaction(["products", "sales"], "readwrite");
    const done = transactionDone(tx);
    const products = tx.objectStore("products");
    let failure;
    for (const item of sale.items) {
      const request = products.get(item.productId);
      request.onsuccess = () => {
        const product = request.result;
        if (!product || product.stock < item.quantity || product.price !== item.price || product.name !== item.name) {
          failure = "El producto, su precio o su stock cambiaron. Volvé a abrir y revisá la venta.";
          tx.abort();
          return;
        }
        product.stock -= item.quantity;
        products.put(product);
      };
    }
    tx.objectStore("sales").add(sale);
    try { await done; } catch (error) { throw new Error(failure || error.message); }
  }

  async function replace(data) {
    const tx = db.transaction(stores, "readwrite");
    const done = transactionDone(tx);
    stores.forEach(name => {
      const store = tx.objectStore(name);
      store.clear();
      data[name].forEach(record => store.put(record));
    });
    await done;
  }

  window.NexoraStorage = { open, all, put, saveSale, replace, stores, dbName };
}());
