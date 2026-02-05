import { fromMarkdown } from "mdast-util-from-markdown";
import { App, Notice, TFile } from "obsidian";
import { ApolloSettings } from "settings";
import { RootContent } from "mdast";
import { RecommendedAlbumModal } from "components/album-recommendation-modal";

export async function recommendAlbum(
	app: App,
	settings: ApolloSettings,
): Promise<void> {
	const artistsFolderPath = [settings.dataFolder, "Artists"].join("/");
	const artistsFolder = app.vault.getFolderByPath(artistsFolderPath);
	if (artistsFolder === null) {
		console.error({
			message: "Failed to open artistsFolderPath",
			artistsFolderPath: artistsFolderPath,
		});
		new Notice(
			"Something went wrong\nPlease check the console for more detailed information.",
		);
		return;
	}

	const artistIndex = Math.floor(
		Math.random() * artistsFolder.children.length,
	);
	const artistFilename = artistsFolder.children[artistIndex];
	if (!artistFilename) {
		console.error({
			message: "Failed to get artist",
		});
		new Notice(
			"Something went wrong\nPlease check the console for more detailed information.",
		);
		return;
	}

	const artist = app.vault.getFileByPath(artistFilename.path);
	if (artist === null) {
		console.error({
			message: "Failed to get artistFile",
			artistFile: artistFilename.path,
		});
		new Notice(
			"Something went wrong\nPlease check the console for more detailed information.",
		);
		return;
	}

	const artistName = artist.name.substring(0, artist.name.length - 3);

	const albumNames = await parseAlbums(app, artist);
	console.log(albumNames);

	const album = albumNames[Math.floor(Math.random() * albumNames.length)];
	if (!album) {
		console.error({
			message: "Failed to find an album",
			albums: albumNames,
		});
		new Notice(
			"Something went wrong\nPlease check the console for more detailed information.",
		);
		return;
	}

	new RecommendedAlbumModal(app, artistName, album[0], album[1]).open();
}

async function parseAlbums(
	app: App,
	artist: TFile,
): Promise<[name: string, id: string][]> {
	const content = await app.vault.cachedRead(artist);
	const ast = fromMarkdown(content);

	const headerIndex = ast.children.findIndex(isAlbumHeader);
	const albumList = ast.children[headerIndex + 1];
	if (!albumList || albumList.type !== "list") {
		console.error({
			message:
				"Malformed content in artistFile. Expected `heading` then `list` but did not find `list`",
			artistFile: artist.path,
		});
		return [];
	}

	let result: [name: string, id: string][] = [];

	albumList.children.forEach((item) => {
		const paragraph = item.children.find(
			(node) => node.type === "paragraph",
		);
		if (!paragraph) {
			console.warn({
				message: "Invalid node in item",
				node: item,
			});
			return;
		}

		const link = paragraph.children.find((node) => node.type === "link");
		if (!link) {
			console.warn({
				message: "Invalid node in paragraph",
				node: paragraph,
			});
			return;
		}

		const id = link.url.substring(link.url.lastIndexOf("/") + 1);

		const text = link.children.find((node) => node.type === "text");
		if (!text) {
			console.warn({ message: "Invalid node in paragraph", node: link });
			return;
		}

		result.push([text.value, id]);
	});

	return result;
}

function isAlbumHeader(item: RootContent): boolean {
	if (item.type !== "heading") {
		return false;
	}

	if (item.depth !== 2) {
		return false;
	}

	const text = item.children.find((node) => node.type === "text");
	if (!text) {
		return false;
	}

	return text.value === "Albums";
}
