import { IFileSystem } from "@/files/filesystem";
import { ApolloSettings } from "@/core/settings";
import { IMusicbrainzClient } from "@/clients/musicbrainz";
import ArtistDetailsFile from "@/files/markdown/artist-details";
import { joinAndNormalizePath } from "@/utils/path";

export async function updateArtists(
	cfg: ApolloSettings,
	fs: IFileSystem,
	mbClient: IMusicbrainzClient,
): Promise<void> {
	const artistFiles = fs.getFilesInFolder(
		joinAndNormalizePath(cfg.dataRoot, "Artists"),
	);

	for (const file of artistFiles) {
		try {
			await updateArtist(file, fs, mbClient);
		} catch (error) {
			console.error({
				message: "There was an error updating artist at path",
				path: file,
				error: error,
			});
		}
	}
}

async function updateArtist(
	path: string,
	fs: IFileSystem,
	mbClient: IMusicbrainzClient,
): Promise<void> {
	const props = await fs.parseProperties<{ "musicbrainz-id": string | null }>(
		path,
	);

	if (!props) {
		return;
	}

	const mbid = props["musicbrainz-id"];
	if (!mbid) {
		return;
	}

	const artistDetails = await mbClient.getArtistDetails(mbid);

	const detailsFile = new ArtistDetailsFile(path, fs);
	await detailsFile.process(artistDetails);
	await detailsFile.save();
}
