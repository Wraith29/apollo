import type {
	BlockContent,
	DefinitionContent,
	Heading,
	Link,
	List,
	ListItem,
	ListItemData,
	Paragraph,
	PhrasingContent,
	Root,
	Text,
} from "mdast";

export function getIndexOfHeader(tree: Root, header: string): number {
	return tree.children.findIndex((node) => {
		if (node.type !== "heading") {
			return false;
		}

		const textChildren = node.children.filter(
			(child) => child.type === "text" && child.value === header,
		);

		return textChildren.length > 0;
	});
}

type Depth = 1 | 2 | 3 | 4 | 5 | 6;

export function buildHeading(title: string, depth: Depth): Heading {
	return {
		type: "heading",
		depth: depth,
		children: [
			{
				type: "text",
				value: title,
			},
		],
	};
}

export function buildText(inner: string): Text {
	return {
		type: "text",
		value: inner,
	};
}

export function buildLink(
	url: string,
	children: PhrasingContent[],
	title?: string,
): Link {
	return {
		type: "link",
		url: url,
		children: children,
		title: title,
	};
}

export function buildParagraph(children: PhrasingContent[]): Paragraph {
	return {
		type: "paragraph",
		children: children,
	};
}

export function buildList(items: ListItem[]): List {
	return {
		type: "list",
		spread: false,
		children: items,
	};
}

export function buildListItem(
	children: (BlockContent | DefinitionContent)[],
): ListItem {
	return {
		type: "listItem",
		spread: false,
		children: children,
	};
}
