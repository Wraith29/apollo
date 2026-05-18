import { mock } from "bun:test";
import type { IFileSystem } from "@/files/filesystem";
import { IHttpClient } from "@/clients/http";
import type { RequestUrlParam } from "obsidian";

export function buildFsMock({
	readFile = "",
	getAllFolders = [],
}: {
	readFile?: string;
	getAllFolders?: string[];
} = {}): IFileSystem {
	const mockReadFile = mock(async ({}: string): Promise<string> => readFile);

	return {
		readFile: mockReadFile,
		getAllFolders: mock((): string[] => getAllFolders),
	};
}

export class HttpClientMock<TGet> implements IHttpClient {
	private _httpGetResult: TGet;

	public async httpGet<T = TGet>({}: RequestUrlParam): Promise<T> {
		return this._httpGetResult as unknown as T;
	}

	public setHttpGet<T extends TGet>(result: T): void {
		this._httpGetResult = result;
	}
}
