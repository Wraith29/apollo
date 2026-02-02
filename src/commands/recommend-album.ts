import { RecommendedAlbumModal } from "components/recommended-album-modal";
import { getAllAlbums } from "data/albums";
import { App, Notice } from "obsidian";
import { ApolloSettings } from "settings";

export async function recommendAlbumCommand(
	app: App,
	settings: ApolloSettings,
): Promise<void> {
	const albums = await getAllAlbums(app, settings);

	const recommended = albums[Math.floor(Math.random() * albums.length)];
	if (!recommended) {
		new Notice("Unexpected error occurred");
		return;
	}

	new RecommendedAlbumModal(app, recommended).open();
}
