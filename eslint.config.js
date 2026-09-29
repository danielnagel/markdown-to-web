import js from '@eslint/js';
import vuePlugin from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import globals from 'globals';

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
  },

  js.configs.recommended,

  ...vuePlugin.configs['flat/recommended'].map((config) => ({
    ...config,
    files: ['frontend/**/*.vue', 'frontend/**/*.js'],
  })),
  {
    files: ['frontend/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['frontend/**/*.js'],
    ignores: ['frontend/scripts/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
  },

  // Backend + frontend/scripts (build-time helpers like apply-assets.mjs)
  // run under Node, not a browser, so they need Node globals (process, ...).
  {
    files: ['backend/**/*.js', 'frontend/scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
];
