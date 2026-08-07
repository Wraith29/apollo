import type { ArtistDetails } from "@/types/musicbrainz";
import { sleep } from "@/utils/sleep";
import type { IHttpClient } from "./http";

export interface IMusicbrainzClient {
	getArtistDetails(mbid: string): Promise<ArtistDetails>;
}

export class MusicbrainzClient implements IMusicbrainzClient {
	private readonly _baseUrl: string = "https://musicbrainz.org/ws/2";
	private readonly _minDelayMs: number = 500;
	private readonly _client: IHttpClient;

	private _lastCall: number = 0;

	constructor(client: IHttpClient) {
		this._client = client;
	}

	public getMinDelay(): number {
		return this._minDelayMs;
	}

	public getLastCall(): number {
		return this._lastCall;
	}

	public getBaseUrl(): string {
		return this._baseUrl;
	}

	public async getArtistDetails(mbid: string): Promise<ArtistDetails> {
		await this.ensureMinDelayIsMet();

		const includes = ["release-groups", "url-rels"].join("+");
		const url = `${this._baseUrl}/artist/${mbid}?inc=${includes}`;

		const request = {
			method: "GET",
			url: url,
			headers: {
				"User-Agent": "ObsidianMusicManager/1.0.0 (i.acnaylor@gmail.com)",
				Accept: "application/json",
			},
		};

		const result = await this._client.httpGet<ArtistDetails>(request);
		this._lastCall = Date.now();

		return result;
	}

	private async ensureMinDelayIsMet(): Promise<void> {
		const now = Date.now();
		const minTime = this._lastCall + this._minDelayMs;

		if (minTime > now) {
			const diff = minTime - now;
			await sleep(diff);
		}
	}
}
