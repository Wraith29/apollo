import AddArtistModal from "components/add-artist-modal";
import { App, Command } from "obsidian";
import { ApolloSettings } from "settings";
import { refreshArtists } from "./refresh-artists";

export default function AddArtistCommand(
	app: App,
	settings: ApolloSettings,
): Command {
	return {
		id: "add-artist",
		name: "Add artist",
		callback: async () => await addArtist(app, settings),
	};
}

async function addArtist(app: App, settings: ApolloSettings): Promise<void> {
	const modal = new AddArtistModal(app, settings);
	modal.open();

	await refreshArtists(app, settings);
}
