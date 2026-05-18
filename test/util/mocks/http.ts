import { IHttpClient } from "@/clients/http";
import { RequestUrlParam } from "obsidian";

class MockHttpClient<TGet> implements IHttpClient {
	constructor(private readonly _httpGetData: TGet) {}

	public async httpGet<T = TGet>({}: RequestUrlParam): Promise<T> {
		return this._httpGetData as unknown as T;
	}
}

export function buildHttpMock<TGet>({
	get = null,
}: {
	get?: TGet | null;
} = {}): IHttpClient {
	return new MockHttpClient(get);
}
