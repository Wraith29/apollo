import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
	globalIgnores(["bak/", "main.js", "version-bump.mjs"]),
	{
		files: ["src/**/*.ts"],
		plugins: { js, obsidianmd, tseslint },
		extends: [
			"js/recommended",
			"obsidianmd/recommended",
			"tseslint/strictTypeChecked",
		],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
			},
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
]);
