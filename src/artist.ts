import { ArtistDetails } from "musicbrainz";
import { App, TFile } from "obsidian";
import injectArtistDetails from "plugins/artist-details";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { ApolloSettings } from "settings";
import { unified } from "unified";
import { createFilepath, getFileOrCreate } from "utils";

export async function saveDetails(
	app: App,
	settings: ApolloSettings,
	details: ArtistDetails,
): Promise<TFile> {
	const detailsPath = createFilepath(
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
