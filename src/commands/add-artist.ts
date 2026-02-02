import { getArtistDetails } from "musicbrainz";
import { Modal, App, Setting, Notice } from "obsidian";
import artistPlugin from "plugins/addArtist";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { ApolloSettings } from "settings";
import { unified } from "unified";

export class AddArtistModal extends Modal {
	constructor(app: App, settings: ApolloSettings) {
		super(app);

		this.setTitle("Add artist");

		let musicbrainzId: string;

		new Setting(this.contentEl)
			.setName("Musicbrainz link")
			.setDesc(
				"Go to https://musicbrainz.org/ and search for the artist, then copy their unique id",
			)
			.addText((txt) =>
				txt
					.setPlaceholder("Musicbrainz link")
					.onChange((val) => (musicbrainzId = val)),
			);

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(async () => {
					this.close();
					await saveArtist(this.app, settings, musicbrainzId);
				}),
		);
	}
}

async function saveArtist(
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
		.use(artistPlugin, { details: artistDetails })
		.use(remarkStringify)
		.process(data);

	await app.vault.modify(artistsFile, String(processed), {});

	new Notice(
		`Saved ${artistDetails.name} to ${artistsPath}. ${artistDetails["release-groups"].length} Albums saved`,
	);
}
