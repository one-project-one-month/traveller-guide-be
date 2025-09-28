import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
    // Ignores
    {
        ignores: ['dist/**', 'node_modules/**', 'src/generated/**'],
    },

    {
        languageOptions: {
            globals: {
                ...globals.es2021,
                ...globals.node,
            },
            // rules: {
            //     '@typescript-eslint/no-explicit-any': 'off',
            // },
        },
    },

    // ESLint recommended rules
    pluginJs.configs.recommended,

    // Typescript recommended rules
    ...tseslint.configs.recommended,

    // Overrides
    {
        files: ['.eslintrc.js', 'eslint.config.*'],
        languageOptions: {
            sourceType: 'script',
            globals: {
                ...globals.node,
            },
        },
    },
];
