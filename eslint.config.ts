import js from '@eslint/js';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    plugins: {
      unicorn,
    },
    rules: {
      ...unicorn.configs.recommended.rules,
      // Allow arrow functions in computed signals and similar reactive contexts
      'unicorn/consistent-function-scoping': [
        'error',
        {
          checkArrowFunctions: false,
        },
      ],
    },
  },
]);
