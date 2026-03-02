import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.vercel', 'node_modules']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Loosen some aggressive rules to reduce friction while retaining guidance
      'no-unused-vars': ['warn', { vars: 'all', args: 'none', ignoreRestSiblings: true, varsIgnorePattern: '^[A-Z_]' }],
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-refresh/only-export-components': 'warn',

      // === CLAUDE.md Non-Negotiables (automated enforcement) ===

      // 1.7: Use logger module, never console.* directly
      'no-console': 'error',

      // 1.1: No ES2023+ methods — crashes Safari <16, Chrome <110
      'no-restricted-syntax': ['error',
        {
          selector: "CallExpression[callee.property.name='toSorted']",
          message: 'No toSorted() — use slice().sort(). Crashes Safari <16. (CLAUDE.md 1.1)',
        },
        {
          selector: "CallExpression[callee.property.name='toReversed']",
          message: 'No toReversed() — use slice().reverse(). Crashes Safari <16. (CLAUDE.md 1.1)',
        },
        {
          selector: "CallExpression[callee.property.name='toSpliced']",
          message: 'No toSpliced() — use slice() + splice(). Crashes Safari <16. (CLAUDE.md 1.1)',
        },
        {
          selector: "CallExpression[callee.property.name='findLast']",
          message: 'No findLast() — use slice().reverse().find(). Crashes older browsers. (CLAUDE.md 1.1)',
        },
        {
          selector: "CallExpression[callee.property.name='findLastIndex']",
          message: 'No findLastIndex() — not supported in older browsers. (CLAUDE.md 1.1)',
        },
      ],

      // 1.8: No direct localStorage — use src/lib/storage.js
      'no-restricted-globals': ['error',
        {
          name: 'localStorage',
          message: 'No direct localStorage — use getStorageItem/setStorageItem from src/lib/storage.js. (CLAUDE.md 1.8)',
        },
      ],
    },
  },
  // === Overrides for files with legitimate console/localStorage usage ===
  {
    files: ['src/utils/logger.js'],
    rules: {
      'no-console': 'off', // Logger IS the console wrapper
    },
  },
  {
    files: ['src/lib/storage.js', 'src/lib/supabase.js'],
    rules: {
      'no-restricted-globals': 'off', // These ARE the localStorage wrappers
    },
  },
  {
    files: ['**/*.test.{js,jsx}', 'src/test/**'],
    rules: {
      'no-console': 'off', // Tests can use console for debugging
    },
  },
])
