import { IFileSystem } from "@/files/filesystem";
import { ApolloSettings } from "@/core/settings";
import { ReleaseGroup } from "@/types/musicbrainz";
import { joinAndNormalizePath } from "@/utils/path";

export async function recommendAlbum(
	cfg: ApolloSettings,
	fs: IFileSystem,
): Promise<void> {
	const artistFolder = joinAndNormalizePath(cfg.dataRoot, "Artists");
	const artistFiles = fs.getFilesInFolder(artistFolder);
	console.log({ artistFiles });

	let albumData: ReleaseGroup | null = null;

	// TODO: Remove this badboy
	await Promise.resolve();

	do {
		const randomIndex = Math.floor(Math.random() * artistFiles.length);
		const randomArtist = artistFiles[randomIndex];
	} while (albumData === null);

	console.log({ albumData });
}
