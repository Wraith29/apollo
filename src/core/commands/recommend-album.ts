import { App } from "obsidian";
import { RecommendAlbumModal } from "../components/recommend-album-modal";

export function recommendAlbum(app: App): void {
	const modal = new RecommendAlbumModal(app);

	modal.open();
}
