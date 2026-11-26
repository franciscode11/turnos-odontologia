"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Dialog, DropdownMenu } from "radix-ui";
import { Avatar } from "./avatar";
import { Icono, type NombreIcono } from "./icono";
import { COOKIE_COLAPSADO } from "./shell-constantes";
import { ProveedorToast } from "./toast";
import { ProveedorTooltip } from "./tooltip";
import type { IconoMenu, SeccionMenu } from "@/server/auth/matriz";
import { cerrarSesion } from "@/server/auth/acciones";

const ICONO_SECCION: Record<IconoMenu, NombreIcono> = {
  agenda: "calendar-event",
  pacientes: "users",
  estadisticas: "chart-bar",
  profesionales: "stethoscope",
  prestaciones: "clipboard-list",
  sillones: "armchair",
  horarios: "clock",
  equipo: "user-plus",
  componentes: "layout-dashboard",
};

const TITULO_GRUPO: Record<SeccionMenu["grupo"], string | null> = {
  principal: null,
  configuracion: "Configuración",
  consultorio: "Consultorio",
};

type Props = {
  marca: string;
  secciones: SeccionMenu[];
  usuario: { nombre: string; rol: string; avatar: string | null };
  /** Estado guardado en la cookie `panel-colapsado` (lo lee el layout en el servidor). */
  colapsadoInicial?: boolean;
  children: ReactNode;
};



function estaActiva(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ListaSecciones({ secciones, pathname, alNavegar }: { secciones: SeccionMenu[]; pathname: string; alNavegar?: () => void }) {
  const grupos = (["principal", "configuracion", "consultorio"] as const)
    .map((g) => ({ grupo: g, items: secciones.filter((s) => s.grupo === g) }))
    .filter((g) => g.items.length > 0);
  return (
    <nav className="sb-nav" aria-label="Principal">
      {grupos.map(({ grupo, items }) => (
        <GrupoMenu key={grupo} titulo={TITULO_GRUPO[grupo]} items={items} pathname={pathname} alNavegar={alNavegar} />
      ))}
    </nav>
  );
}

function GrupoMenu({ titulo, items, pathname, alNavegar }: { titulo: string | null; items: SeccionMenu[]; pathname: string; alNavegar?: () => void }) {
  const lista = useRef<HTMLUListElement>(null);
  const indicador = useRef<HTMLLIElement>(null);
  const activa = items.find((s) => estaActiva(pathname, s.href));
  const primeraVez = useRef(true);

  // Indicador del ítem activo: se desliza con transform (200 ms, ease-out).
  useLayoutEffect(() => {
    const ind = indicador.current;
    const actual = lista.current?.querySelector<HTMLElement>("[aria-current]");
    if (!ind || !actual?.parentElement) return;
    if (primeraVez.current) ind.style.transition = "none";
    ind.style.transform = `translateY(${actual.parentElement.offsetTop}px)`;
    if (primeraVez.current) {
      void ind.offsetHeight;
      ind.style.transition = "";
      primeraVez.current = false;
    }
  }, [pathname]);

  return (
    <>
      {titulo ? <div className="sb-section">{titulo}</div> : null}
      <ul className="sb-list" ref={lista}>
        {activa ? <li className="sb-indicator" aria-hidden="true" ref={indicador} /> : null}
        {items.map((s) => (
          <li key={s.href}>
            <Link className="sb-item" href={s.href} aria-current={estaActiva(pathname, s.href) ? "page" : undefined} title={s.etiqueta} onClick={alNavegar}>
              <Icono nombre={ICONO_SECCION[s.icono]} tamano="nav" />
              <span className="label">{s.etiqueta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function MenuUsuario({ usuario }: { usuario: Props["usuario"] }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="user-btn" type="button" aria-label={`Menú de ${usuario.nombre}`}>
          <Avatar avatar={usuario.avatar} tamano="lg" />
          <span className="user-meta">
            <b>{usuario.nombre}</b>
            <span>{usuario.rol}</span>
          </span>
          <Icono nombre="selector" tamano="sm" className="subtle" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="popover menu-usuario" side="top" align="start" sideOffset={6}>
          <form action={cerrarSesion}>
            <DropdownMenu.Item asChild>
              <button type="submit" className="lb-opt menu-item">
                <Icono nombre="logout" />
                Cerrar sesión
              </button>
            </DropdownMenu.Item>
          </form>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function Marca({ marca }: { marca: string }) {
  return (
    <div className="sb-mark">
      <span className="mark"><Icono nombre="dental" /></span>
      <span className="sb-name">{marca}</span>
    </div>
  );
}

export function ShellPanel({ marca, secciones, usuario, colapsadoInicial = false, children }: Props) {
  const pathname = usePathname();
  const [colapsado, setColapsado] = useState(colapsadoInicial);
  const [menuMovil, setMenuMovil] = useState(false);

  function alternar() {
    const nuevo = !colapsado;
    setColapsado(nuevo);
    document.cookie = `${COOKIE_COLAPSADO}=${nuevo ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <div className="app" data-collapsed={colapsado || undefined}>
      <aside className="sidebar" aria-label="Menú">
        <div className="sb-head">
          <Marca marca={marca} />
          <button className="sb-toggle" type="button" onClick={alternar} aria-label={colapsado ? "Expandir menú" : "Contraer menú"} aria-expanded={!colapsado}>
            <Icono nombre={colapsado ? "sidebar-expand" : "sidebar-collapse"} tamano="nav" />
          </button>
        </div>
        <ListaSecciones secciones={secciones} pathname={pathname} />
        <div className="sb-foot"><MenuUsuario usuario={usuario} /></div>
      </aside>

      <div className="main">
        <Dialog.Root open={menuMovil} onOpenChange={setMenuMovil}>
          <div className="mobile-bar">
            <Marca marca={marca} />
            <Dialog.Trigger asChild>
              <button className="sb-toggle" type="button" aria-label="Abrir menú">
                <Icono nombre="sidebar-expand" tamano="nav" />
              </button>
            </Dialog.Trigger>
          </div>
          <Dialog.Portal>
            <Dialog.Overlay className="sheet-overlay" />
            <Dialog.Content className="sidebar sheet-sidebar" aria-describedby={undefined}>
              <div className="sb-head">
                <Dialog.Title asChild><div><Marca marca={marca} /></div></Dialog.Title>
                <Dialog.Close asChild>
                  <button className="sb-toggle" type="button" aria-label="Cerrar menú"><Icono nombre="x" tamano="nav" /></button>
                </Dialog.Close>
              </div>
              <ListaSecciones secciones={secciones} pathname={pathname} alNavegar={() => setMenuMovil(false)} />
              <div className="sb-foot"><MenuUsuario usuario={usuario} /></div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        <ProveedorTooltip>
          <ProveedorToast>{children}</ProveedorToast>
        </ProveedorTooltip>
      </div>
    </div>
  );
}
