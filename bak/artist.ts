import type { ArtistDetails } from "./musicbrainz";
import type { App, TFile } from "obsidian";
import injectArtistDetails from "./plugins/artist-details";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import type { ApolloSettings } from "./settings";
import { unified } from "unified";
import { getFileOrCreate, getFolderOrCreate, joinPath } from "./utils";

export async function saveDetails(
	app: App,
	settings: ApolloSettings,
	details: ArtistDetails,
): Promise<TFile> {
	await getFolderOrCreate(app.vault, settings.dataFolder);
	await getFolderOrCreate(
		app.vault,
		joinPath(settings.dataFolder, "Artists"),
	);

	const detailsPath = joinPath(
		settings.dataFolder,
		"Artists",
		`${details.name}.md`,
	);

	const detailsFile = await getFileOrCreate(app.vault, detailsPath);
	const current = await app.vault.read(detailsFile);

	const processed = await unified()
		.use(remarkParse)
		.use(remarkFrontmatter, ["yaml"])
		.use(injectArtistDetails, details)
		.use(remarkStringify)
		.process(current);

	await app.vault.process(detailsFile, () => String(processed));

	return detailsFile;
}
