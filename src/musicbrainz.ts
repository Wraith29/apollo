import { requestUrl } from "obsidian";

export type ReleaseGroup = {
	title: string;
	id: string;
	"first-release-date": string;
	"primary-type": string;
	"secondary-types": string[];
};

export type ArtistDetails = {
	id: string;
	name: string;
	"release-groups": ReleaseGroup[];
};

export async function getArtistDetails(mbid: string): Promise<ArtistDetails> {
	const request = {
		url: `https://musicbrainz.org/ws/2/artist/${mbid}?inc=release-groups&fmt=json`,
		headers: {
			"User-Agent":
				"ObsidianMusicManager/1.0.0 (https://github.com/Wraith29/apollo/issues)",
		},
	};

	const response = await requestUrl(request);

	const result = response.json as ArtistDetails;
	if (!result) {
		throw new Error(
			"Failed to cast response to MusicBrainzResponse object",
		);
	}

	return result;
}
