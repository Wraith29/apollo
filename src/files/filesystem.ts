import { Notice, Workspace, type FileManager, type Vault } from "obsidian";

export class FileNotFoundError extends Error {
	constructor(path: string) {
		super(`Path ${path} was not found`);
	}
}

export interface IFileSystem {
	ensureFileExists(path: string): void;
	readFile(path: string): Promise<string>;
	writeFile(path: string, content: string): Promise<void>;
	openFile(path: string): Promise<void>;

	getAllFolders(): string[];
	getFilesInFolder(path: string): string[];

	parseProperties<T>(path: string): Promise<T | null>;
	processProperties<T>(path: string, data: T): void;
}

export class FileSystem implements IFileSystem {
	constructor(
		private readonly _vault: Vault,
		private readonly _fileManager: FileManager,
		private readonly _workspace: Workspace,
	) {}

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

	public async openFile(path: string): Promise<void> {
		const file = this._vault.getFileByPath(path);
		if (!file) {
			return;
		}

		const leaf = this._workspace.getLeaf();
		await leaf.openFile(file);
	}

	public getAllFolders(): string[] {
		const vaultFolders = this._vault.getAllFolders(true);

		return vaultFolders.map((folder) => folder.path);
	}

	public getFilesInFolder(path: string): string[] {
		const folder = this._vault.getFolderByPath(path);
		if (!folder) {
			return [];
		}

		return folder.children.map((file) => file.path);
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
