import { App, PluginSettingTab, Setting } from "obsidian";
import Apollo from "./main";

export interface ApolloSettings {
	dataFolder: string;
}

export const DEFAULT_SETTINGS: ApolloSettings = {
	dataFolder: "Music",
};

export class ApolloSettingsTab extends PluginSettingTab {
	plugin: Apollo;

	constructor(app: App, plugin: Apollo) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl).setName("Data Folder").addDropdown((drop) => {
			const folders = this.app.vault.getAllFolders(true);
			folders.forEach((folder) =>
				drop.addOption(folder.path, folder.path),
			);

			drop.onChange(async (value) => {
				this.plugin.settings.dataFolder = value;
				await this.plugin.saveSettings();
			});
		});
	}
}
