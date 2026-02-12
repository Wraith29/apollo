import { fromMarkdown } from "mdast-util-from-markdown";
import { App, Command, Notice, parseYaml, TFile, Vault } from "obsidian";
import { ApolloSettings } from "settings";
import { createFilepath, getFileOrThrow, getFolderOrCreate } from "utils";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { frontmatter } from "micromark-extension-frontmatter";
import { saveDetails } from "artist";
import { getArtistDetails } from "musicbrainz";

export default function UpdateArtistsCommand(
	app: App,
	settings: ApolloSettings,
): Command {
	return {
		id: "update-artists",
		name: "Update artists",
		callback: async () => await startUpdates(app, settings),
	};
}

async function startUpdates(app: App, settings: ApolloSettings): Promise<void> {
	const artistsPath = createFilepath(settings.dataFolder, "Artists");
	const allArtists = await getFolderOrCreate(app.vault, artistsPath);

	const files = allArtists.children.filter(
		(file) => file.name !== "Artists.md",
	);

	let iteration = 0;
	let interval: NodeJS.Timeout;

	new Notice(
		`Starting to update artists.\nIt will take approximately ${files.length} seconds.`,
	);

	interval = setInterval(async () => {
		if (iteration >= files.length) {
			clearTimeout(interval);
			new Notice("Finished updating artists.");
			return;
		}

		const abstractFile = files[iteration];
		iteration++;

		if (!abstractFile) {
			console.error({ message: "Unable to find file." });
			return;
		}

		const file = getFileOrThrow(app.vault, abstractFile.path);
		const mbid = await findMbid(app.vault, file);

		if (mbid === null) {
			return;
		}

		const details = await getArtistDetails(mbid);
		await saveDetails(app, settings, details);
	}, 1000);
}

async function findMbid(vault: Vault, file: TFile): Promise<string | null> {
	const contents = await vault.cachedRead(file);
	const tree = fromMarkdown(contents, {
		extensions: [frontmatter(["yaml"])],
		mdastExtensions: [frontmatterFromMarkdown(["yaml"])],
	});

	const propsElem = tree.children.find((node) => node.type === "yaml");
	if (!propsElem) {
		return null;
	}

	const properties = parseYaml(propsElem.value);
	const mbid = properties["musicbrainz-id"];

	if (mbid !== "null") {
		return mbid;
	}

	return null;
}
