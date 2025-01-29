import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactPlugin from 'eslint-plugin-react';
import stylistic from "@stylistic/eslint-plugin";
import tseslint from 'typescript-eslint';

const config = tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
        plugins: {
            'import/typescript': importPlugin,
            '@stylistic': stylistic,
            react: reactPlugin,
            'react-hooks': reactHooksPlugin
        },
        "settings": {
            "import/resolver": {
                "typescript": true,
                "node": true,
            },
        },
        rules: {
            "@stylistic/array-element-newline": ["error", "consistent"],
            "@stylistic/brace-style": ["error", "1tbs"],
            "@stylistic/comma-dangle": ["error", "never"],
            "@stylistic/eol-last": "error",
            "@stylistic/indent": ["error", 2],
            "@stylistic/jsx-quotes": ["error", "prefer-double"],
            "@stylistic/jsx-closing-bracket-location": "warn",
            "@stylistic/quotes": ["error", "single"],

            "@stylistic/space-infix-ops": ["error", {
                int32Hint: false,
            }],

            "@stylistic/space-unary-ops": "error",
            "@stylistic/template-curly-spacing": ["error", "never"],
            "block-scoped-var": "error",

            camelcase: ["error", {
                ignoreGlobals: true,
                properties: "never",
                allow: ["^o_", "node_*", "npm_*"],
            }],

            eqeqeq: "error",

            "id-length": ["error", {
                exceptions: ["t", "q", "e", "i", "j", "_"],
                properties: "never",
            }],

            "max-len": ["warn", {
                code: 140,
                ignoreTemplateLiterals: true,
                ignoreUrls: true,
            }],

            "no-unused-expressions": ["error", {
                allowShortCircuit: true,
                allowTernary: true,
            }],

            "prefer-const": "error",
            "prefer-template": "error",
            "semi": ["error", "always"],
            "import/newline-after-import": "error",
            "import/no-duplicates": "error",

            "import/order": ["warn", {
                groups: [
                    "builtin",
                    "external",
                    "internal",
                    "parent",
                    "sibling",
                    "index",
                    "object",
                    "type",
                ],

                pathGroups: [{
                    pattern: "@/**",
                    group: "internal",
                }],
            }],

            "react/prefer-stateless-function": "error",
            "react-hooks/exhaustive-deps": "warn",
        },
    },
);

export default config;