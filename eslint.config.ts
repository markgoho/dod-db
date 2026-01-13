import js from '@eslint/js';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['functions/lib/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    rules: {
      // Allow underscore prefix for intentionally unused variables
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
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
      // Relax abbreviation rules - many common abbreviations are fine
      'unicorn/prevent-abbreviations': [
        'error',
        {
          allowList: {
            db: true,
            Db: true,
            req: true,
            res: true,
            params: true,
            Params: true,
            args: true,
            str: true,
            def: true,
            tagDef: true,
            doc: true,
            docs: true,
            dir: true,
            ext: true,
            i: true,
            j: true,
            e: true,
            utils: true,
          },
          replacements: {
            // Allow audioDir as-is
            dir: false,
          },
        },
      ],
      // Allow null for DOM APIs and JSON parsing where it's idiomatic
      'unicorn/no-null': 'off',
      // Allow sort() mutation - toSorted() isn't always appropriate
      'unicorn/no-array-sort': 'off',
      // Allow path imports style
      'unicorn/import-style': 'off',
      // Allow process.exit() in CLI scripts
      'unicorn/no-process-exit': 'off',
      // Allow top-level async patterns
      'unicorn/prefer-top-level-await': 'off',
      // Allow array callback references (e.g., .filter(isValid))
      'unicorn/no-array-callback-reference': 'off',
      // Allow consecutive ignored values in destructuring
      'unicorn/no-unreadable-array-destructuring': 'off',
    },
  },
]);
