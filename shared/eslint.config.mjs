import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir,
      },
    },
  },
  {
    ignores: ['node_modules/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  eslintConfigPrettier,
);
