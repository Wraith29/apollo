import { Plugin } from "obsidian";
import {
	type ApolloSettings,
	ApolloSettingsTab,
	DEFAULT_SETTINGS,
} from "./settings";
import { FileSystem, IFileSystem } from "./filesystem";
import RefreshIndexCommand from "./commands/refresh-artists";
import RecommendAlbumCommand from "./commands/recommend-album";
import UpdateArtistsCommand from "./commands/update-artists";
import UpdateSetlistsCommand from "./commands/update-setlists";
import AddArtistModal from "./components/add-artist-modal";

export default class Apollo extends Plugin {
	settings: ApolloSettings = DEFAULT_SETTINGS;
	fileSystem: IFileSystem;

	async onload() {
		await this.loadSettings();
		this.fileSystem = new FileSystem();

		this.addCommand({
			id: "add-artist",
			name: "Add artist",
		});
		this.addCommand(RefreshIndexCommand(this.app, this.settings));
		this.addCommand(RecommendAlbumCommand(this.app, this.settings));
		this.addCommand(UpdateArtistsCommand(this.app, this.settings));
		this.addCommand(UpdateSetlistsCommand(this.app, this.settings));

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
