// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      quotes: [
        'error',
        'single',
        { avoidEscape: true, allowTemplateLiterals: true },
      ],
      'jsx-quotes': ['error', 'prefer-single'],
      'max-len': [
        'warn',
        {
          code: 130,
          tabWidth: 2,
          ignoreComments: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
          ignorePattern: String.raw`^import\s+`,
        },
      ],
    },
  },
]);
