import { Modal, type App, Platform } from "obsidian";

export class RecommendedAlbumModal extends Modal {
	constructor(app: App, artist: string, album: string, id: string) {
		super(app);

		this.setTitle("Recommended album");

		const container = this.contentEl.createDiv();
		container.setCssProps({
			display: "flex",
		});

		const img = container.createEl("img");
		img.src = `http://coverartarchive.org/release-group/${id}/front-250`;
		img.alt = `Album Cover for ${artist} - ${album}`;

		const albumInfo = container.createDiv();
		albumInfo.setCssProps({
			display: "flex",
			"flex-direction": "column",
			"margin-left": "5px",
		});

		if (Platform.isMobile) {
			albumInfo.setCssProps({
				"flex-direction": "row",
			});
		}

		albumInfo.createEl("h2").setText(artist);
		albumInfo.createEl("p").setText(album);
	}
}
