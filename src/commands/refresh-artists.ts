import { App, Command } from "obsidian";
import injectArtistBasics from "plugins/artist-basics";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { ApolloSettings } from "settings";
import { unified } from "unified";
import { getFileOrCreate } from "utils";

export default function RefreshArtistsCommand(
	app: App,
	settings: ApolloSettings,
): Command {
	return {
		id: "refresh-artists",
		name: "Refresh artists",
		callback: async () => await refreshArtists(app, settings),
	};
}

async function refreshArtists(
	app: App,
	settings: ApolloSettings,
): Promise<void> {
	const indexFile = await getFileOrCreate(
		app.vault,
		settings.artistsIndexFile,
	);

	const current = await app.vault.read(indexFile);
	const processed = await unified()
		.use(remarkParse)
		.use(injectArtistBasics, { app, settings })
		.use(remarkStringify)
		.process(current);

	await app.vault.modify(indexFile, String(processed));
}
