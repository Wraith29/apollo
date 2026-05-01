import { ArtistDetails } from "@/types/musicbrainz";
import { IHttpClient } from "./http";
import { sleep } from "@/utils/sleep";

export interface IMusicbrainzClient {
    getArtistDetails(mbid: string): Promise<ArtistDetails>
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

    public async getArtistDetails(mbid: string): Promise<ArtistDetails> {
        await this.ensureMinDelayIsMet();

        const includes = ["release-groups", "url-rels"].join("+");
        const url = `${this._baseUrl}/artist/${mbid}?inc=${includes}`;

        const request = {
            method: "GET",
            url: url,
            headers: {
                "User-Agent": "ObsidianMusicManager/1.0.0 (i.acnaylor@gmail.com)",
                Accept: "application/json"
            }
        };

        const result = await this._client.httpGet<ArtistDetails>(request);
        this._lastCall = new Date().getTime();

        return result;
    }

    private async ensureMinDelayIsMet(): Promise<void> {
        const now = new Date().getTime();
        const minTime = this._lastCall + this._minDelayMs;

        if (minTime > now) {
            const diff = minTime - now;
            await sleep(diff);
        }
    }
}
