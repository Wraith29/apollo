import { saveArtist } from "data/artist";
import { Modal, App, Setting } from "obsidian";
import { ApolloSettings } from "settings";

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
