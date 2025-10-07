import eslint from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import reactPlugin from 'eslint-plugin-react'
import stylistic from '@stylistic/eslint-plugin'
import tsEslint from 'typescript-eslint'

const config = tsEslint.config(
  eslint.configs.recommended,
  tsEslint.configs.recommended,
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    jsx: true,
  }),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      'import': importPlugin,
      '@stylistic': stylistic,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      'react': {
        version: 'detect',
      },
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      '@stylistic/array-element-newline': ['error', 'consistent'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/space-unary-ops': 'error',
      '@stylistic/template-curly-spacing': ['error', 'never'],
      '@typescript-eslint/no-unused-expressions': ['error', {
        allowShortCircuit: true,
        allowTernary: true,
      }],

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',

      'camelcase': ['error', {
        ignoreGlobals: true,
        properties: 'never',
        allow: ['^o_', 'node_*', 'npm_*'],
      }],

      'id-length': ['error', {
        exceptions: ['a', 'b', 't', 'q', 'e', 'i', 'j', '_'],
        properties: 'never',
      }],

      'max-len': ['warn', {
        code: 140,
        ignoreTemplateLiterals: true,
        ignoreUrls: true,
      }],

      'no-unused-expressions': ['error', {
        allowShortCircuit: true,
        allowTernary: true,
      }],

      'prefer-template': 'error',

      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',

      'import/order': ['warn', {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type',
        ],

        pathGroups: [{
          pattern: '@/**',
          group: 'internal',
        }],
      }],

      'react/prefer-stateless-function': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
)

export default config
