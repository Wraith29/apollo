import { Plugin } from "obsidian";
import {
	DEFAULT_SETTINGS,
	ApolloSettings,
	ApolloSettingsTab,
} from "./settings";
import AddArtistModal from "components/add-artist-modal";
import { recommendAlbum } from "recommend";
import { refreshArtistList } from "artist";

export default class Apollo extends Plugin {
	settings: ApolloSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "add-artist",
			name: "Add artist",
			callback: () => new AddArtistModal(this.app, this.settings).open(),
		});

		this.addCommand({
			id: "refresh-artists",
			name: "Refresh artists",
			callback: async () =>
				await refreshArtistList(this.app, this.settings),
		});

		this.addCommand({
			id: "recommend-album",
			name: "Recommend album",
			callback: async () => await recommendAlbum(this.app, this.settings),
		});

		this.addSettingTab(new ApolloSettingsTab(this.app, this));
	}

	onunload() { }

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
