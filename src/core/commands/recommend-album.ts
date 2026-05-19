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
		const randomIndex = Math.random() * artistFiles.length;
		const randomArtist = artistFiles[randomIndex];

		console.log({ randomArtist, albumData });

		albumData = {
			title: "",
			id: "",
			"first-release-date": "",
			"primary-type": "",
			"secondary-types": [],
		};

		break;
	} while (albumData === null);

	console.log({ albumData });
}
