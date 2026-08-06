import { normalizePath } from "obsidian";

export function joinAndNormalizePath(...entries: string[]): string {
	return normalizePath(entries.join("/"));
}
