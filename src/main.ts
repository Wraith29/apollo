import { Plugin } from "obsidian";
import {
	DEFAULT_SETTINGS,
	type ApolloSettings,
	ApolloSettingsTab,
} from "./settings";
import AddArtistCommand from "commands/add-artist";
import RefreshIndexCommand from "commands/refresh-artists";
import RecommendAlbumCommand from "commands/recommend-album";
import UpdateArtistsCommand from "commands/update-artists";

export default class Apollo extends Plugin {
	settings: ApolloSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand(AddArtistCommand(this.app, this.settings));
		this.addCommand(RefreshIndexCommand(this.app, this.settings));
		this.addCommand(RecommendAlbumCommand(this.app, this.settings));
		this.addCommand(UpdateArtistsCommand(this.app, this.settings));

		this.addSettingTab(new ApolloSettingsTab(this.app, this));
	}

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
