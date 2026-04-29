import { Root } from "mdast";

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
