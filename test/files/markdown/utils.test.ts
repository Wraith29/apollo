import { describe, expect, test } from "bun:test";
import type { Root } from "mdast";
import { getIndexOfHeader } from "@/files/markdown/utils";

describe("getIndexOfHeader", () => {
	test("header not present, returns -1", () => {
		const tree: Root = {
			type: "root",
			children: [
				{
					type: "heading",
					depth: 2,
					children: [
						{
							type: "text",
							value: "Hello",
						},
					],
				},
			],
		};

		const result = getIndexOfHeader(tree, "Not Hello");

		expect(result).toBe(-1);
	});

	test("header is present, returns the index", () => {
		const tree: Root = {
			type: "root",
			children: [
				{
					type: "heading",
					depth: 2,
					children: [{ type: "text", value: "MyHeader" }],
				},
			],
		};

		const result = getIndexOfHeader(tree, "MyHeader");

		expect(result).toBe(0);
	});
});
