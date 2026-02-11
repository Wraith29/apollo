import AddArtistModal from "components/add-artist-modal";
import { App, Command } from "obsidian";
import { ApolloSettings } from "settings";

export default function AddArtistCommand(
	app: App,
	settings: ApolloSettings,
): Command {
	return {
		id: "add-artist",
		name: "Add artist",
		callback: () => addArtist(app, settings),
	};
}

function addArtist(app: App, settings: ApolloSettings): void {
	const modal = new AddArtistModal(app, settings);
	modal.open();
}
