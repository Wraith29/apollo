import { type App, Modal, Setting } from "obsidian";
import { ApolloSettings } from "../settings";
import { parseMbid } from "../utils";
import { getArtistDetails } from "../musicbrainz";
import { saveDetails } from "../artist";
import refreshArtists from "../commands/refresh-artists";

export default class AddArtistModal extends Modal {
	app: App;
	settings: ApolloSettings;
	musicbrainzInput: string = "";

	constructor(app: App, settings: ApolloSettings) {
		super(app);

		this.app = app;
		this.settings = settings;

		this.setTitle("Add artist");

		const desc = new DocumentFragment();
		const link = desc.createEl("a");
		link.innerText =
			"Musicbrainz website.\nEnter the link to the musicbrainz page,\n or the artist's specific mbid.";
		link.href = "https://musicbrainz.org/";

		new Setting(this.contentEl)
			.setName("Musicbrainz identifier")
			.setDesc(desc)
			.addText((txt) =>
				txt.onChange((val) => {
					this.musicbrainzInput = val;
				}),
			);

		new Setting(this.contentEl).addButton((btn): void => {
			btn.setButtonText("Submit")
				.setCta()
				.onClick(async () => await this.onSubmit());
		});
	}

	private async onSubmit(): Promise<void> {
		this.close();

		const mbid = parseMbid(this.musicbrainzInput);
		const artistDetails = await getArtistDetails(mbid);

		const file = await saveDetails(this.app, this.settings, artistDetails);
		await refreshArtists(this.app, this.settings);

		const leaf = this.app.workspace.getLeaf();
		await leaf.openFile(file);
	}
}
