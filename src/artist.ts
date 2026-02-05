import injectArtistBasics from "./plugins/artist-basics";
import injectArtistDetails from "plugins/artist-details";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { ApolloSettings } from "settings";
import { App, Notice } from "obsidian";
import { ArtistDetails, getArtistDetails } from "musicbrainz";
import { ensureFileExists, ensureFolderExists } from "path-util";
import { unified } from "unified";

export async function saveArtist(
	app: App,
	settings: ApolloSettings,
	mbid: string,
): Promise<void> {
	await ensureFolderExists(app, settings.dataFolder);

	const artistDetails = await getArtistDetails(mbid);

	await saveArtistDetails(app, settings, artistDetails);
	await refreshArtistList(app, settings);
}

async function saveArtistDetails(
	app: App,
	settings: ApolloSettings,
	details: ArtistDetails,
): Promise<void> {
	const detailsFolder = [settings.dataFolder, "Artists"].join("/");
	await ensureFolderExists(app, detailsFolder);

	const detailsFilepath = [detailsFolder, `${details.name}.md`].join("/");
	await ensureFileExists(app, detailsFilepath);

	const detailsFile = app.vault.getFileByPath(detailsFilepath);
	if (detailsFile === null) {
		console.error({
			message: `Something went wrong opening detailsFilepath`,
			detailsFilepath: detailsFilepath,
		});
		new Notice(
			"Something went wrong.\nPlease check the console for more detailed information.",
		);
		return;
	}

	const content = await app.vault.read(detailsFile);
	const processed = await unified()
		.use(remarkParse)
		.use(remarkFrontmatter, ["yaml"])
		.use(injectArtistDetails, details)
		.use(remarkStringify)
		.process(content);

	await app.vault.modify(detailsFile, String(processed));
}

export async function refreshArtistList(
	app: App,
	settings: ApolloSettings,
): Promise<void> {
	await ensureFolderExists(app, settings.dataFolder);

	const artistsFilepath = settings.artistsIndexFile;
	await ensureFileExists(app, artistsFilepath);

	const artistsFile = app.vault.getFileByPath(artistsFilepath);
	if (artistsFile === null) {
		console.error({
			message: `Something went wrong opening artistsFilePath`,
			artistsFilePath: artistsFilepath,
		});
		new Notice(
			"Something went wrong.\nPlease check the console for more detailed information.",
		);
		return;
	}

	const content = await app.vault.read(artistsFile);
	const processed = await unified()
		.use(remarkParse)
		.use(injectArtistBasics, { app, settings })
		.use(remarkStringify)
		.process(content);

	await app.vault.modify(artistsFile, String(processed));
}
