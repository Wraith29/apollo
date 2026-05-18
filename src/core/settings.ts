import { type App, PluginSettingTab, SecretComponent, Setting } from "obsidian";
import type { IFileSystem } from "@/files/filesystem";
import type ApolloPlugin from "./plugin";

export type ApolloSettings = {
	dataRoot: string;
	setlistFmSecretKey: string;
};

export const DEFAULT_SETTINGS: ApolloSettings = {
	dataRoot: "Music",
	setlistFmSecretKey: "setlist-fm-api-key",
};

export class ApolloSettingsTab extends PluginSettingTab {
	private readonly _plugin: ApolloPlugin;
	private readonly _fileSystem: IFileSystem;

	constructor(app: App, plugin: ApolloPlugin, fileSystem: IFileSystem) {
		super(app, plugin);
		this._plugin = plugin;
		this._fileSystem = fileSystem;
	}

	public display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Data root.")
			.setDesc("The root of all the content apollo provides")
			.addDropdown((drop) => {
				const folders = this._fileSystem.getAllFolders();
				folders.forEach((folder) => {
					drop.addOption(folder, folder);
				});

				drop.setValue(this._plugin.settings.dataRoot);
				drop.onChange(async (value: string) => {
					this._plugin.settings.dataRoot = value;
					await this._plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Setlist api key")
			.setDesc("Select a secret from your storage for setlist.fm")
			.addComponent((el) =>
				new SecretComponent(this.app, el)
					.setValue(this._plugin.settings.setlistFmSecretKey)
					.onChange(async (value) => {
						this._plugin.settings.setlistFmSecretKey = value;
						await this._plugin.saveSettings();
					}),
			);
	}
}
