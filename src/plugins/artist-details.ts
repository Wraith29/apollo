import { ArtistDetails, ReleaseGroup } from "musicbrainz";
import { stringifyYaml } from "obsidian";
import { Root, ListItem, RootContent } from "mdast";

export default function injectArtistDetails(details: ArtistDetails) {
	return function (tree: Root) {
		tree.children = [
			generateArtistPropertiesNode(details),
			...generateAlbumsNode(details),
		];
	};
}

function generateArtistPropertiesNode(details: ArtistDetails): RootContent {
	return {
		type: "yaml",
		value: stringifyYaml({
			"added-on": new Date(),
			"musicbrainz-id": details.id,
		}),
	};
}

function generateAlbumsNode(details: ArtistDetails): RootContent[] {
	const albumNodes = details["release-groups"]
		.filter(
			(grp) =>
				(grp["primary-type"] === "Album" ||
					grp["primary-type"] === "EP") &&
				grp["secondary-types"].length === 0,
		)
		.sort(
			(left, right) =>
				new Date(left["first-release-date"]).getTime() -
				new Date(right["first-release-date"]).getTime(),
		)
		.map((grp) => generateAlbumNode(grp));

	return [
		{
			type: "heading",
			depth: 2,
			children: [{ type: "text", value: "Albums" }],
		},
		{
			type: "list",
			spread: false,
			children: albumNodes,
		},
	];
}

function generateAlbumNode(album: ReleaseGroup): ListItem {
	const released = new Date(album["first-release-date"]);

	return {
		type: "listItem",
		spread: false,
		children: [
			{
				type: "paragraph",
				children: [
					{
						type: "link",
						url: `https://musicbrainz.org/release-group/${album.id}`,
						children: [{ type: "text", value: album.title }],
					},
				],
			},
			{
				type: "list",
				spread: false,
				children: [
					{
						type: "listItem",
						children: [
							{
								type: "paragraph",
								children: [
									{
										type: "text",
										value: `Release Date: ${released.toLocaleDateString()}`,
									},
								],
							},
						],
					},
					{
						type: "listItem",
						children: [
							{
								type: "paragraph",
								children: [
									{
										type: "text",
										value: `Type: ${album["primary-type"]}`,
									},
								],
							},
						],
					},
				],
			},
		],
	};
}
