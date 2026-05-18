import { normalizePath, type App } from "obsidian";
import type { IMusicbrainzClient } from "@/clients/musicbrainz";
import type { IFileSystem } from "@/files/filesystem";
import {
	AddArtistModal,
	type OnSubmitFn,
} from "../components/add-artist-modal";
import type { ApolloSettings } from "../settings";
import ArtistDetailsFile from "@/files/markdown/artist-details";
import path from "path";

export function addArtist(
	app: App,
	cfg: ApolloSettings,
	fs: IFileSystem,
	mbClient: IMusicbrainzClient,
): void {
	const modal = new AddArtistModal(
		app,
		createAddArtistHandler(app, cfg, fs, mbClient),
	);

	modal.open();
}

function createAddArtistHandler(
	app: App,
	cfg: ApolloSettings,
	fs: IFileSystem,
	mbClient: IMusicbrainzClient,
): OnSubmitFn {
	return async (musicbrainzUrl: string): Promise<void> => {
		const musicbrainzId = extractMbidFromUrl(musicbrainzUrl);
		const artistDetails = await mbClient.getArtistDetails(musicbrainzId);

		const artistFilePath = normalizePath(
			path.join(cfg.dataRoot, "Artists", artistDetails.name + ".md"),
		);

		const detailsFile = new ArtistDetailsFile(artistFilePath, fs);
		await detailsFile.process(artistDetails);
		detailsFile.save();
	};
}

function extractMbidFromUrl(url: string): string {
	return url.slice(url.lastIndexOf("/") + 1);
}
