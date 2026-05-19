import { normalizePath, type App } from "obsidian";
import type { IMusicbrainzClient } from "@/clients/musicbrainz";
import type { IFileSystem } from "@/files/filesystem";
import {
	AddArtistModal,
	type OnSubmitFn,
} from "../components/add-artist-modal";
import type { ApolloSettings } from "../settings";
import ArtistDetailsFile from "@/files/markdown/artist-details";
import { joinAndNormalizePath } from "@/utils/path";

export function addArtist(
	app: App,
	cfg: ApolloSettings,
	fs: IFileSystem,
	mbClient: IMusicbrainzClient,
): void {
	fs.ensureFolderExists(joinAndNormalizePath(cfg.dataRoot, "Artists"));

	const modal = new AddArtistModal(
		app,
		createAddArtistHandler(cfg, fs, mbClient),
	);

	modal.open();
}

function createAddArtistHandler(
	cfg: ApolloSettings,
	fs: IFileSystem,
	mbClient: IMusicbrainzClient,
): OnSubmitFn {
	return async (musicbrainzUrl: string): Promise<void> => {
		const musicbrainzId = extractMbidFromUrl(musicbrainzUrl);
		const artistDetails = await mbClient.getArtistDetails(musicbrainzId);

		const artistFilePath = joinAndNormalizePath(
			cfg.dataRoot,
			"Artists",
			`${artistDetails.name}.md`,
		);

		const detailsFile = new ArtistDetailsFile(artistFilePath, fs);
		await detailsFile.process(artistDetails);
		detailsFile.save();

		await fs.openFile(artistFilePath);
	};
}

function extractMbidFromUrl(url: string): string {
	return url.slice(url.lastIndexOf("/") + 1);
}
