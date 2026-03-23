export type ArtistProperties = {
	"added-on": Date;
	"updated-at": Date | null;
	"musicbrainz-id": string | null;
	"spotify-url": string | null;
};

export type GigProperties = {
	"main-act": string;
	"support-acts": string[];
	venue: string;
	"setlist-added": boolean;
};
