import { fromMarkdown } from "mdast-util-from-markdown";
import { App, Notice } from "obsidian";
import { ApolloSettings } from "settings";
import { ListItem } from "mdast";

export type Album = {
	artist: string;
	name: string;
	id: string;
};

function parseArtistName(node: ListItem): string | null {
	const artistNameNode = node.children.find(
		(item) => item.type === "paragraph",
	);
	if (!artistNameNode) {
		console.error({
			message: 'Found no nodes matching type "paragraph" in node',
			node: node,
		});
		return null;
	}

	const artistNameLink = artistNameNode.children.find(
		(item) => item.type === "link",
	);
	if (!artistNameLink) {
		console.error({
			message: 'Found no nodes matching type "link" in node',
			node: artistNameNode,
		});
		return null;
	}

	const artistNameText = artistNameLink.children.find(
		(item) => item.type === "text",
	);
	if (!artistNameText) {
		console.error({
			message: 'Found no nodes matching type "text" in node',
			node: artistNameLink,
		});
		return null;
	}

	return artistNameText.value;
}

function parseAlbumNode(node: ListItem, artistName: string): Album | null {
	const albumNameNode = node.children.find(
		(item) => item.type === "paragraph",
	);
	if (!albumNameNode) {
		console.error({
			message: 'Found no nodes matching type "paragraph" in node',
			node: node,
		});

		return null;
	}

	const albumLink = albumNameNode.children.find(
		(item) => item.type === "link",
	);
	if (!albumLink) {
		console.error({
			message: 'Found no nodes matching type "paragraph" in node',
			node: albumNameNode,
		});
		return null;
	}

	const albumId = albumLink?.url.substring(
		albumLink.url.lastIndexOf("/") + 1,
	);
	if (!albumId) {
		console.error({
			message: "Failed to parse album link",
			link: albumLink.url,
		});
		return null;
	}

	const albumTextNode = albumLink.children.find(
		(item) => item.type === "text",
	);
	if (!albumTextNode) {
		console.error({
			message: 'Found no nodes matching type "text" in node',
			node: albumLink,
		});
		return null;
	}

	return {
		artist: artistName,
		name: albumTextNode.value,
		id: albumId,
	};
}

function parseArtistNode(node: ListItem): Album[] {
	const artistName = parseArtistName(node);
	if (!artistName) {
		new Notice(
			"Failed to parse node.\nCheck the console for more information",
		);
		return [];
	}

	let albums: Album[] = [];

	const albumList = node.children.find((item) => item.type === "list");
	if (!albumList) {
		console.error({
			message: 'Found no nodes matching type "list" in node',
			node: node,
		});
		new Notice(
			"Failed to parse node.\nCheck the console for more information",
		);
		return [];
	}

	albumList.children.forEach((item): void => {
		const data = parseAlbumNode(item, artistName);
		if (!data) {
			new Notice(
				"Failed to parse node.\nCheck the console for more information",
			);
			return;
		}

		albums.push(data);
	});

	return albums;
}

export async function getAllAlbums(
	app: App,
	settings: ApolloSettings,
): Promise<Album[]> {
	const artistsPath = [settings.dataFolder, "Artists.md"].join("/");
	const artistsFile = app.vault.getFileByPath(artistsPath);
	if (artistsFile === null) {
		console.error({
			message: "Failed to open artistsFile",
			artistsPath: artistsPath,
		});
		new Notice("Failed to open artists file");

		return [];
	}

	const data = await app.vault.cachedRead(artistsFile);
	const ast = fromMarkdown(data);

	const artistList = ast.children.find((node) => node.type === "list");
	if (artistList === undefined) {
		new Notice(
			`No artists found in ${artistsPath}.\nTry adding an artist and then running this command again`,
		);
		return [];
	}

	let albums: Album[] = [];

	artistList.children.forEach((node) => {
		const data = parseArtistNode(node);
		if (data.length === 0) {
			console.error({ message: "No albums found in node", node: node });
			new Notice(
				"Failed to parse node.\nCheck the console for more information",
			);

			return;
		}

		albums.push(...data);
	});

	return albums;
}
