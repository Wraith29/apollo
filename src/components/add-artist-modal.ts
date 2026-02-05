import { saveArtist } from "artist";
import { App, Modal, Setting } from "obsidian";
import { ApolloSettings } from "settings";

export default class AddArtistModal extends Modal {
	constructor(app: App, settings: ApolloSettings) {
		super(app);

		this.setTitle("Add artist");

		let musicbrainzId: string;

		const desc = new DocumentFragment();
		const link = desc.createEl("a");
		link.innerText = "Musicbrainz website";
		link.href = "https://musicbrainz.org/";

		new Setting(this.contentEl)
			.setName("Musicbrainz identifier")
			.setDesc(desc)
			.addText((txt) => txt.onChange((val) => (musicbrainzId = val)));

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(async () => {
					this.close();
					await saveArtist(app, settings, musicbrainzId);
				}),
		);
	}
}
