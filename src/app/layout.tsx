import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { BRAND_DESCRIPTION, BRAND_NAME } from "@/config/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: BRAND_NAME, template: `%s · ${BRAND_NAME}` },
  description: BRAND_DESCRIPTION,
};

export const viewport: Viewport = { themeColor: "#0e7a6b" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
