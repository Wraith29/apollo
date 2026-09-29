import type { ArtistDetails, ReleaseGroup, ReleaseGroupBrowseRequest } from "@/types/musicbrainz";
import { sleep } from "@/utils/sleep";
import type { IHttpClient } from "./http";
import type { RequestUrlParam } from "obsidian";

const USER_AGENT = "ObsidianMusicManager/1.0.0 (i.acnaylor@gmail.com)";

export interface IMusicbrainzClient {
	getArtistDetails(mbid: string): Promise<ArtistDetails>;
}

export class MusicbrainzClient implements IMusicbrainzClient {
	private readonly _baseUrl: string = "https://musicbrainz.org/ws/2";
	private readonly _minDelayMs: number = 1000;
	// Maximum according to MusicBrainz
	private readonly _pageSize: number = 100;
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
		const details = await this.getArtistRelations(mbid);
		const releaseGroups = await this.getAllReleaseGroups(mbid);

		return {
			...details,
			"release-groups": releaseGroups,
		};
	}

	private async getArtistRelations(mbid: string): Promise<ArtistDetails> {
		await this.ensureMinDelayIsMet();

		const includes = ["url-rels"].join("+");
		const url = `${this._baseUrl}/artist/${mbid}?inc=${includes}`;

		const request = this.buildRequest(url);

		const result = await this._client.httpGet<ArtistDetails>(request);
		this._lastCall = Date.now();

		return result;
	}

	private async getAllReleaseGroups(mbid: string): Promise<ReleaseGroup[]> {
		const releaseGroups: ReleaseGroup[] = [];

		let total: number = 0;
		let offset: number = 0;
		let result: ReleaseGroupBrowseRequest;

		do {
			await this.ensureMinDelayIsMet();

			const url = `${this._baseUrl}/release-group?artist=${mbid}&offset=${offset}&limit=${this._pageSize}`
			const request = this.buildRequest(url);

			result = await this._client.httpGet<ReleaseGroupBrowseRequest>(request);
			this._lastCall = Date.now();

			releaseGroups.push(...result["release-groups"]);
			offset = releaseGroups.length;
			total =result["release-group-count"];
		} while (releaseGroups.length < total);

		return releaseGroups;
	}

	private async ensureMinDelayIsMet(): Promise<void> {
		const now = Date.now();
		const minTime = this._lastCall + this._minDelayMs;

		if (minTime > now) {
			const diff = minTime - now;
			await sleep(diff);
		}
	}

	private buildRequest(url: string): RequestUrlParam{
		return {
			url: url,
			headers: {
				"User-Agent": USER_AGENT,
				"Accept": "application/json"
			}
		};
	}
}
