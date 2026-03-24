import { type App, PluginSettingTab, SecretComponent, Setting } from "obsidian";
import type Apollo from "./main";

export interface ApolloSettings {
	dataFolder: string;
	artistsIndexFile: string;
	setlistFmKeySecret: string;
}

export const DEFAULT_SETTINGS: ApolloSettings = {
	dataFolder: "Music",
	artistsIndexFile: "Music/Artists/Artists.md",
	setlistFmKeySecret: "",
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

		new Setting(containerEl).setName("Data folder").addDropdown((drop) => {
			const folders = this.app.vault.getAllFolders(true);
			folders.forEach((folder) => {
				drop.addOption(folder.path, folder.path);
			});

			drop.setValue(this.plugin.settings.dataFolder);
			drop.onChange(async (value) => {
				this.plugin.settings.dataFolder = value;
				await this.plugin.saveSettings();
			});
		});

		new Setting(containerEl)
			.setName("Artists index file")
			.setDesc("Where the index of all artists will be stored")
			.addDropdown((drop) => {
				const files = this.app.vault.getMarkdownFiles();
				files.forEach((file) => {
					drop.addOption(file.path, file.path);
				});

				drop.setValue(this.plugin.settings.artistsIndexFile);
				drop.onChange(async (value) => {
					this.plugin.settings.artistsIndexFile = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Setlist api key.")
			.setDesc("Select a secret from the secret-storage")
			.addComponent((el) =>
				new SecretComponent(this.app, el)
					.setValue(this.plugin.settings.setlistFmKeySecret)
					.onChange(async (value) => {
						this.plugin.settings.setlistFmKeySecret = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
