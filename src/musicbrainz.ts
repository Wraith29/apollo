import { requestUrl } from "obsidian";

export type ReleaseGroup = {
	title: string;
	id: string;
	"first-release-date": string;
	"primary-type": string;
	"secondary-types": string[];
};

export type ArtistQuery = {
	id: string;
	name: string;
	"release-groups": ReleaseGroup[];
};

export async function getArtistDetails(mbid: string): Promise<ArtistQuery> {
	const request = {
		url: `https://musicbrainz.org/ws/2/artist/${mbid}?inc=release-groups&fmt=json`,
		headers: {
			"User-Agent": "ObsidianMusicManager/0.0.1 (i.acnaylor@gmail.com)",
		},
	};

	const response = await requestUrl(request);

	const result = response.json as ArtistQuery;
	if (!result) {
		throw new Error("Failed to cast response to ArtistQuery object");
	}

	return result;
}
