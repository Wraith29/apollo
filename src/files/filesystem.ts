import { Notice, type Workspace, type FileManager, type Vault } from "obsidian";

export class FileNotFoundError extends Error {
	constructor(path: string) {
		super(`Path ${path} was not found`);
	}
}

export interface IFileSystem {
	ensureFileExists(path: string): Promise<void>;
	ensureFolderExists(path: string): Promise<void>;

	readFile(path: string): Promise<string>;
	writeFile(path: string, content: string): Promise<void>;
	openFile(path: string): Promise<void>;

	getAllFolders(): string[];
	getFilesInFolder(path: string): string[];

	getFileLinkText(to: string, from: string): string | null;

	parseProperties<T>(path: string): Promise<T | null>;
	processProperties(path: string, data: unknown): Promise<void>;
}

export class FileSystem implements IFileSystem {
	constructor(
		private readonly _vault: Vault,
		private readonly _fileManager: FileManager,
		private readonly _workspace: Workspace,
	) {}

	public async ensureFileExists(path: string): Promise<void> {
		const file = this._vault.getFileByPath(path);
		if (file) {
			return;
		}

		await this._vault.create(path, "");
	}

	public async ensureFolderExists(path: string): Promise<void> {
		const folder = this._vault.getFolderByPath(path);
		if (folder) {
			return;
		}

		try {
			await this._vault.createFolder(path);
		} catch {
			// This shouldn't happen, but is technically possible
		}
	}

	public async readFile(path: string): Promise<string> {
		const file = this._vault.getFileByPath(path);
		if (file === null) {
			return "";
		}

		return this._vault.cachedRead(file);
	}

	public async writeFile(path: string, content: string): Promise<void> {
		await this.ensureFileExists(path);

		const file = this._vault.getFileByPath(path);
		if (!file) {
			throw new FileNotFoundError(path);
		}

		await this._vault.modify(file, content);
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

	public getFileLinkText(to: string, from: string): string | null {
		const file = this._vault.getFileByPath(to);
		if (!file) {
			return null;
		}

		const link = this._fileManager.generateMarkdownLink(file, from);

		return link;
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

	public async processProperties(
		path: string,
		data: Record<string, Date | string | null>,
	): Promise<void> {
		const file = this._vault.getFileByPath(path);
		if (!file) {
			throw new FileNotFoundError(path);
		}

		try {
			await this._fileManager.processFrontMatter(
				file,
				(fm: Record<string, Date | string | null>) => {
					for (const [key, value] of Object.entries(data)) {
						fm[key] = value;
					}
				},
			);
		} catch (err) {
			new Notice(`Failed to process front matter for ${path}`);
			throw err;
		}
	}
}
