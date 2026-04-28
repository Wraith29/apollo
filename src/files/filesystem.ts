import type { Vault } from "obsidian";

export class FileNotFoundError extends Error {
	constructor(path: string) {
		super(`Path ${path} was not found`);
	}
}

export interface IFileSystem {
	readFile(path: string): Promise<string>;
}

export class FileSystem implements IFileSystem {
	private _vault: Vault;

	constructor(vault: Vault) {
		this._vault = vault;
	}

	public async readFile(path: string): Promise<string> {
		const file = this._vault.getFileByPath(path);
		if (file === null) {
			throw new FileNotFoundError(path);
		}

		return this._vault.cachedRead(file);
	}
}
