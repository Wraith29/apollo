import { type App, Modal, Setting } from "obsidian";
import { ApolloSettings } from "../settings";
import { IFileSystem } from "../filesystem";
import { IMusicbrainzClient } from "../clients/musicbrainz";
import { saveDetails } from "../artist";
import refreshArtists from "../commands/refresh-artists";

export default class AddArtistModal extends Modal {
	app: App;
	settings: ApolloSettings;
	fileSystem: IFileSystem;
	musicbrainzClient: IMusicbrainzClient;
	input: string;

	constructor(app: App, settings: ApolloSettings, fileSystem: IFileSystem) {
		super(app);

		this.app = app;
		this.settings = settings;
		this.fileSystem = fileSystem;
		this.input = "";

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
				txt.onChange((val: string) => {
					this.input = val;
				}),
			);
	}

	private async onSubmit(): Promise<void> {
		this.close();

		const mbid = extractMbid(this.input);
		const artistDetails = await this.musicbrainzClient.getArtistDetails(mbid);

		const file = await saveDetails(this.app, this.settings, artistDetails);
		await refreshArtists(this.app, this.settings);

		const leaf = this.app.workspace.getLeaf();
		await leaf.openFile(file);
	}

}

function extractMbid(url: string): string {
	const lastSlash = url.lastIndexOf("/");
	return url.substring(lastSlash + 1);
}
