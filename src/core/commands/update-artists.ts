import { IFileSystem } from "@/files/filesystem";
import { ApolloSettings } from "@/core/settings";
import { IMusicbrainzClient } from "@/clients/musicbrainz";

export async function updateArtists(
	cfg: ApolloSettings,
	fs: IFileSystem,
	mbClient: IMusicbrainzClient,
): Promise<void> {
	const artistFiles = fs.getFilesInFolder(cfg.dataRoot);

	for (const file in artistFiles) {
	}
}

async function updateArtist(
	path: string,
	fs: IFileSystem,
	mbClient: IMusicbrainzClient,
): Promise<void> {
	const mbid = fs.parseProperties<{ "musicbrainz-id": string }>(path);
	if (!mbid) {
		return;
	}

	const artistDetails = await mbClient.getArtistDetails(mbid);
}
