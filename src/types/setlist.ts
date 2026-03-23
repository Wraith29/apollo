export type SetlistResponse = {
	itemsPerPage: number;
	page: number;
	total: number;
	setlist: Setlist[];
};

type Setlist = {
	eventDate: string;
	sets: Sets;
};

type Sets = {
	set: SetlistSet[];
};

export type SetlistSet = {
	song: Song[];
};

type Song = {
	name: string;
	info: string | null;
};
