import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'coverage/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'scripts/**/*.js', 'tests/**/*.js', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
  {
    files: ['public/**/*.js'],
    languageOptions: { globals: { ...globals.browser } },
  },
];
