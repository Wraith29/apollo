import { describe, expect, test } from "bun:test";
import type { IHttpClient } from "@/clients/http";
import { MusicbrainzClient } from "@/clients/musicbrainz";
import { HttpClientMock } from "~/util/mocks";
import { buildArtistDetails } from "~/util/data";

describe("getArtistDetails", () => {
	test("when the client is called, lastCall is updated", async () => {
		const sut = buildSut();

		const firstCall = sut.getLastCall();
		await sut.getArtistDetails("any-mbid");

		const secondCall = sut.getLastCall();

		expect(firstCall).not.toBe(secondCall);
	});

	test("when 2 subsequent calls are made, there is a delay", async () => {
		const sut = buildSut();

		await sut.getArtistDetails("any-mbid");
		const firstCall = sut.getLastCall();

		await sut.getArtistDetails("any-mbid");
		const secondCall = sut.getLastCall();

		expect(secondCall - firstCall).toBeGreaterThanOrEqual(
			sut.getMinDelay(),
		);
	});

	test("when the httpClient call success, return the data provided", async () => {
		const details = buildArtistDetails();

		const client = new HttpClientMock();
		client.setHttpGet(details);

		const sut = buildSut({ httpClient: client });

		const result = await sut.getArtistDetails("any-mbid");

		expect(result).toEqual(details);
	});
});

function buildSut({
	httpClient = new HttpClientMock(),
}: {
	httpClient?: IHttpClient;
} = {}): MusicbrainzClient {
	return new MusicbrainzClient(httpClient);
}
