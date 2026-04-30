import { IHttpClient } from "@/clients/http";
import { IFileSystem } from "@/files/filesystem";
import { mock } from "bun:test";
import { RequestUrlParam } from "obsidian";

export function buildFsMock({
	readFile = "",
}: {
	readFile?: string;
} = {}): IFileSystem {
	return {
		readFile: mock(async (_: string) => readFile),
	};
}

export class HttpClientMock implements IHttpClient {
	private _httpGetResponse: any;

	public setGetResponse<T>(obj: T): void {
		this._httpGetResponse = obj;
	}

	public async httpGet<T>(request: RequestUrlParam): Promise<T> {
		return this._httpGetResponse;
	}
}
