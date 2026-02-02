import { Plugin } from "obsidian";
import {
	DEFAULT_SETTINGS,
	ApolloSettings as ApolloSettings,
	ApolloSettingsTab,
} from "./settings";
import { addArtistCommand } from "commands/add-artist";
import { recommendAlbumCommand } from "commands/recommend-album";

export default class Apollo extends Plugin {
	settings: ApolloSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "add-artist",
			name: "Add artist",
			callback: () => addArtistCommand(this.app, this.settings),
		});

		this.addCommand({
			id: "recommend-album",
			name: "Recommend album",
			callback: async () =>
				await recommendAlbumCommand(this.app, this.settings),
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
