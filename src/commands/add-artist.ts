import AddArtistModal from "components/add-artist-modal";
import type { App, Command } from "obsidian";
import type { ApolloSettings } from "settings";

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
}
