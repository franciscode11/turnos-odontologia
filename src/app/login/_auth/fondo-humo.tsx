"use client";

import { useEffect, useRef } from "react";

const VERTEX = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FRAGMENT = [
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
  "gl_FragColor=vec4(c,1.);}",
].join("");

/**
 * Fondo de humo del login (design system, ref. smoke-login) en WebGL sin dependencias.
 * Con movimiento reducido dibuja un cuadro quieto; sin WebGL queda el color de fondo.
 */
export function FondoHumo() {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = lienzo.current;
    if (!canvas) return;
    const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: quieto });
    if (!gl) return;

    const compilar = (tipo: number, fuente: string) => {
      const s = gl.createShader(tipo);
      if (!s) return null;
      gl.shaderSource(s, fuente);
      gl.compileShader(s);
      return s;
    };
    const vs = compilar(gl.VERTEX_SHADER, VERTEX);
    const fs = compilar(gl.FRAGMENT_SHADER, FRAGMENT);
    const programa = gl.createProgram();
    if (!vs || !fs || !programa) return;
    gl.attachShader(programa, vs);
    gl.attachShader(programa, fs);
    gl.linkProgram(programa);
    gl.useProgram(programa);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(programa, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(programa, "r");
    const uT = gl.getUniformLocation(programa, "t");
    const uM = gl.getUniformLocation(programa, "m");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const objetivo = { x: -9999, y: -9999 };
    const pos = { x: -9999, y: -9999 };
    const medir = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    medir();
    const alMover = (e: PointerEvent) => {
      const rc = canvas.getBoundingClientRect();
      objetivo.x = (e.clientX - rc.left) * dpr;
      objetivo.y = (rc.bottom - e.clientY) * dpr;
      if (pos.x < -999) {
        pos.x = objetivo.x;
        pos.y = objetivo.y;
      }
    };
    const contenedor = canvas.parentElement;
    window.addEventListener("resize", medir);
    contenedor?.addEventListener("pointermove", alMover);

    const t0 = performance.now();
    let pedido = 0;
    const cuadro = (ahora: number) => {
      pos.x += (objetivo.x - pos.x) * 0.06;
      pos.y += (objetivo.y - pos.y) * 0.06;
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, 40 + (ahora - t0) / 1000);
      gl.uniform2f(uM, pos.x, pos.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if ((!quieto || ahora - t0 < 1200) && !document.hidden) pedido = requestAnimationFrame(cuadro);
    };
    cuadro(t0);
    const alVolver = () => {
      if (!document.hidden && !quieto) pedido = requestAnimationFrame(cuadro);
    };
    document.addEventListener("visibilitychange", alVolver);

    return () => {
      cancelAnimationFrame(pedido);
      window.removeEventListener("resize", medir);
      contenedor?.removeEventListener("pointermove", alMover);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, []);

  return <canvas ref={lienzo} />;
}
