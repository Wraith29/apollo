import { Notice, type RequestUrlResponse, requestUrl } from "obsidian";

export type ReleaseGroup = {
	title: string;
	id: string;
	"first-release-date": string;
	"primary-type": string;
	"secondary-types": string[];
};

export type Relation = {
	type: string;
	url: {
		resource: string;
		id: string;
	};
};

export type ArtistDetails = {
	id: string;
	name: string;
	"release-groups": ReleaseGroup[];
	relations: Relation[];
};

export async function getArtistDetails(mbid: string): Promise<ArtistDetails> {
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

	let response: RequestUrlResponse;
	try {
		response = await requestUrl(request);
	} catch (error) {
		console.error({ message: "Failed to request url", url: url, error: error });
		new Notice(
			"Failed to get artist details.\nSee console for more information.",
		);
		throw error;
	}

	const result = response.json as ArtistDetails;
	if (!result) {
		throw new Error("Failed to cast response to MusicBrainzResponse object");
	}

	return result;
}
