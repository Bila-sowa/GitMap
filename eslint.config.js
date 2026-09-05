import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.browser },
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
]);
