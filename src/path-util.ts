import { App } from "obsidian";

export async function ensureFileExists(app: App, path: string): Promise<void> {
	console.debug(`Checking ${path} exists...`);

	const file = app.vault.getFileByPath(path);
	if (file !== null) {
		console.debug(`Path ${path} exists. Exiting.`);
		return;
	}

	console.debug(`Path ${path} not found. Creating.`);
	await app.vault.create(path, "");
}

export async function ensureFolderExists(
	app: App,
	path: string,
): Promise<void> {
	console.debug(`Checking ${path} exists...`);

	const folder = app.vault.getFolderByPath(path);
	if (folder !== null) {
		console.debug(`Path ${path} exists. Exiting.`);
		return;
	}

	console.debug(`Path ${path} not found. Creating.`);
	await app.vault.createFolder(path);
}
