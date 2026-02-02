import { getArtistDetails } from "musicbrainz";
import { App, Notice } from "obsidian";
import addArtistPlugin from "plugins/add-artist";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { ApolloSettings } from "settings";
import { unified } from "unified";

export async function saveArtist(
	app: App,
	settings: ApolloSettings,
	musicbrainzId: string,
): Promise<void> {
	const artistsPath = [settings.dataFolder, "Artists.md"].join("/");
	const artistsFile = app.vault.getFileByPath(artistsPath);
	if (artistsFile === null) {
		console.error({
			message: "ArtistsFile couldn't be found",
			artistsPath: artistsPath,
		});

		new Notice("Failed to save artist");
		return;
	}

	const artistDetails = await getArtistDetails(musicbrainzId);
	const data = await app.vault.read(artistsFile);

	const processed = await unified()
		.use(remarkParse)
		.use(addArtistPlugin, { details: artistDetails })
		.use(remarkStringify)
		.process(data);

	await app.vault.modify(artistsFile, String(processed), {});

	new Notice(
		`Saved ${artistDetails.name} to ${artistsPath}. ${artistDetails["release-groups"].length} Albums saved`,
	);
}
