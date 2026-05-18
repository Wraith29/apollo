import type { App } from "obsidian";
import type { IMusicbrainzClient } from "@/clients/musicbrainz";
import type { IFileSystem } from "@/files/filesystem";
import {
	AddArtistModal,
	type OnSubmitFn,
} from "../components/add-artist-modal";
import type { ApolloSettings } from "../settings";

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

		console.log(artistDetails);
	};
}

function extractMbidFromUrl(url: string): string {
	return url.slice(url.lastIndexOf("/") + 1);
}
