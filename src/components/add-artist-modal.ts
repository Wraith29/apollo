import { ArtistDetails, getArtistDetails } from "musicbrainz";
import { App, Modal, Setting, TFile } from "obsidian";
import injectArtistDetails from "plugins/artist-details";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { ApolloSettings } from "settings";
import { unified } from "unified";
import { createFilepath, getFileOrCreate, parseMbid } from "utils";

export default class AddArtistModal extends Modal {
	app: App;
	settings: ApolloSettings;
	musicbrainzInput: string;

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
				txt.onChange((val) => (this.musicbrainzInput = val)),
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

		const file = await this.saveDetails(artistDetails);
		const leaf = this.app.workspace.getLeaf();
		await leaf.openFile(file);
	}

	private async saveDetails(details: ArtistDetails): Promise<TFile> {
		const detailsPath = createFilepath(
			this.settings.dataFolder,
			"Artists",
			`${details.name}.md`,
		);

		const detailsFile = await getFileOrCreate(this.app.vault, detailsPath);
		const current = await this.app.vault.read(detailsFile);

		const processed = await unified()
			.use(remarkParse)
			.use(remarkFrontmatter, ["yaml"])
			.use(injectArtistDetails, details)
			.use(remarkStringify)
			.process(current);

		await this.app.vault.modify(detailsFile, String(processed));

		return detailsFile;
	}
}
