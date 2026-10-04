import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        ignores: ["dist/**"],
    },
    {
        files: ["**/*.{js,mjs,cjs}", ".stylelintrc.mjs"],
        plugins: { js },
        extends: ["js/recommended"],
        rules: {
            "no-console": "off",
            "no-unused-vars": "error",
            eqeqeq: "error",
            "no-debugger": "error",
            "no-dupe-else-if": "error",
            "no-duplicate-case": "error",
            "no-duplicate-imports": "error",
            "no-unsafe-optional-chaining": "off",
        },
    },
    {
        files: ["src/**/*.{js,mjs,cjs}", "tests/**/*.{js,mjs,cjs}"],
        ignores: ["tests/tools/generateTestName.js"],
        languageOptions: { globals: globals.browser },
    },
    {
        files: ["eslint.config.js", "vite.config.js", ".stylelintrc.mjs", "tests/tools/generateTestName.js"],
        languageOptions: { globals: globals.node },
    },
]);
