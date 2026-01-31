import { App, Plugin } from "obsidian";
import {
	DEFAULT_SETTINGS,
	ApolloSettings as ApolloSettings,
	ApolloSettingsTab,
} from "./settings";
import { AddArtistModal } from "commands/add-artist";

export default class Apollo extends Plugin {
	settings: ApolloSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "add-artist",
			name: "Add artist",
			callback: () => addArtist(this.app, this.settings),
		});

		this.addSettingTab(new ApolloSettingsTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<ApolloSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

function addArtist(app: App, settings: ApolloSettings): void {
	new AddArtistModal(app, settings).open();
}
