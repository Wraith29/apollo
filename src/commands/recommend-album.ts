import { RecommendedAlbumModal } from "components/album-recommendation-modal";
import type { ListItem } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import type { App, Command, TAbstractFile, Vault } from "obsidian";
import type { ApolloSettings } from "settings";
import {
	getFileOrThrow,
	getFolderOrCreate,
	joinPath,
	parseMbid,
	randInt,
} from "utils";

export default function RecommendAlbumCommand(
	app: App,
	settings: ApolloSettings,
): Command {
	return {
		id: "recommend-album",
		name: "Recommend album",
		callback: async () => await getRecommendedAlbum(app, settings),
	};
}

type Album = {
	id: string;
	name: string;
};

async function getRecommendedAlbum(
	app: App,
	settings: ApolloSettings,
): Promise<void> {
	const artistsPath = joinPath(settings.dataFolder, "Artists");
	const allArtists = await getFolderOrCreate(app.vault, artistsPath);

	let artistFile: TAbstractFile | undefined;
	let album: Album | undefined;

	do {
		artistFile = allArtists.children[randInt(allArtists.children.length)];
		if (!artistFile || artistFile.name === "Artists.md") {
			continue;
		}

		const albums = await parseAlbums(app.vault, artistFile.path);

		if (albums.length <= 0) {
			continue;
		}

		album = albums[randInt(albums.length)];
	} while (!artistFile || !album);

	const modal = new RecommendedAlbumModal(
		app,
		artistFile.name.substring(0, artistFile.name.length - 3),
		album.name,
		album.id,
	);

	modal.open();
}

async function parseAlbums(vault: Vault, artistPath: string): Promise<Album[]> {
	const file = getFileOrThrow(vault, artistPath);

	const content = await vault.cachedRead(file);
	const tree = fromMarkdown(content);

	const albumHeader = tree.children
		.filter((node) => node.type === "heading")
		.find((head) =>
			head.children.find(
				(node) => node.type === "text" && node.value === "Albums",
			),
		);

	if (!albumHeader) {
		return [];
	}

	const albumList = tree.children[tree.children.indexOf(albumHeader) + 1];
	if (!albumList) {
		return [];
	}

	if (albumList.type !== "list") {
		return [];
	}

	return albumList.children
		.map(parseAlbumNode)
		.filter((album) => album !== null);
}

function parseAlbumNode(node: ListItem): Album | null {
	const paragraph = node.children.find((child) => child.type === "paragraph");
	if (!paragraph) {
		return null;
	}

	const link = paragraph.children.find((child) => child.type === "link");
	if (!link) {
		return null;
	}

	const id = parseMbid(link.url);

	const text = link.children.find((child) => child.type === "text");
	if (!text) {
		return null;
	}

	return {
		id: id,
		name: text.value,
	};
}
