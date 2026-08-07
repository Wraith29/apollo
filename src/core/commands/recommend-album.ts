import type { App } from "obsidian";
import { RecommendAlbumModal } from "../components/recommend-album-modal";
import type { ApolloSettings } from "../settings";
import type { IFileSystem } from "@/files/filesystem";
import type { ExtendedMetadataCacheAPI } from "obsidian-extended-metadatacache";

export function recommendAlbum(
	app: App,
	cfg: ApolloSettings,
	fs: IFileSystem,
	cache: ExtendedMetadataCacheAPI,
): void {
	const modal = new RecommendAlbumModal(app, cfg, fs, cache);

	modal.open();
}
