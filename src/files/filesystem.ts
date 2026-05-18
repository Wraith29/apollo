import { Notice, type FileManager, type Vault } from "obsidian";

export class FileNotFoundError extends Error {
	constructor(path: string) {
		super(`Path ${path} was not found`);
	}
}

export interface IFileSystem {
	ensureFileExists(path: string): void;
	readFile(path: string): Promise<string>;
	writeFile(path: string, content: string): Promise<void>;

	getAllFolders(): string[];

	parseProperties<T>(path: string): Promise<T | null>;
	processProperties<T>(path: string, data: T): void;
}

export class FileSystem implements IFileSystem {
	private _vault: Vault;
	private _fileManager: FileManager;

	constructor(vault: Vault, fileManager: FileManager) {
		this._vault = vault;
		this._fileManager = fileManager;
	}

	public ensureFileExists(path: string): void {
		const file = this._vault.getFileByPath(path);
		if (file) {
			return;
		}

		this._vault.create(path, "");
	}

	public async readFile(path: string): Promise<string> {
		const file = this._vault.getFileByPath(path);
		if (file === null) {
			return "";
		}

		return this._vault.cachedRead(file);
	}

	public async writeFile(path: string, content: string): Promise<void> {
		this.ensureFileExists(path);

		const file = this._vault.getFileByPath(path);
		if (!file) {
			throw new FileNotFoundError(path);
		}

		this._vault.modify(file, content);
	}

	public getAllFolders(): string[] {
		const vaultFolders = this._vault.getAllFolders(true);

		return vaultFolders.map((folder) => folder.path);
	}

	public async parseProperties<T>(path: string): Promise<T | null> {
		const file = this._vault.getFileByPath(path);
		if (!file) {
			return null;
		}

		let properties: T | null = null;
		await this._fileManager.processFrontMatter(file, (fm) => {
			properties = fm as T;
		});

		return properties;
	}

	public processProperties<T>(path: string, data: T): void {
		const file = this._vault.getFileByPath(path);
		if (!file) {
			throw new FileNotFoundError(path);
		}

		try {
			this._fileManager.processFrontMatter(file, (fm) => {
				for (const key in fm) {
					delete fm[key];
				}

				for (const key in data) {
					fm[key] = data[key];
				}
			});
		} catch (err) {
			new Notice(`Failed to process front matter for ${path}`);
			throw err;
		}
	}
}
