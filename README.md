# NEXORA

Base estática de gestión comercial para uso individual en un navegador y dispositivo. No necesita servidor de aplicación, API, cuentas, dependencias ni servicios externos. La interfaz y los formatos son argentinos por defecto.

## Inicio

Abrí `index.html` en un navegador moderno con JavaScript e IndexedDB habilitados. También podés abrir `clientes/demo/index.html`. Ambas entradas usan la misma configuración de ejemplo. En algunos navegadores, el almacenamiento o las descargas desde `file:` pueden estar restringidos o tratarse de forma diferente: si ocurre, usá la publicación HTTPS de GitHub Pages. Los datos de `file:`, `localhost` y GitHub Pages no son compartidos; para trasladarlos usá una copia JSON.

1. Cargá clientes y productos, indicando precio y stock.
2. Registrá ventas con uno o más productos. La operación guarda los precios y descuenta stock en una transacción.
3. Registrá gastos y consultá el resumen o los reportes. El balance es ingresos menos gastos registrados: **no** calcula utilidad, costo de mercadería, impuestos ni movimientos de caja.
4. En Configuración > Copias de seguridad, exportá una copia JSON. El navegador inicia una descarga en el dispositivo desde el que se usa la aplicación; comprobá que el archivo se haya guardado y pueda recuperarse. La exportación es manual.

No hay datos de demostración precargados. Los clientes, productos y gastos se pueden editar. Las ventas confirmadas son históricas y no se pueden editar, eliminar ni anular; la corrección de stock se realiza editando el producto y no genera una anulación contable. Esta versión no ofrece facturación fiscal, devoluciones ni conciliación de pagos.

## Datos y seguridad

- IndexedDB guarda clientes, productos, ventas y gastos; LocalStorage guarda el tema y la fecha en que se inició la última descarga de copia. Los cambios se guardan automáticamente. Si el almacenamiento falla, la aplicación informa el error.
- La información **no está en la nube**. Borrar datos del navegador, cambiar de navegador o dispositivo, usar navegación privada, perder el dispositivo o que el navegador elimine almacenamiento puede causar pérdida de datos. No hay sincronización ni recuperación automática.
- Exportá copias frecuentes y guardalas fuera del dispositivo, en un lugar seguro. Son archivos JSON **sin cifrar** y pueden contener información privada. La fecha del panel indica que se inició la descarga, no que se guardó ni que se verificó la copia.
- La importación valida el formato, esquema, identificador y registros; luego reemplaza **todos** los datos en una única transacción tras solicitar confirmación. Exportá primero el estado actual. La copia no incluye preferencias visuales ni configuración del cliente.
- No existe inicio de sesión, control de acceso, cifrado, separación segura entre usuarios ni protección frente a personas o extensiones con acceso al navegador. No guardes contraseñas ni información sensible. Ocultar módulos no es un mecanismo de seguridad.
- GitHub Pages publica archivos estáticos: considerá público todo archivo desplegado. No incluyas datos de clientes, copias, credenciales ni información privada en el repositorio. Antes de publicar, revisá la visibilidad efectiva del repositorio y del sitio. Pages no proporciona autenticación para esta aplicación.
- Usá una sola pestaña por negocio para evitar conflictos. La venta y el descuento de stock son atómicos; se detectan cambios concurrentes de stock y precio al confirmar una venta y cambios de stock al editar un producto, pero no existe colaboración ni gestión integral de concurrencia.

## Estructura

```text
index.html                 Entrada de demostración
nexora-core/
  app.js                   Coordinación, formularios, reglas y exportación
  storage.js               IndexedDB y transacciones
  styles.css               Sistema visual
  modulos/                 Vistas independientes de cada módulo y diagnóstico
clientes/
  demo/
    index.html             Entrada independiente del cliente
    config.js              Identidad y módulos
    assets/logo.svg        Recurso visual de ejemplo
```

El núcleo no depende de la identidad del cliente. Las vistas reciben datos y funciones compartidas; el almacenamiento y las operaciones se coordinan desde el núcleo. Los datos se guardan en la base `nexora-<id>` del origen actual. No se crean archivos de datos dentro del proyecto.

## Crear una versión para otro cliente

1. Copiá la carpeta `clientes/demo` a `clientes/nombre-del-cliente`, conservando su estructura. Los enlaces de la entrada apuntan al núcleo común.
2. Editá el nuevo `config.js`. Usá un `id` único y estable, con letras, números, guiones o guiones bajos. No lo cambies después de comenzar a usar la aplicación: cambiarlo abre otra base y las copias anteriores no coincidirán.
3. Configurá `appName`, `businessName`, `tagline`, colores CSS, familia de `font`, `currency` (código ISO, por ejemplo `ARS`), `locale` y datos de `contact`. Usá tipografías instaladas o recursos locales; no se cargan fuentes externas.
4. Reemplazá el logo y ajustá `logo` con una ruta relativa a la carpeta del archivo `config.js`, por ejemplo `assets/logo.svg`. Una cadena vacía muestra la inicial. Adaptá el color del recurso visual si cambia la identidad.
5. Elegí y ordená `modules` entre `dashboard`, `clientes`, `productos`, `ventas`, `gastos` y `reportes`. Configuración siempre está disponible. Si activás ventas, mantené productos habilitado para poder administrar el catálogo y stock. Los módulos ocultos no borran datos; el resumen y las copias pueden incluir datos históricos de módulos ocultos.
6. Probá `clientes/nombre-del-cliente/index.html`, la identidad, navegación, registro y copia/restauración con datos de prueba. Si querés que la raíz abra esa versión, modificá únicamente el enlace al archivo de configuración en el `index.html` raíz.

Los identificadores separan bases dentro del mismo origen, pero no ofrecen aislamiento de seguridad. Una copia se restaura únicamente si el `id` coincide. Cambiar dominio, protocolo, puerto o navegador cambia el origen del almacenamiento; exportá e importá para migrar.

## Publicar en GitHub Pages

1. Creá un repositorio **sin datos privados** y subí el contenido del proyecto con Git desde VS Code.
2. En la configuración del repositorio, habilitá Pages desde la rama y carpeta raíz publicadas. Esperá a que GitHub indique la URL.
3. Abrí la URL del sitio y también la ruta `clientes/nombre-del-cliente/`. Las referencias a recursos son relativas, por lo que admiten el prefijo del repositorio. Probá navegación, formularios, descargas y restauración en ese origen.
4. Para distribuir clientes por separado, mantené un repositorio y publicación por cliente o publicá únicamente los archivos que corresponda. Si se publican varias carpetas en el mismo sitio, todas son accesibles a quien conozca sus rutas.

La aplicación puede abrirse desde archivos locales en navegadores compatibles; GitHub Pages solo entrega archivos estáticos. No requiere servidor de Node.js ni servicios adicionales.

## Actualización y soporte

1. Antes de actualizar, pedí al usuario que exporte y verifique una copia JSON. Conservá también una copia de la configuración y recursos propios del cliente.
2. Probá el nuevo núcleo en una copia de trabajo y con datos no sensibles. Revisá compatibilidad del esquema de respaldo y probá una restauración.
3. Actualizá `nexora-core` y, si cambiaron las etiquetas de scripts o estilos, actualizá también las entradas HTML. Conservá `clientes/<cliente>/config.js` y sus recursos. Revisá las instrucciones de cada versión antes de reemplazar archivos.
4. Publicá, comprobá la URL real de Pages, módulos activos, diagnóstico, registro y exportación. No borres datos del navegador durante la actualización.

El panel Configuración muestra versión, disponibilidad de IndexedDB al inicio, última descarga solicitada, módulos, identidad, contacto y cantidad de registros. Para soporte, solicitá una descripción del error y versión; no solicites copias con datos privados sin autorización y un canal apropiado. Ofrecé personalización, publicación, actualizaciones y recuperación como servicios separados; esta base no incluye infraestructura de soporte ni garantiza disponibilidad o cumplimiento normativo.

El esquema actual de copias es `nexora-backup` versión 1. Futuras versiones que cambien estructuras deben incorporar migraciones explícitas para IndexedDB y copias anteriores antes de publicarse; reemplazar el código por sí solo no migra datos.
