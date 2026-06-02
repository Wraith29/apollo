import { App, Plugin, PluginManifest } from "obsidian";
import { HttpClient, type IHttpClient } from "@/clients/http";
import { IMusicbrainzClient, MusicbrainzClient } from "@/clients/musicbrainz";
import { addArtist } from "@/core/commands/add-artist";
import { FileSystem, type IFileSystem } from "@/files/filesystem";
import {
	type ApolloSettings,
	ApolloSettingsTab,
	DEFAULT_SETTINGS,
} from "./settings";
import { updateArtists } from "./commands/update-artists";
import { recommendAlbum } from "./commands/recommend-album";
import {
	ExtendedMetadataCacheHandle,
	getAPI,
} from "obsidian-extended-metadatacache";

export default class ApolloPlugin extends Plugin {
	private _settings: ApolloSettings;
	private readonly _fileSystem: IFileSystem;
	private readonly _httpClient: IHttpClient;
	private readonly _musicbrainzClient: IMusicbrainzClient;
	private _extendedCache: ExtendedMetadataCacheHandle | null = null;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);

		this._settings = DEFAULT_SETTINGS;
		this._fileSystem = new FileSystem(
			this.app.vault,
			this.app.fileManager,
			this.app.workspace,
		);

		this._httpClient = new HttpClient();
		this._musicbrainzClient = new MusicbrainzClient(this._httpClient);
	}

	public async onload(): Promise<void> {
		this._extendedCache = getAPI(this.app);

		await this.loadSettings();

		this.addCommand({
			id: "add-artist",
			name: "Add artist",
			callback: async () => {
				await addArtist(
					this.app,
					this._settings,
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
					this._settings,
					this._fileSystem,
					this._musicbrainzClient,
				);
			},
		});

		this.addCommand({
			id: "recommend-album",
			name: "Recommend album",
			callback: () => {
				recommendAlbum(this.app, this._settings, this._fileSystem);
			},
		});

		this.addSettingTab(
			new ApolloSettingsTab(this.app, this, this._fileSystem),
		);
	}

	public onunload(): void {
		this._extendedCache?.release();
	}

	private async loadSettings(): Promise<void> {
		const loaded = (await this.loadData()) as Partial<ApolloSettings>;
		this._settings = Object.assign({}, DEFAULT_SETTINGS, loaded);
	}

	async saveSettings() {
		await this.saveData(this._settings);
	}
}
