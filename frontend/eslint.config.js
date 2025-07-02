import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import json from "@eslint/json";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  {
    rules: {
      // https://typescript-eslint.io/rules/no-explicit-any/
      '@typescript-eslint/no-explicit-any': 'error',

      // https://typescript-eslint.io/rules/no-unused-vars/
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  pluginVue.configs["flat/recommended"],
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        ecmaVersion: 'latest',
      },
    },
    rules: {
      // https://eslint.vuejs.org/rules/html-closing-bracket-newline.html
      // html closing bracket will not in a separate line.
      'vue/html-closing-bracket-newline': [
        'warn',
        {
          singleline: 'never',
          multiline: 'never',
        },
      ],

      // https://eslint.vuejs.org/rules/html-self-closing.html
      // never use /> for html tag, always use /> for vue component
      'vue/html-self-closing': ['warn', {
        'html': { normal: 'never', component: 'always' },
      }],

      // https://eslint.vuejs.org/rules/max-attributes-per-line.html
      'vue/max-attributes-per-line': [
        'warn',
        {
          singleline: 1,
          multiline: {
            max: 1,
          },
        },
      ],

      // https://eslint.vuejs.org/rules/script-indent.html
      // allow line folding on <script setup>, need to overrides rules indent to off
      'vue/script-indent': ['warn', 2, { baseIndent: 1 }],

      // https://eslint.vuejs.org/rules/component-name-in-template-casing.html
      // always use kebab case for html tag.
      'vue/component-name-in-template-casing': [
        'error',
        'kebab-case',
        {
          registeredComponentsOnly: true,
        },
      ],
    },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'warn',
        {
          // remove blank lines between import group
          groups: [['^\\u0000', '^node:', '^@?\\w', '^', '^\\.']],
        },
      ],
      'simple-import-sort/exports': 'warn',
    },
  },

  // stylistic js
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      // https://eslint.org/docs/latest/rules/brace-style
      // https://eslint.style/rules/js/brace-style
      '@stylistic/brace-style': 'warn', // [1tbs default, stroustrup, allman]

      // https://eslint.org/docs/latest/rules/comma-dangle
      // https://eslint.style/rules/js/comma-dangle
      '@stylistic/comma-dangle': ['warn', 'always-multiline'],

      // https://eslint.org/docs/latest/rules/indent
      // https://eslint.style/rules/js/indent
      '@stylistic/indent': ['warn', 2],

      // https://eslint.org/docs/latest/rules/quotes
      // https://eslint.style/rules/js/quotes
      '@stylistic/quotes': ['warn', 'single', { avoidEscape: true }],

      // https://eslint.org/docs/latest/rules/semi
      // https://eslint.style/rules/js/semi
      '@stylistic/semi': ['warn', 'never'],

      // https://eslint.org/docs/latest/rules/array-bracket-spacing
      // https://eslint.style/rules/js/array-bracket-spacing
      '@stylistic/array-bracket-spacing': ['warn', 'never'],

      // https://eslint.org/docs/latest/rules/arrow-spacing
      // https://eslint.style/rules/js/arrow-spacing
      '@stylistic/arrow-spacing': ['warn', { before: true, after: true }],

      // https://eslint.org/docs/latest/rules/comma-spacing
      // https://eslint.style/rules/js/comma-spacing
      '@stylistic/comma-spacing': ['warn', { before: false, after: true }],

      // https://eslint.org/docs/latest/rules/key-spacing
      // https://eslint.style/rules/js/key-spacing
      '@stylistic/key-spacing': ['warn'],

      // https://eslint.org/docs/latest/rules/keyword-spacing
      // https://eslint.style/rules/js/keyword-spacing
      '@stylistic/keyword-spacing': ['warn'],

      // https://eslint.org/docs/latest/rules/no-multi-spaces
      // https://eslint.style/rules/js/no-multi-spaces
      '@stylistic/no-multi-spaces': ['warn'],

      // https://eslint.org/docs/latest/rules/no-trailing-spaces
      // https://eslint.style/rules/js/no-trailing-spaces
      '@stylistic/no-trailing-spaces': ['warn'],

      // https://eslint.org/docs/latest/rules/object-curly-spacing
      // https://eslint.style/rules/js/object-curly-spacing
      '@stylistic/object-curly-spacing': ['warn', 'always'],

      // https://eslint.org/docs/latest/rules/space-before-function-paren
      // https://eslint.style/rules/js/space-before-function-paren
      '@stylistic/space-before-function-paren': ['warn', 'always'],

      // https://eslint.org/docs/latest/rules/space-before-blocks
      // https://eslint.style/rules/js/space-before-blocks
      '@stylistic/space-before-blocks': 'warn',

      // https://eslint.org/docs/latest/rules/space-infix-ops
      // https://eslint.style/rules/js/space-infix-ops
      '@stylistic/space-infix-ops': ['warn'],

      // https://eslint.org/docs/latest/rules/space-in-parens
      // https://eslint.style/rules/js/space-in-parens
      '@stylistic/space-in-parens': ['warn', 'never'],

      // https://eslint.org/docs/latest/rules/padding-line-between-statements
      // https://eslint.style/rules/js/padding-line-between-statements
      '@stylistic/padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'never', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: 'export', next: '*' },
      ],

      // https://eslint.style/rules/js/eol-last
      '@stylistic/eol-last': ['warn', 'always'],

      // https://eslint.style/rules/js/no-multiple-empty-lines
      '@stylistic/no-multiple-empty-lines': [
        'warn',
        {
          max: 1,
          maxEOF: 1,
          maxBOF: 0,
        },
      ],

      // https://eslint.org/docs/latest/rules/linebreak-style
      // https://eslint.style/rules/js/linebreak-style
      '@stylistic/linebreak-style': ['warn', 'windows'],

      // https://typescript-eslint.io/rules/member-delimiter-style/
      '@stylistic/member-delimiter-style': [
        'warn',
        {
          multiline: {
            delimiter: 'comma', // default: 'semi'
          },
          singleline: {
            delimiter: 'comma', // default: 'semi'
          },
        },
      ],
      // https://typescript-eslint.io/rules/type-annotation-spacing/
      '@stylistic/type-annotation-spacing': 'warn',
    },
  },

   {
    files: ['**/*.vue'],
    rules: {
      '@stylistic/indent': 'off',
    },
  },

  { files: ["**/*.vue"], languageOptions: { parserOptions: { parser: tseslint.parser } } },
  { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
  { files: ["**/*.css"], plugins: { css }, language: "css/css", extends: ["css/recommended"] },
]);
