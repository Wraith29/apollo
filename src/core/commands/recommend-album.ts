import { App } from "obsidian";
import { RecommendAlbumModal } from "../components/recommend-album-modal";
import { ApolloSettings } from "../settings";
import { IFileSystem } from "@/files/filesystem";
import { ExtendedMetadataCacheAPI } from "obsidian-extended-metadatacache";

export function recommendAlbum(
	app: App,
	cfg: ApolloSettings,
	fs: IFileSystem,
	cache: ExtendedMetadataCacheAPI,
): void {
	const modal = new RecommendAlbumModal(app, cfg, fs, cache);

	modal.open();
}
