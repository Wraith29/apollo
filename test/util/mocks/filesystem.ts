import { mock } from "bun:test";
import { IFileSystem } from "@/files/filesystem";

class MockFileSystem<TProperties> implements IFileSystem {
	constructor(
		private readonly _readFileData: string = "",
		private readonly _folderData: string[] = [],
		private readonly _propertyData: TProperties | null = null,
	) {}

	public ensureFileExists = mock(({}: string) => {});
	public readFile = mock(async ({}: string) => this._readFileData);
	public writeFile = mock(async ({}: string, {}: string) => {});
	public getAllFolders = mock(() => this._folderData);
	public processProperties = mock(async <T>({}: string, {}: T) => {});

	public async parseProperties<T>({}: string): Promise<T | null> {
		return this._propertyData as T;
	}
}

export default function buildFsMock<T>({
	readFile = "",
	folders = [],
	properties = null,
}: {
	readFile?: string;
	folders?: string[];
	properties?: T | null;
} = {}): IFileSystem {
	return new MockFileSystem(readFile, folders, properties);
}
