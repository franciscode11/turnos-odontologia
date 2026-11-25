/* Nombre visible del producto (provisional). Cambiarlo acá actualiza todas las vistas HTML
   que usan [data-brand-name]. Script clásico (no módulo) para que funcione abriendo el
   archivo con file://. En la app Next.js, el mismo valor vive en src/config/brand.ts. */
(function () {
  var BRAND_NAME = "Turnos Odontología"; // (TBD) nombre comercial definitivo
  window.BRAND_NAME = BRAND_NAME;
  function bind() {
    document.querySelectorAll("[data-brand-name]").forEach(function (el) { el.textContent = BRAND_NAME; });
    document.title = document.title.replace("{brand}", BRAND_NAME);
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", bind) : bind();
})();
