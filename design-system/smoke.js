/* Fondo de humo del login (ref: 21st.dev @aakashmehra/smoke-login), en WebGL sin dependencias.
   Humo gris sobre tinta con un hilo verde azulado; el puntero lo arremolina con un resorte suave.
   Con prefers-reduced-motion se dibuja un solo cuadro quieto. Sin WebGL queda el color de fondo. */
(function () {
  function start(canvas) {
    var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: still });
    if (!gl) return;
    var vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    var fs = [
      "precision highp float;uniform vec2 r;uniform float t;uniform vec2 m;",
      "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
      "float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}",
      "float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<6;i++){v+=a*n(p);p=R*p*2.02;a*=.5;}return v;}",
      "void main(){vec2 uv=gl_FragCoord.xy/r.y;vec2 d=uv-m/r.y;float fall=exp(-dot(d,d)*7.);uv+=vec2(-d.y,d.x)*fall*.3;",
      "float T=t*.035;vec2 q=vec2(fbm(uv*1.1+T),fbm(uv*1.1+vec2(5.2,1.3)-T));",
      "vec2 w=vec2(fbm(uv*1.1+3.*q+vec2(1.7,9.2)+T*1.4),fbm(uv*1.1+3.*q+vec2(8.3,2.8)-T));",
      "float f=fbm(uv*1.1+3.*w);",
      "vec3 ink=vec3(.047,.067,.063);vec3 smoke=vec3(.79,.84,.83);",
      "vec3 c=mix(ink,smoke,clamp(smoothstep(.22,.9,f)*.9+length(q)*.1-.04,0.,1.));",
      "float line=smoothstep(.0045,0.,abs(q.x-.42+.06*(f-.5)))*(.55+.45*smoothstep(.2,.7,f));",
      "c=mix(c,vec3(.184,.827,.718),clamp(line*1.1,0.,1.));",
      "vec2 st=gl_FragCoord.xy/r;c*=.7+.3*smoothstep(1.3,.1,length(st-vec2(.35,.62)));",
      "gl_FragColor=vec4(c,1.);}"
    ].join("");
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(pr, "r"), uT = gl.getUniformLocation(pr, "t"), uM = gl.getUniformLocation(pr, "m");
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5), target = { x: -9999, y: -9999 }, pos = { x: -9999, y: -9999 };
    function size() { canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr; gl.viewport(0, 0, canvas.width, canvas.height); }
    size(); window.addEventListener("resize", size);
    canvas.parentElement.addEventListener("pointermove", function (e) { var rc = canvas.getBoundingClientRect(); target.x = (e.clientX - rc.left) * dpr; target.y = (rc.bottom - e.clientY) * dpr; if (pos.x < -999) { pos.x = target.x; pos.y = target.y; } });
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, t0 = performance.now();
    function frame(now) {
      pos.x += (target.x - pos.x) * 0.06; pos.y += (target.y - pos.y) * 0.06; // resorte suave
      gl.uniform2f(uR, canvas.width, canvas.height); gl.uniform1f(uT, 40 + (now - t0) / 1000); gl.uniform2f(uM, pos.x, pos.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if ((!reduce || now - t0 < 1200) && !document.hidden) requestAnimationFrame(frame);
    }
    frame(t0);
    document.addEventListener("visibilitychange", function () { if (!document.hidden && !reduce) requestAnimationFrame(frame); });
  }
  function init() { document.querySelectorAll("canvas[data-smoke]").forEach(start); }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
