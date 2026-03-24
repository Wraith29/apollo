import { min, parse } from "date-fns";
import {
	type App,
	type Command,
	Notice,
	type RequestUrlResponse,
	requestUrl,
} from "obsidian";
import injectSetlist from "plugins/setlist";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import type { ApolloSettings } from "settings";
import type { ArtistProperties, GigProperties } from "types/properties";
import type { SetlistResponse, SetlistSet } from "types/setlist";
import { unified } from "unified";
import { getFileOrCreate, getFolderOrCreate, joinPath } from "utils";

const SETLIST_BASE_URL = "https://api.setlist.fm/rest/1.0";
const DATE_FMT = "dd-MM-yyyy";

export default function UpdateSetlistsCommand(
	app: App,
	settings: ApolloSettings,
): Command {
	return {
		id: "update-setlists",
		name: "Update setlists",
		callback: async () => await updateAllGigs(app, settings),
	};
}

async function updateAllGigs(
	app: App,
	settings: ApolloSettings,
): Promise<void> {
	const gigsFolder = joinPath(settings.dataFolder, "Gigs");
	const gigsToUpdate = await getGigsWithoutSetlists(app, settings, gigsFolder);

	new Notice(`Found ${gigsToUpdate.length} gigs without setlists`);

	for (const gig of gigsToUpdate) {
		const error = await addSetlistToGig(app, settings, gig);
		if (error) {
			new Notice(error);
		}
	}
}

async function addSetlistToGig(
	app: App,
	settings: ApolloSettings,
	gig: Gig,
): Promise<string> {
	const mbid = await getMbidForGigMainAct(app, gig);
	if (!mbid) {
		return `No MusicBrainz ID found for ${gig.mainActName}`;
	}

	const setlist = await getSetlistForGig(app, settings, gig, mbid);
	if (!setlist) {
		return `Failed to find a valid setlist for ${gig.mainActName} on ${gig.gigDate}`;
	}

	// TODO: Create a unified plugin to add a setlist to the Gig File.
	// Once it's added - update the FrontMatter of the Gig to toggle `setlist-added`
	const gigFile = app.vault.getFileByPath(gig.path);
	if (!gigFile) {
		return `Failed to open file at ${gig.path}`;
	}

	const current = await app.vault.read(gigFile);
	const processed = await unified()
		.use(remarkParse)
		.use(remarkFrontmatter, ["yaml"])
		.use(injectSetlist, { setlists: setlist })
		.use(remarkStringify)
		.process(current);

	await app.vault.process(gigFile, () => String(processed));

	return "";
}

async function getSetlistForGig(
	app: App,
	settings: ApolloSettings,
	gig: Gig,
	mbid: string,
): Promise<SetlistSet[] | null> {
	const apiKey = app.secretStorage.getSecret(settings.setlistFmKeySecret);
	if (!apiKey) {
		return null;
	}

	const searchDate = new Date(gig.gigDate);
	let page = 1;

	while (true) {
		let earliestSetlist = new Date();
		const response = await querySetlistFm(apiKey, mbid, page);

		for (const setlist of response.setlist) {
			const eventDate = parse(setlist.eventDate, DATE_FMT, new Date());
			earliestSetlist = min([eventDate, earliestSetlist]);

			if (eventDate.getTime() !== searchDate.getTime()) {
				continue;
			}

			return setlist.sets.set;
		}

		if (earliestSetlist.getTime() < searchDate.getTime()) {
			return null;
		}

		page += 1;
	}
}

async function querySetlistFm(
	apiKey: string,
	mbid: string,
	page: number = 1,
): Promise<SetlistResponse> {
	const url = `${SETLIST_BASE_URL}/artist/${mbid}/setlists?p=${page}`;
	const request = {
		url: url,
		headers: {
			Accept: "application/json",
			"Accept-Language": "en",
			"x-api-key": apiKey,
		},
	};

	let response: RequestUrlResponse;
	try {
		response = await requestUrl(request);
	} catch (error) {
		console.error({ message: "Failed to request url", url: url, error: error });
		new Notice(
			"Failed to get setlist data.\nSee console for more information.",
		);
		throw error;
	}

	const result = response.json as SetlistResponse;
	if (!result) {
		throw new Error("Failed to cast response to SetlistResponse object");
	}

	return result;
}

type Gig = {
	path: string;
	gigDate: string;
	mainActPath: string;
	mainActName: string;
};

async function getGigsWithoutSetlists(
	app: App,
	settings: ApolloSettings,
	gigsFolder: string,
): Promise<Gig[]> {
	const gigsWithoutSetlists: Gig[] = [];
	const folder = await getFolderOrCreate(app.vault, gigsFolder);

	for (const fileData of folder.children) {
		const file = await getFileOrCreate(app.vault, fileData.path);
		await app.fileManager.processFrontMatter(file, (fm: GigProperties) => {
			if (fm["setlist-added"]) {
				return;
			}

			const actName = fm["main-act"].substring(2, fm["main-act"].length - 2);
			const actFileName = joinPath(
				settings.dataFolder,
				"Artists",
				`${actName}.md`,
			);

			gigsWithoutSetlists.push({
				path: fileData.path,
				gigDate: fileData.name.substring(0, fileData.name.length - 3),
				mainActPath: actFileName,
				mainActName: actName,
			});
		});
	}

	return gigsWithoutSetlists;
}

async function getMbidForGigMainAct(
	app: App,
	gig: Gig,
): Promise<string | null> {
	let mbid: string | null = null;

	const file = app.vault.getFileByPath(gig.mainActPath);
	if (!file) {
		return null;
	}

	await app.fileManager.processFrontMatter(file, (fm: ArtistProperties) => {
		mbid = fm["musicbrainz-id"];
	});

	return mbid;
}
