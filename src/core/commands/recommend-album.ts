import { App } from "obsidian";
import { RecommendAlbumModal } from "../components/recommend-album-modal";
import { ApolloSettings } from "../settings";
import { IFileSystem } from "@/files/filesystem";

export function recommendAlbum(
	app: App,
	cfg: ApolloSettings,
	fs: IFileSystem,
): void {
	const modal = new RecommendAlbumModal(app, cfg, fs);

	modal.open();
}
