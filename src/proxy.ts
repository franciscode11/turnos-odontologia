import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rutas públicas (RN-AU-04). Todo lo demás exige sesión.
const RUTAS_PUBLICAS = ["/login", "/activar-cuenta", "/salir"];

function esPublica(pathname: string) {
  return RUTAS_PUBLICAS.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

/**
 * Proxy de Next 16 (antes middleware): refresca la sesión de Supabase y redirige
 * a /login si no hay sesión verificada. Es un chequeo "optimista": cada Server Action
 * vuelve a verificar sesión y rol con requireRol.
 */
export async function proxy(request: NextRequest) {
  let respuesta = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const { pathname } = request.nextUrl;

  if (!url || !clave) {
    // Sin configuración no hay sesión posible: solo se ven las rutas públicas.
    return esPublica(pathname) ? respuesta : NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = createServerClient(url, clave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesAEscribir, headers) {
        for (const { name, value } of cookiesAEscribir) request.cookies.set(name, value);
        respuesta = NextResponse.next({ request });
        for (const { name, value, options } of cookiesAEscribir) respuesta.cookies.set(name, value, options);
        for (const [clave, valor] of Object.entries(headers ?? {})) respuesta.headers.set(clave, valor);
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const conSesion = Boolean(data?.claims?.sub);

  if (!conSesion && !esPublica(pathname)) {
    const destino = new URL("/login", request.url);
    return NextResponse.redirect(destino);
  }

  if (conSesion && pathname === "/login" && !request.nextUrl.searchParams.has("error")) {
    return NextResponse.redirect(new URL("/turnos", request.url));
  }

  return respuesta;
}

export const config = {
  // Excluye estáticos de Next, imágenes y archivos públicos (avatares, logo, fuentes).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|avatars/|.*\\.(?:svg|png|jpg|jpeg|webp|woff2)$).*)"],
};
