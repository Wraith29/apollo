import type { List, ListItem, Paragraph, Root, RootContent } from "mdast";
import type { ArtistDetails, ReleaseGroup } from "musicbrainz";
import { parseYaml, stringifyYaml } from "obsidian";

export default function injectArtistDetails(details: ArtistDetails) {
	return (tree: Root) => {
		tree.children = [
			generateArtistPropertiesNode(tree, details),
			...getExistingNotes(tree),
			{
				type: "heading",
				depth: 2,
				children: [{ type: "text", value: "Music" }],
			},
			...generateReleaseDetailsNodes(details),
		];
	};
}

function getIndexOfHeader(tree: Root, header: string): number {
	return tree.children.findIndex((node) => {
		if (node.type !== "heading") {
			return false;
		}

		return (
			node.children.filter(
				(child) => child.type === "text" && child.value === header,
			).length === 1
		);
	});
}

function getExistingNotes(tree: Root): RootContent[] {
	const notesNode = getIndexOfHeader(tree, "Notes");
	if (!notesNode) {
		return [];
	}

	const musicNode = getIndexOfHeader(tree, "Music");
	if (!musicNode) {
		return tree.children.slice(notesNode);
	}

	return tree.children.slice(notesNode, musicNode);
}

export type Properties = {
	"added-on": Date;
	"updated-at": Date | null;
	"musicbrainz-id": string | null;
	"spotify-url": string | null;
};

function generateArtistPropertiesNode(
	tree: Root,
	details: ArtistDetails,
): RootContent {
	const existingText = tree.children.find(
		(node) => node.type === "yaml",
	)?.value;

	const properties: Properties | null = existingText
		? (parseYaml(existingText) as Properties)
		: null;

	const spotifyId = details.relations
		.filter((rel) => rel.type === "free streaming")
		.find((rel) => rel.url.resource.startsWith("https://open.spotify.com"));

	const fileProperties: Properties = {
		"added-on": properties?.["added-on"] ?? new Date(),
		"updated-at": new Date(),
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
				depth: 3,
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
