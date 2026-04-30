import { describe, test, expect } from "bun:test";
import { MusicbrainzClient } from "@/clients/musicbrainz";
import { HttpClientMock } from "~/util/mocks";
import { IHttpClient } from "@/clients/http";

describe("getArtistDetails", () => {
    test("when the client is called, lastCall is updated", async () => {
        const sut = buildSut();

        const firstCall = sut.getLastCall();
        await sut.getArtistDetails("any-mbid");

        const secondCall = sut.getLastCall();
        
        expect(firstCall).not.toBe(secondCall);
    });

    test("when 2 subsequent calls are made, there is a delay", async() => {
        const sut = buildSut();

        await sut.getArtistDetails("any-mbid");
        const firstCall = sut.getLastCall();

        await sut.getArtistDetails("any-mbid");
        const secondCall = sut.getLastCall()

        console.log(firstCall, secondCall);
    });
});

function buildSut({
    httpClient = new HttpClientMock()
}: { 
    httpClient?: IHttpClient 
} = {}): MusicbrainzClient {
    return new MusicbrainzClient(httpClient);
}
