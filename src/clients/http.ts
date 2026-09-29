import {
	Notice,
	type RequestUrlParam,
	type RequestUrlResponse,
	requestUrl,
} from "obsidian";
import { sleep } from "@/utils/sleep";

export interface IHttpClient {
	httpGet<T>(request: RequestUrlParam): Promise<T>;

	setMinimumDelay(ms: number): void;
}

export class HttpClient implements IHttpClient {
	private _minimumDelay: number = 500;
	private _lastCall: number = 0;

	public setMinimumDelay(ms: number): void {
		this._minimumDelay = ms;
	}

	public async httpGet<T>(request: RequestUrlParam): Promise<T> {
		await this.ensureMinimumDelayIsMet();

		let response: RequestUrlResponse;
		try {
			response = await requestUrl({ method: "GET", ...request });
			this._lastCall = Date.now();
		} catch (error) {
			console.error({
				message: "Failed to request url",
				url: request.url,
				error: error,
			});
			new Notice(
				"Failed to get artist details.\nSee console for more information.",
			);

			throw error;
		}


		const result = response.json as T;
		if (!result) {
			throw new Error(`Failed to cast response to ${typeof result}`);
		}

		return result;
	}

	private async ensureMinimumDelayIsMet(): Promise<void> {
		const now = Date.now();
		const minTime = this._lastCall + this._minimumDelay;

		if (minTime > now) {
			const diff = minTime - now;
			await sleep(diff);
		}
	}
}
