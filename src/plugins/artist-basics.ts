import type { ListItem, Root } from "mdast";
import type { App, TAbstractFile } from "obsidian";
import type { ApolloSettings } from "settings";

type Props = {
	app: App;
	settings: ApolloSettings;
};

export default function injectArtistBasics({ app, settings }: Props) {
	return (tree: Root) => {
		const artistFolderPath = [settings.dataFolder, "Artists"].join("/");
		const artistFolder = app.vault.getFolderByPath(artistFolderPath);
		if (artistFolder === null) {
			console.error({
				message: "Failed to open artistFolderPath",
				artistFolderPath: artistFolderPath,
			});
			return;
		}

		const nodes = artistFolder.children
			.filter((file) => file.name !== "Artists.md")
			.sort((l, r) => (l.name.toLowerCase() > r.name.toLowerCase() ? 1 : -1))
			.map(createArtistNode);

		tree.children = [
			{
				type: "list",
				spread: false,
				children: nodes,
			},
		];
	};
}

function createArtistNode(file: TAbstractFile): ListItem {
	const nameNoExt = file.name.substring(0, file.name.length - 3);

	return {
		type: "listItem",
		spread: false,
		children: [
			{
				type: "paragraph",
				children: [
					{
						type: "link",
						url: file.path,
						children: [{ type: "text", value: nameNoExt }],
					},
				],
			},
		],
	};
}
