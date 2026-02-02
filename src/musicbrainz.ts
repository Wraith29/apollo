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
	const response = await fetch(
		`https://musicbrainz.org/ws/2/artist/${mbid}?fmt=json&inc=release-groups`,
		{
			headers: {
				"User-Agent":
					"ObsidianMusicManager/0.0.1 (i.acnaylor@gmail.com)",
			},
		},
	);

	return response.json();
}
