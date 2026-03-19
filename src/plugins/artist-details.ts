import type { ArtistDetails, ReleaseGroup } from "musicbrainz";
import { stringifyYaml } from "obsidian";
import type { Root, ListItem, RootContent, Paragraph, List } from "mdast";

export default function injectArtistDetails(details: ArtistDetails) {
	return (tree: Root) => {
		const notesNode = tree.children
			.filter((node) => node.type === "heading")
			.find((heading) => {
				const textNode = heading.children.find(
					(child) =>
						child.type === "text" && child.data && child.data === "Notes",
				);
			});

		tree.children = [
			generateArtistPropertiesNode(details),
			...generateReleaseDetailsNodes(details),
		];
	};
}

export type Properties = {
	"added-on": Date;
	"musicbrainz-id": string | null;
	"spotify-url": string | null;
};

function generateArtistPropertiesNode(details: ArtistDetails): RootContent {
	const spotifyId = details.relations
		.filter((rel) => rel.type === "free streaming")
		.find((rel) => rel.url.resource.startsWith("https://open.spotify.com"));

	const fileProperties: Properties = {
		"added-on": new Date(),
		"musicbrainz-id": details.id,
		"spotify-url": null,
	};

	if (spotifyId) {
		fileProperties["spotify-url"] = spotifyId.url.resource;
	}

	return {
		type: "yaml",
		value: stringifyYaml(fileProperties),
	};
}

function generateReleaseDetailsNodes(details: ArtistDetails): RootContent[] {
	const albumTypes = new Set(
		details["release-groups"].map((r) => r["primary-type"]),
	);

	const nodes: RootContent[] = [];

	albumTypes.forEach((typ) => {
		const releases = details["release-groups"].filter(
			(rel) => rel["primary-type"] === typ,
		);

		nodes.push(
			{
				type: "heading",
				depth: 2,
				children: [
					{
						type: "text",
						value: `${typ}s`,
					},
				],
			},
			{
				type: "list",
				spread: false,
				children: releases.map(generateAlbumNode),
			},
		);
	});

	return nodes;
}

function generateAlbumNode(album: ReleaseGroup): ListItem {
	const released = new Date(album["first-release-date"]);

	const header: Paragraph = {
		type: "paragraph",
		children: [
			{
				type: "link",
				url: `https://musicbrainz.org/release-group/${album.id}`,
				children: [{ type: "text", value: album.title }],
			},
		],
	};

	const details: List = {
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
	};

	if (album["secondary-types"].length > 0) {
		const secondaryTypes = album["secondary-types"].join(",");

		details.children.push({
			type: "listItem",
			children: [
				{
					type: "paragraph",
					children: [
						{
							type: "text",
							value: `Secondary-Types: ${secondaryTypes}`,
						},
					],
				},
			],
		});
	}

	return {
		type: "listItem",
		spread: false,
		children: [header, details],
	};
}
