/** Símbolo del logo (molar de trazo, Revision 4). Hereda el color con `currentColor`. */
export function SimboloMarca({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 9c-2.6-1.8-5-2.8-7.4-1.4-4.1 2.3-2.5 8.4-.5 13.3 1.6 3.9 3.4 5.1 4.8 2.4l1.3-3.1c.7-1.8 2.9-1.8 3.6 0l1.3 3.1c1.4 2.7 3.2 1.5 4.8-2.4 2-4.9 3.6-11-.5-13.3C21 6.2 18.6 7.2 16 9Z"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
