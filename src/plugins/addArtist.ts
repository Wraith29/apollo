import { Root } from "remark-parse/lib";

type ArtistProps = {
	name: string;
	musicbrainzId: string;
};

export default function artistPlugin(props: ArtistProps) {
	return function (tree: Root) {
		const artistList = tree.children.find((child) => child.type === "list");

		artistList?.children.push({
			type: "listItem",
			children: [
				{
					type: "paragraph",
					children: [
						{
							type: "link",
							url: `https://musicbrainz.org/artist/${props.musicbrainzId}`,
							children: [{ type: "text", value: props.name }],
						},
					],
				},
			],
		});
	};
}
