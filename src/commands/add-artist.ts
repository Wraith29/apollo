import { AddArtistModal } from "components/add-artist-modal";
import { App } from "obsidian";
import { ApolloSettings } from "settings";

export function addArtistCommand(app: App, settings: ApolloSettings): void {
	new AddArtistModal(app, settings).open();
}
