import { type App, PluginSettingTab, Setting } from "obsidian";
import type { IFileSystem } from "@/files/filesystem";
import type ApolloPlugin from "./plugin";

export type ApolloSettings = {
	dataRoot: string;
	defaultSupportActCount: number;
};

export const DEFAULT_SETTINGS: ApolloSettings = {
	dataRoot: "Music",
	defaultSupportActCount: 2,
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
			.setName("Default number of supports.")
			.setDesc(
				"When creating a new gig, how many support acts are added by default",
			)
			.addSlider((slider) => {
				slider.setLimits(0, 10, 1);
				slider.setValue(2);
				slider.onChange(async (value: number) => {
					this._plugin.settings.defaultSupportActCount = value;
					await this._plugin.saveSettings();
				});
			});
	}
}
