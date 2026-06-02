import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores([
    'dist',
    'coverage',
    'playwright-report',
    'test-results',
    'src/components/ui/**',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx}', 'src/test/**'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['e2e/**', 'playwright.config.ts', 'vite.config.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // router.tsx to moduł konfiguracji tras (eksportuje `router`), nie moduł
    // komponentu pod HMR. Definicje lazy() obok eksportu nie-komponentu wyzwalają
    // regułę react-refresh, która tu nie ma zastosowania — wyłączamy ją punktowo.
    files: ['src/app/router.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  prettier,
]);
