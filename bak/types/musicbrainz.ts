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
