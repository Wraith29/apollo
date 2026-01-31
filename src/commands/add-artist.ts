import { Modal, App, Setting, Notice } from "obsidian";
import path from "path";
import artistPlugin from "plugins/addArtist";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { ApolloSettings } from "settings";
import { unified } from "unified";

export class AddArtistModal extends Modal {
	constructor(app: App, settings: ApolloSettings) {
		super(app);

		this.setTitle("Add Artist");

		let artistName: string;
		let musicbrainzId: string;

		new Setting(this.contentEl)
			.setName("Artist Name")
			.addText((txt) =>
				txt
					.setPlaceholder("Artist Name")
					.onChange((val) => (artistName = val)),
			);

		new Setting(this.contentEl)
			.setName("MusicBrainz Link")
			.setDesc(
				"Go to https://musicbrainz.org/ and search for the artist, then copy their unique ID",
			)
			.addText((txt) =>
				txt
					.setPlaceholder("MusicBrainz Link")
					.onChange((val) => (musicbrainzId = val)),
			);

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(async () => {
					this.close();
					await saveArtist(
						this.app,
						settings,
						artistName,
						musicbrainzId,
					);
				}),
		);
	}
}

async function saveArtist(
	app: App,
	settings: ApolloSettings,
	artistName: string,
	musicbrainzId: string,
): Promise<void> {
	console.log({
		message: "Saving Artist",
		artistName: artistName,
		musicbrainzId: musicbrainzId,
	});

	const artistsPath = path.join(settings.dataFolder, "Artists.md");
	const artistsFile = app.vault.getFileByPath(artistsPath);
	if (artistsFile === null) {
		console.error({
			message: "ArtistsFile couldn't be found",
			artistsPath: artistsPath,
		});

		new Notice("Failed to save artist");
		return;
	}

	const data = await app.vault.read(artistsFile);

	const processed = await unified()
		.use(remarkParse)
		.use(artistPlugin, { name: artistName, musicbrainzId: musicbrainzId })
		.use(remarkStringify)
		.process(data);

	await app.vault.modify(artistsFile, String(processed), {});

	console.log({ message: "Data has been processed", processed: processed });
}
