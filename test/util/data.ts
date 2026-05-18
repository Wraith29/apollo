import type {
	ArtistDetails,
	Relation,
	ReleaseGroup,
} from "@/types/musicbrainz";

export function buildArtistDetails({
	id = "1234-5678",
	name = "Test Artist",
	releaseGroups = [],
	relations = [],
}: {
	id?: string;
	name?: string;
	releaseGroups?: ReleaseGroup[];
	relations?: Relation[];
} = {}): ArtistDetails {
	return {
		id: id,
		name: name,
		"release-groups": releaseGroups,
		relations: relations,
	};
}
