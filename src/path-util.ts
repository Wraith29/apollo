import { App } from "obsidian";

export async function ensureFileExists(app: App, path: string): Promise<void> {
	const file = app.vault.getFileByPath(path);
	if (file) {
		return;
	}

	await app.vault.create(path, "");
}

export async function ensureFolderExists(
	app: App,
	path: string,
): Promise<void> {
	const folder = app.vault.getFolderByPath(path);
	if (folder) {
		return;
	}

	await app.vault.createFolder(path);
}
