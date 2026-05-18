import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
	// No point linting the backup of the old code or the compiled file
	globalIgnores(["bak/*", "main.js"]),
	{
		files: ["src/*.{js,mjs,cjs,ts,mts,cts}"],
		ignores: ["bak/"],
		plugins: { js, obsidianmd },
		extends: ["js/recommended", "obsidianmd/recommended"],
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
	},
	tseslint.configs.recommended,
]);
