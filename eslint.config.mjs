import prettier from "eslint-plugin-prettier";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["**/dist/*", "**/node_modules/*", "**/coverage/*"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      "prettier/prettier": "error",
    },
  },
];
