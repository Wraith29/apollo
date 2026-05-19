import { Plugin } from "obsidian";
import { HttpClient, type IHttpClient } from "@/clients/http";
import { MusicbrainzClient } from "@/clients/musicbrainz";
import { addArtist } from "@/core/commands/add-artist";
import { FileSystem, type IFileSystem } from "@/files/filesystem";
import {
	type ApolloSettings,
	ApolloSettingsTab,
	DEFAULT_SETTINGS,
} from "./settings";
import { updateArtists } from "./commands/update-artists";
import { recommendAlbum } from "./commands/recommend-album";

export default class ApolloPlugin extends Plugin {
	public settings: ApolloSettings = DEFAULT_SETTINGS;
	private readonly _fileSystem: IFileSystem = new FileSystem(
		this.app.vault,
		this.app.fileManager,
		this.app.workspace,
	);
	private readonly _httpClient: IHttpClient = new HttpClient();
	private readonly _musicbrainzClient = new MusicbrainzClient(
		this._httpClient,
	);

	public async onload(): Promise<void> {
		await this.loadSettings();

		this.addCommand({
			id: "add-artist",
			name: "Add artist",
			callback: () => {
				addArtist(
					this.app,
					this.settings,
					this._fileSystem,
					this._musicbrainzClient,
				);
			},
		});

		this.addCommand({
			id: "update-artists",
			name: "Update artists",
			callback: async () => {
				await updateArtists(
					this.settings,
					this._fileSystem,
					this._musicbrainzClient,
				);
			},
		});

		this.addCommand({
			id: "recommend-album",
			name: "Recommend album",
			callback: async () => {
				await recommendAlbum(this.settings, this._fileSystem);
			},
		});

		this.addSettingTab(
			new ApolloSettingsTab(this.app, this, this._fileSystem),
		);
	}

	private async loadSettings(): Promise<void> {
		const loaded = (await this.loadData()) as Partial<ApolloSettings>;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
