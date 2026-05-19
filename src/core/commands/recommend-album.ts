import { IFileSystem } from "@/files/filesystem";
import { ApolloSettings } from "@/core/settings";
import { joinAndNormalizePath } from "@/utils/path";
import ArtistDetailsFile from "@/files/markdown/artist-details";

export async function recommendAlbum(
	cfg: ApolloSettings,
	fs: IFileSystem,
): Promise<void> {
	const artistFolder = joinAndNormalizePath(cfg.dataRoot, "Artists");
	const artistFiles = fs.getFilesInFolder(artistFolder);

	// TODO: Remove this badboy
	await Promise.resolve();

	// TODO: add a do-while
	const randomIndex = Math.floor(Math.random() * artistFiles.length);
	const randomArtist = artistFiles[randomIndex];
	if (!randomArtist) {
		throw new Error("fuck off");
	}

	const df = await ArtistDetailsFile.fromFile(randomArtist, fs);

	console.error({ df });
}
