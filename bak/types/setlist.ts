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
	encore: number | null;
};

type Song = {
	name: string;
	info: string | null;
};
