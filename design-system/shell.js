/* Comportamiento de las vistas de referencia del design system (no es código de la app).
   - Arma el sidebar (ref: 21st.dev @wensity/sidebar) en <aside data-sidebar data-active="...">.
   - Demos interactivas: colapsar menú, indicador animado, toasts, diálogos, popovers,
     contraseña, checkboxes, switches, chips, segmentado y botón con estado de carga.
   Los tiempos salen de tokens.css (se leen con getComputedStyle). */
(function () {
  var DS_BASE = (document.currentScript && document.currentScript.src || '').replace(/shell\.js(\?.*)?$/, '');
  var NAV = [
    { items: [
      { id: "turnos", label: "Agenda", icon: "calendar-event", count: "18", href: "panel-turnos.html" },
      { id: "pacientes", label: "Pacientes", icon: "users" },
      { id: "estadisticas", label: "Estadísticas", icon: "chart-bar", href: "estadisticas.html" }
    ]},
    { title: "Configuración", items: [
      { id: "profesionales", label: "Profesionales", icon: "stethoscope" },
      { id: "prestaciones", label: "Prestaciones", icon: "clipboard-list" },
      { id: "sillones", label: "Sillones", icon: "armchair" },
      { id: "horarios", label: "Horarios", icon: "clock" }
    ]},
    { title: "Consultorio", items: [
      { id: "equipo", label: "Equipo", icon: "user-plus", href: "equipo.html" },
      { id: "componentes", label: "Componentes", icon: "layout-dashboard", href: "../components.html" }
    ]}
  ];
  function icon(n, cls) { return '<svg class="i ' + (cls || "") + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }
  window.dsIcon = icon;

  function ms(name) { var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return parseFloat(v) || 0; }

  function buildSidebar(aside) {
    var active = aside.getAttribute("data-active");
    var inScreens = location.pathname.indexOf("/screens/") !== -1;
    var html = '<div class="sb-head"><div class="sb-mark"><span class="mark">' + icon("dental") + '</span><span class="sb-name" data-brand-name>' + (window.BRAND_NAME || "") + '</span></div>' +
      '<button class="sb-toggle" type="button" aria-label="Contraer menú" data-sb-toggle>' + icon("layout-sidebar-left-collapse", "nav") + '</button></div><nav class="sb-nav" aria-label="Principal">';
    NAV.forEach(function (sec) {
      if (sec.title) html += '<div class="sb-section">' + sec.title + '</div>';
      html += '<ul class="sb-list">' + (sec.items.some(function (i) { return i.id === active; }) ? '<li class="sb-indicator" aria-hidden="true"></li>' : "");
      sec.items.forEach(function (it) {
        var href = it.href ? (inScreens ? it.href : (it.href.indexOf("../") === 0 ? it.href.slice(3) : "screens/" + it.href)) : "#";
        html += '<li><a class="sb-item" href="' + href + '"' + (it.id === active ? ' aria-current="page"' : "") + ' data-tip="' + it.label + '">' + icon(it.icon, "nav") + '<span class="label">' + it.label + '</span>' + (it.count ? '<span class="count">' + it.count + '</span>' : "") + '</a></li>';
      });
      html += "</ul>";
    });
    html += '</nav><div class="sb-foot"><button class="user-btn" type="button"><span class="avatar lg"><img src="' + DS_BASE + 'assets/avatars/avatar-01-remera-naranja.webp" alt=""></span><span class="user-meta"><b>Francisco Valles</b><span>Administrador</span></span>' + icon("selector", "sm subtle") + '</button></div>';
    aside.innerHTML = html;

    // Indicador animado del ítem activo (transform, 200ms ease-out)
    aside.querySelectorAll(".sb-list").forEach(function (list) {
      var ind = list.querySelector(".sb-indicator");
      if (!ind) return;
      function place(a) { ind.style.transform = "translateY(" + a.parentElement.offsetTop + "px)"; }
      var cur = list.querySelector("[aria-current]");
      ind.style.transition = "none"; place(cur); ind.offsetHeight; ind.style.transition = "";
      list.querySelectorAll(".sb-item").forEach(function (a) {
        a.addEventListener("click", function (e) {
          if (a.getAttribute("href") === "#") e.preventDefault();
          list.querySelectorAll("[aria-current]").forEach(function (x) { x.removeAttribute("aria-current"); });
          a.setAttribute("aria-current", "page"); place(a);
        });
      });
    });

    var app = aside.closest(".app");
    aside.querySelector("[data-sb-toggle]").addEventListener("click", function () {
      var c = app.getAttribute("data-collapsed") === "true";
      app.setAttribute("data-collapsed", c ? "false" : "true");
      this.innerHTML = icon(c ? "layout-sidebar-left-collapse" : "layout-sidebar-left-expand", "nav");
      this.setAttribute("aria-label", c ? "Contraer menú" : "Expandir menú");
    });
  }

  // ---------- Toasts ----------
  var TOAST_ICON = { success: "circle-check", error: "circle-x", warning: "alert-triangle", info: "info-circle" };
  window.dsToast = function (type, title, detail) {
    var host = document.querySelector(".toaster") || document.body.appendChild(Object.assign(document.createElement("div"), { className: "toaster", role: "region", ariaLabel: "Notificaciones" }));
    var t = document.createElement("div");
    t.className = "toast t-" + type; t.setAttribute("role", type === "error" ? "alert" : "status");
    t.innerHTML = icon(TOAST_ICON[type]) + '<div class="t-text"><b>' + title + '</b>' + (detail ? ' <span>' + detail + '</span>' : "") + '</div><button class="t-close" aria-label="Cerrar">' + icon("x", "sm") + '</button>';
    t.setAttribute("data-entering", ""); host.appendChild(t);
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.removeAttribute("data-entering"); }); });
    var life = type === "error" ? 6000 : ms("--toast-duration"), timer, left = life, start;
    function close() { t.setAttribute("data-leaving", ""); setTimeout(function () { t.remove(); }, ms("--dur-toast-exit")); }
    function run() { start = Date.now(); timer = setTimeout(close, left); }
    t.addEventListener("mouseenter", function () { clearTimeout(timer); left -= Date.now() - start; });
    t.addEventListener("mouseleave", run);
    t.querySelector(".t-close").addEventListener("click", close);
    run();
  };

  function wire() {
    document.querySelectorAll("[data-toast]").forEach(function (b) {
      b.addEventListener("click", function () { var p = b.getAttribute("data-toast").split("|"); dsToast(p[0], p[1], p[2]); });
    });
    // Diálogos
    document.querySelectorAll("[data-open]").forEach(function (b) {
      b.addEventListener("click", function () { document.getElementById(b.getAttribute("data-open")).setAttribute("data-state", "open"); });
    });
    document.querySelectorAll(".overlay").forEach(function (o) {
      o.addEventListener("click", function (e) { if (e.target === o || e.target.closest("[data-close]")) o.setAttribute("data-state", "closed"); });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") document.querySelectorAll(".overlay[data-state=open]").forEach(function (o) { o.setAttribute("data-state", "closed"); }); });
    // Popovers
    document.querySelectorAll("[data-pop]").forEach(function (b) {
      var p = document.getElementById(b.getAttribute("data-pop"));
      b.addEventListener("click", function (e) { e.stopPropagation(); p.setAttribute("data-state", p.getAttribute("data-state") === "open" ? "closed" : "open"); b.setAttribute("aria-expanded", p.getAttribute("data-state") === "open"); });
    });
    document.addEventListener("click", function (e) { document.querySelectorAll(".popover[data-dismiss][data-state=open]").forEach(function (p) { if (!p.contains(e.target)) p.setAttribute("data-state", "closed"); }); });
    // Contraseña
    document.querySelectorAll("[data-reveal]").forEach(function (b) {
      b.addEventListener("click", function () { var i = document.getElementById(b.getAttribute("data-reveal")); var show = i.type === "password"; i.type = show ? "text" : "password"; b.innerHTML = icon(show ? "eye-off" : "eye"); b.setAttribute("aria-label", show ? "Ocultar contraseña" : "Mostrar contraseña"); });
    });
    // Limpiar búsqueda
    document.querySelectorAll("[data-clear]").forEach(function (b) { b.addEventListener("click", function () { var i = document.getElementById(b.getAttribute("data-clear")); i.value = ""; i.focus(); }); });
    // Checkbox / switch / radio
    document.querySelectorAll(".choice").forEach(function (c) {
      c.addEventListener("click", function () {
        var el = c.querySelector(".box, .switch"); if (!el || el.closest("[data-static]")) return;
        if (el.classList.contains("radio")) { var g = c.closest("[role=radiogroup]"); g.querySelectorAll(".radio").forEach(function (r) { r.setAttribute("data-state", "unchecked"); }); el.setAttribute("data-state", "checked"); return; }
        var on = el.getAttribute("data-state") === "checked"; el.setAttribute("data-state", on ? "unchecked" : "checked");
        if (el.classList.contains("box")) el.innerHTML = on ? "" : icon("check");
      });
    });
    // Segmentado
    document.querySelectorAll(".segmented").forEach(function (s) { s.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; s.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true"); }); });
    // Swatches
    document.querySelectorAll(".swatches").forEach(function (s) { s.addEventListener("click", function (e) { var b = e.target.closest(".swatch"); if (!b) return; s.querySelectorAll(".swatch").forEach(function (x) { x.setAttribute("aria-checked", "false"); }); b.setAttribute("aria-checked", "true"); }); });
    // Chips
    document.querySelectorAll(".chip button").forEach(function (b) { b.addEventListener("click", function (e) { e.stopPropagation(); b.parentElement.remove(); }); });
    // Botón con carga: muestra el spinner recién a los 150ms y lo mantiene al menos 400ms
    document.querySelectorAll("[data-loading-demo]").forEach(function (b) {
      var label = b.innerHTML;
      b.addEventListener("click", function () {
        if (b.getAttribute("data-loading") === "true") return;
        var t0 = Date.now(), shown = 0, response = parseInt(b.getAttribute("data-loading-demo"), 10);
        b.setAttribute("data-loading", "true"); b.setAttribute("aria-busy", "true");
        var st = setTimeout(function () { shown = Date.now(); b.innerHTML = icon("loader-2", "spin") + "Guardando"; }, ms("--delay-spinner"));
        setTimeout(function () {
          clearTimeout(st);
          var wait = shown ? Math.max(0, ms("--min-spinner") - (Date.now() - shown)) : 0;
          setTimeout(function () { b.innerHTML = label; b.removeAttribute("data-loading"); b.removeAttribute("aria-busy"); dsToast("success", "Turno creado", "Martina Sosa, mié 25/11 10:30"); }, wait);
        }, response);
      });
    });
  }

  function init() {
    document.querySelectorAll("[data-sidebar]").forEach(buildSidebar);
    document.querySelectorAll("[data-icon]").forEach(function (el) { el.outerHTML = icon(el.getAttribute("data-icon"), el.className); });
    wire();
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
