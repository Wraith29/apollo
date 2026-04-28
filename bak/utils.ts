import { Notice, type TFile, type TFolder, type Vault } from "obsidian";

export function joinPath(...elems: string[]): string {
	return elems.join("/");
}

class FsError extends Error {}

export function getFileOrThrow(vault: Vault, path: string): TFile {
	const file = vault.getFileByPath(path);
	if (!file) {
		console.error({
			message: "Failed to read file at path",
			path: path,
		});

		new Notice(
			"Something went wrong opening file.\nCheck the console for more information.",
		);
		throw new FsError(`Failed to read file at ${path}`);
	}

	return file;
}

export async function getFileOrCreate(
	vault: Vault,
	path: string,
): Promise<TFile> {
	const file = vault.getFileByPath(path);
	if (file) {
		return file;
	}

	return await vault.create(path, "");
}

export async function getFolderOrCreate(
	vault: Vault,
	path: string,
): Promise<TFolder> {
	const folder = vault.getFolderByPath(path);
	if (folder) {
		return folder;
	}

	return await vault.createFolder(path);
}

export function parseMbid(input: string): string {
	if (!input.startsWith("https://musicbrainz.org")) {
		return input;
	}

	const lastSlash = input.lastIndexOf("/");
	return input.substring(lastSlash + 1);
}

export function randInt(max: number): number {
	return Math.floor(Math.random() * max);
}
