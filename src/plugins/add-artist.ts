import { ArtistQuery, ReleaseGroup } from "musicbrainz";
import { Root } from "remark-parse/lib";
import { ListItem } from "mdast";

type ArtistProps = {
	details: ArtistQuery;
};

function createReleaseNode(group: ReleaseGroup): ListItem {
	const releaseDate = new Date(group["first-release-date"]);

	return {
		type: "listItem",
		spread: false,
		children: [
			{
				type: "paragraph",
				children: [
					{
						type: "link",
						url: `https://musicbrainz.org/release-group/${group.id}`,
						children: [{ type: "text", value: group.title.trim() }],
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
										value: `Release Date: [${releaseDate.toLocaleDateString()}]`,
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
										value: `Type: ${group["primary-type"]}`,
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

export default function addArtistPlugin({ details }: ArtistProps) {
	return async function (tree: Root) {
		const albumNodes = details["release-groups"]
			.filter(
				(grp) =>
					(grp["primary-type"] === "Album" ||
						grp["primary-type"] === "EP") &&
					grp["secondary-types"].length === 0,
			)
			.sort(
				(l: ReleaseGroup, r: ReleaseGroup): number =>
					new Date(l["first-release-date"]).getTime() -
					new Date(r["first-release-date"]).getTime(),
			)
			.map(createReleaseNode);

		const artistNode: ListItem = {
			type: "listItem",
			spread: false,
			children: [
				{
					type: "paragraph",
					children: [
						{
							type: "link",
							url: `https://musicbrainz.org/artist/${details.id}`,
							children: [{ type: "text", value: details.name }],
						},
					],
				},
				{
					type: "list",
					spread: false,
					children: albumNodes,
				},
			],
		};

		const artistList = tree.children.find((child) => child.type === "list");
		if (artistList !== undefined) {
			artistList.children.push(artistNode);
			return;
		}

		tree.children.push({
			type: "list",
			spread: false,
			children: [artistNode],
		});
	};
}
