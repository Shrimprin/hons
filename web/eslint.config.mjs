import eslintConfigNextCoreWebVitals from "eslint-config-next/core-web-vitals";
import eslintConfigNextTypeScript from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([
  ...eslintConfigNextCoreWebVitals,
  ...eslintConfigNextTypeScript,
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      "better-tailwindcss": eslintPluginBetterTailwindcss,
    },
    rules: {
      ...eslintPluginBetterTailwindcss.configs["correctness-warn"].rules,
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "app/globals.css",
      },
    },
  },
  eslintConfigPrettier,
]);

export default eslintConfig;
