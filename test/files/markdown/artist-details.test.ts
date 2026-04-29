import { IFileSystem } from "@/files/filesystem";
import ArtistDetailsFile from "@/files/markdown/artist-details";
import { beforeAll, describe, expect, setSystemTime, test } from "bun:test";
import { buildArtistDetails } from "~/util/data";
import { buildFsMock } from "~/util/mocks";

const systemTime = new Date("2026-01-01T12:00:00");

beforeAll(() => {
	setSystemTime(systemTime);
});

describe("process", () => {
	test("reads the file from the fileSystem interface", async () => {
		const fsMock = buildFsMock();
		const sut = buildSut(fsMock);

		await sut.process(buildArtistDetails());

		expect(fsMock.readFile).toHaveBeenCalledTimes(1);
	});

	test("defaults all properties when none found", async () => {
		const fsMock = buildFsMock();
		const sut = buildSut(fsMock);
		const details = buildArtistDetails();

		await sut.process(details);

		const props = sut.getProperties();

		expect(props).toEqual({
			"added-on": systemTime,
			"updated-on": systemTime,
			"musicbrainz-id": details.id,
			"musicbrainz-url": `https://musicbrainz.org/artist/${details.id}`,
			"spotify-url": null,
			"instagram-url": null,
		});
	});

	test("retains the added-on from the input and updates all other fields", async () => {
		const addedDate = "2025-01-01T12:00:00";
		const input =
			"---\n" +
			`added-on: ${addedDate}\n` +
			`updated-on: ${addedDate}\n` +
			"---";

		const fsMock = buildFsMock({ readFile: input });
		const sut = buildSut(fsMock);

		const id = "my-mbid";

		await sut.process(
			buildArtistDetails({
				id: id,
			}),
		);

		const props = sut.getProperties();

		expect(props).toEqual({
			"added-on": new Date(addedDate),
			"updated-on": systemTime,
			"musicbrainz-id": id,
			"musicbrainz-url": `https://musicbrainz.org/artist/${id}`,
			"spotify-url": null,
			"instagram-url": null,
		});
	});

	test("finds the spotify url from the relations", async () => {
		const fsMock = buildFsMock();
		const sut = buildSut(fsMock);

		const spotifyUrl = "https://open.spotify.com/my-band-link";

		const details = buildArtistDetails({
			relations: [
				{
					type: "free streaming",
					url: {
						id: "spotify-id",
						resource: spotifyUrl,
					},
				},
			],
		});

		await sut.process(details);

		const props = sut.getProperties();

		expect(props).toEqual({
			"added-on": systemTime,
			"updated-on": systemTime,
			"musicbrainz-id": details.id,
			"musicbrainz-url": `https://musicbrainz.org/artist/${details.id}`,
			"spotify-url": spotifyUrl,
			"instagram-url": null,
		});
	});

	test("non-spotify streaming relation is not included", async () => {
		const fsMock = buildFsMock();
		const sut = buildSut(fsMock);
		const details = buildArtistDetails({
			relations: [
				{
					type: "free streaming",
					url: {
						id: "some-other-site",
						resource: "https://not.spotify.com/",
					},
				},
			],
		});

		await sut.process(details);

		const props = sut.getProperties();

		expect(props).toEqual({
			"added-on": systemTime,
			"updated-on": systemTime,
			"musicbrainz-id": details.id,
			"musicbrainz-url": `https://musicbrainz.org/artist/${details.id}`,
			"spotify-url": null,
			"instagram-url": null,
		});
	});

	test("finds the instagram url from the relations", async () => {
		const fsMock = buildFsMock();
		const sut = buildSut(fsMock);

		const instagramUrl = "https://www.instagram.com/my-band-link";

		const details = buildArtistDetails({
			relations: [
				{
					type: "social network",
					url: {
						id: "spotify-id",
						resource: instagramUrl,
					},
				},
			],
		});

		await sut.process(details);

		const props = sut.getProperties();

		expect(props).toEqual({
			"added-on": systemTime,
			"updated-on": systemTime,
			"musicbrainz-id": details.id,
			"musicbrainz-url": `https://musicbrainz.org/artist/${details.id}`,
			"spotify-url": null,
			"instagram-url": instagramUrl,
		});
	});

	test("saves any existing notes from the current version", async () => {
		const input = "## Notes\n\nHello World!";
		const fsMock = buildFsMock({ readFile: input });
		const sut = buildSut(fsMock);

		const details = buildArtistDetails();

		await sut.process(details);

		const notes = sut.getNotes();

		expect(notes).toEqual(["Hello World!"]);
	});
});

function buildSut(
	fsMock: IFileSystem,
	fileName: string = "test.md",
): ArtistDetailsFile {
	return new ArtistDetailsFile(fileName, fsMock);
}
