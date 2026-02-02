import { Album } from "data/albums";
import { Modal, App } from "obsidian";

export class RecommendedAlbumModal extends Modal {
	constructor(app: App, recommended: Album) {
		super(app);

		this.setTitle("Recommended album");

		const container = this.contentEl.createDiv();
		container.setCssProps({
			display: "flex",
		});

		const img = container.createEl("img");
		img.src = `http://coverartarchive.org/release-group/${recommended.id}/front-250`;
		img.alt = `Album Cover for ${recommended.artist} - ${recommended.name}`;

		const albumInfo = container.createDiv();
		albumInfo.setCssProps({
			display: "flex",
			flexDirection: "column",
		});

		albumInfo.createEl("h2").setText(recommended.artist);
		albumInfo.createEl("p").setText(recommended.name);
	}
}
