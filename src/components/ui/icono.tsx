import {
  IconAlertTriangle, IconArmchair, IconArrowRight, IconCalendarEvent, IconCalendarOff, IconCalendarWeek,
  IconChartBar, IconCheck, IconChevronDown, IconChevronLeft, IconChevronRight, IconCircleCheck,
  IconCircleDashed, IconCircleX, IconClipboardList, IconClock, IconDental, IconDots, IconEye, IconEyeOff,
  IconFileText, IconFilter, IconInbox, IconInfoCircle, IconLayoutDashboard, IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand, IconLoader2, IconLock, IconLogout, IconMail, IconMinus, IconPencil, IconPlus,
  IconSearch, IconSelector, IconSettings, IconStethoscope, IconTrash, IconUpload, IconUser, IconUserCheck,
  IconUserPlus, IconUsers, IconX,
} from "@tabler/icons-react";
import { cn } from "./cn";

const ICONOS = {
  "alert-triangle": IconAlertTriangle, armchair: IconArmchair, "arrow-right": IconArrowRight,
  "calendar-event": IconCalendarEvent, "calendar-off": IconCalendarOff, "calendar-week": IconCalendarWeek,
  "chart-bar": IconChartBar, check: IconCheck, "chevron-down": IconChevronDown, "chevron-left": IconChevronLeft,
  "chevron-right": IconChevronRight, "circle-check": IconCircleCheck, "circle-dashed": IconCircleDashed,
  "circle-x": IconCircleX, "clipboard-list": IconClipboardList, clock: IconClock, dental: IconDental,
  dots: IconDots, eye: IconEye, "eye-off": IconEyeOff, "file-text": IconFileText, filter: IconFilter,
  inbox: IconInbox, "info-circle": IconInfoCircle, "layout-dashboard": IconLayoutDashboard,
  "sidebar-collapse": IconLayoutSidebarLeftCollapse, "sidebar-expand": IconLayoutSidebarLeftExpand,
  loader: IconLoader2, lock: IconLock, logout: IconLogout, mail: IconMail, minus: IconMinus,
  pencil: IconPencil, plus: IconPlus, search: IconSearch, selector: IconSelector, settings: IconSettings,
  stethoscope: IconStethoscope, trash: IconTrash, upload: IconUpload, user: IconUser,
  "user-check": IconUserCheck, "user-plus": IconUserPlus, users: IconUsers, x: IconX,
} as const;

export type NombreIcono = keyof typeof ICONOS;

type Props = {
  nombre: NombreIcono;
  tamano?: "sm" | "md" | "nav";
  className?: string;
  /** Texto para lectores de pantalla. Sin etiqueta, el ícono es decorativo. */
  etiqueta?: string;
};

/** Íconos Tabler de trazo 1,75 (design system). */
export function Icono({ nombre, tamano = "md", className, etiqueta }: Props) {
  const Componente = ICONOS[nombre];
  return (
    <Componente
      className={cn("i", tamano === "sm" && "sm", tamano === "nav" && "nav", className)}
      stroke={1.75}
      aria-hidden={etiqueta ? undefined : true}
      aria-label={etiqueta}
      role={etiqueta ? "img" : undefined}
    />
  );
}
