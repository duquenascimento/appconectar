const { defineConfig } = require('eslint/config');

const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');

const { fixupConfigRules, fixupPluginRules } = require('@eslint/compat');

const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactNative = require('eslint-plugin-react-native');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['node_modules/', 'dist/', '.expo/', '.build/', '.git/'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    extends: fixupConfigRules(
      compat.extends(
        'airbnb',
        'airbnb-typescript',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-native/all',
        'plugin:prettier/recommended',
      ),
    ),

    plugins: {
      react: fixupPluginRules(react),
      'react-hooks': fixupPluginRules(reactHooks),
      'react-native': fixupPluginRules(reactNative),
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
    },

    rules: {
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],

      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],

      'max-len': [
        'warn',
        {
          code: 100,
          ignoreComments: true,
        },
      ],

      indent: 'off',
      '@typescript-eslint/indent': 'off',
      'react/react-in-jsx-scope': 'off',

      'react/jsx-filename-extension': [
        'warn',
        {
          extensions: ['.tsx'],
        },
      ],

      'react/prop-types': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-raw-text': 'off',
      'react-native/no-color-literals': 'off',
      'no-console': 'warn',
      'no-unused-vars': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],

      'import/prefer-default-export': 'off',
      'class-methods-use-this': 'off',
      'lines-between-class-members': 'off',
      '@typescript-eslint/lines-between-class-members': 'off',
      'no-throw-literal': 'off',
      '@typescript-eslint/no-throw-literal': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.js',
            '**/*.test.ts',
            '**/*.test.tsx',
            '**/*.spec.js',
            'webpack.config.js',
            'jest.config.js',
          ],
        },
      ],
    },

    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);
