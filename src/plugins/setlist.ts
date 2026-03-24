import type { ListItem, Root, RootContent, Yaml } from "mdast";
import { parseYaml, stringifyYaml } from "obsidian";
import type { GigProperties } from "types/properties";
import type { SetlistSet } from "types/setlist";

type Props = {
	setlists: SetlistSet[];
};

export default function injectSetlist({ setlists }: Props) {
	return (tree: Root) => {
		const properties = tree.children.find((node) => node.type === "yaml");
		if (!properties) {
			throw new Error("Failed to retrieve properties, invalid gig");
		}

		tree.children = [
			getUpdatedProperties(properties),
			...generateSetlistsNode(setlists),
		];
	};
}

function getUpdatedProperties(yaml: Yaml): Yaml {
	const parsed: GigProperties = parseYaml(yaml.value) as GigProperties;

	parsed["setlist-added"] = true;

	return {
		type: "yaml",
		value: stringifyYaml(parsed),
	};
}

function generateSetlistsNode(setlists: SetlistSet[]): RootContent[] {
	return [
		{
			type: "heading",
			depth: 2,
			children: [{ type: "text", value: "Setlist" }],
		},
		...setlists.flatMap(generateSetlistListNode),
	];
}

function generateSetlistListNode(set: SetlistSet): RootContent[] {
	const songNodes: ListItem[] = [];

	for (const song of set.song) {
		const songValue = song.info ? `${song.name} (${song.info})` : song.name;

		songNodes.push({
			type: "listItem",
			children: [
				{
					type: "paragraph",
					children: [{ type: "text", value: songValue }],
				},
			],
		});
	}

	const encoreTitle: RootContent = {
		type: "heading",
		depth: 3,
		children: [
			{
				type: "text",
				value: "Encore",
			},
		],
	};

	const listNode: RootContent = {
		type: "list",
		spread: false,
		ordered: true,
		children: songNodes,
	};

	if (set.encore) {
		return [encoreTitle, listNode];
	}

	return [listNode];
}
