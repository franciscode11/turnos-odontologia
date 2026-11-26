import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// RN-GL-04 / DD-07: fuera de src/components/ui no se usan controles nativos.
const CONTROLES_NATIVOS = {
  selector: "JSXOpeningElement[name.name=/^(input|select|textarea|button)$/]",
  message:
    "Usá los componentes de @/components/ui (Entrada, Selector, AreaTexto, Boton...). Los controles nativos solo van dentro del sistema de componentes (RN-GL-04).",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": ["error", CONTROLES_NATIVOS],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: { "no-restricted-syntax": "off" },
  },
  globalIgnores([".claude/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "src/generated/**", "design-system/**", "coverage/**"]),
]);

export default eslintConfig;
