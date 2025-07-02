import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import { defineConfig } from 'eslint/config'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default defineConfig([
  // js
  js.configs.recommended,
  {
    rules: {
      'no-undef': 'off',
    },
  },

  // ts
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  // vue
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'vue/html-closing-bracket-newline': [
        'warn',
        {
          singleline: 'never',
          multiline: 'never',
        },
      ],
      'vue/html-self-closing': [
        'warn',
        {
          html: { normal: 'never', component: 'always' },
        },
      ],
      'vue/max-attributes-per-line': [
        'warn',
        {
          singleline: 1,
          multiline: { max: 1 },
        },
      ],
      'vue/script-indent': ['warn', 2, { baseIndent: 1 }],
      'vue/component-name-in-template-casing': [
        'error',
        'kebab-case',
        {
          registeredComponentsOnly: true,
        },
      ],
    },
  },

  // import sort
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [['^\\u0000', '^node:', '^@?\\w', '^', '^\\.']],
        },
      ],
      'simple-import-sort/exports': 'warn',
    },
  },

  // stylistic rules
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      'vue/multi-word-component-names': 'off',

      '@stylistic/brace-style': 'warn',
      '@stylistic/comma-dangle': ['warn', 'always-multiline'],
      '@stylistic/indent': 'off', // ❗ GLOBAL DISABLE
      '@stylistic/quotes': ['warn', 'single', { avoidEscape: true }],
      '@stylistic/semi': ['warn', 'never'],
      '@stylistic/array-bracket-spacing': ['warn', 'never'],
      '@stylistic/arrow-spacing': ['warn', { before: true, after: true }],
      '@stylistic/comma-spacing': ['warn', { before: false, after: true }],
      '@stylistic/key-spacing': ['warn'],
      '@stylistic/keyword-spacing': ['warn'],
      '@stylistic/no-multi-spaces': ['warn'],
      '@stylistic/no-trailing-spaces': ['warn'],
      '@stylistic/object-curly-spacing': ['warn', 'always'],
      '@stylistic/space-before-function-paren': ['warn', 'always'],
      '@stylistic/space-before-blocks': 'warn',
      '@stylistic/space-infix-ops': ['warn'],
      '@stylistic/space-in-parens': ['warn', 'never'],
      '@stylistic/eol-last': ['warn', 'always'],
      '@stylistic/no-multiple-empty-lines': [
        'warn',
        {
          max: 1,
          maxEOF: 1,
          maxBOF: 0,
        },
      ],
      '@stylistic/linebreak-style': ['warn', 'windows'],
      '@stylistic/member-delimiter-style': [
        'warn',
        {
          multiline: { delimiter: 'comma' },
          singleline: { delimiter: 'comma' },
        },
      ],
      '@stylistic/type-annotation-spacing': 'warn',
    },
  },

])
