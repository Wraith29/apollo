import { Notice, requestUrl, RequestUrlResponse } from "obsidian";
import { ArtistDetails } from "../types/musicbrainz";
import HttpClient, { IHttpClient } from "./http-client";

const baseUrl = "https://musicbrainz.org/ws/2";
const minDelay = 1000;

export interface IMusicbrainzClient {
    getArtistDetails(mbid: string): Promise<ArtistDetails>;
}

export default class MusicbrainzClient implements IMusicbrainzClient {
    private _lastCall: number;
    private _httpClient: IHttpClient;

    constructor(httpClient: HttpClient) {
        this._lastCall = 0;
        this._httpClient = httpClient;
    }

    public async getArtistDetails(mbid: string): Promise<ArtistDetails> {
        const now = new Date().getTime();
        if (this._lastCall + minDelay > now) {
            const sleepDuration = now - (this._lastCall + minDelay);
            sleep(sleepDuration);
        }

        const includes = ["release-groups", "url-rels"].join("+");
        const url = `https://musicbrainz.org/ws/2/artist/${mbid}?inc=${includes}&fmt=json`;

        const request = {
            url: url,
            headers: {
                "User-Agent":
                    "ObsidianMusicManager/1.0.0 (https://github.com/Wraith29/apollo/issues)",
                Accept: "application/json",
            },
        };

        this._lastCall = now;

        return await this._httpClient.httpGet(request);
    }
}
