import type { App } from "obsidian";
import { RecommendAlbumModal } from "../components/recommend-album-modal";
import type { ApolloSettings } from "../settings";
import type { IFileSystem } from "@/files/filesystem";
import ArtistCache from "../artist-cache";

export function recommendAlbum(
	app: App,
	cfg: ApolloSettings,
	fs: IFileSystem,
	cache: ArtistCache,
): void {
	const modal = new RecommendAlbumModal(app, cfg, fs, cache);

	modal.open();
}
