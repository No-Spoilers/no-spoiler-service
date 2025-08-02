import globals from 'globals';
import js from '@eslint/js';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.mocha,
        ...globals.chai,
      },
    },
    rules: {
      'no-console': 'off',
      'no-trailing-spaces': 'error',
      'quote-props': ['error', 'as-needed'],
      quotes: ['error', 'single'],
      'no-var': 'error',
      'prefer-const': 'error',
      'comma-style': 'error',
      'object-curly-spacing': ['error', 'always'],
      indent: ['error', 2, { SwitchCase: 1 }]
    }
  },

  js.configs.recommended,

  {
    ignores: ['node_modules/', 'dist/', 'build/'],
  },
];
