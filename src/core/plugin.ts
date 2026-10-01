import { type App, Plugin, type PluginManifest } from "obsidian";
import { HttpClient, type IHttpClient } from "@/clients/http";
import {
	type IMusicbrainzClient,
	MusicbrainzClient,
} from "@/clients/musicbrainz";
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
	type ExtendedMetadataCacheHandle,
	getAPI,
} from "obsidian-extended-metadatacache";
import { addGig } from "./commands/add-gig";
import ArtistCache from "./artist-cache";

export default class ApolloPlugin extends Plugin {
	public settings: ApolloSettings;
	private readonly _fileSystem: IFileSystem;
	private readonly _httpClient: IHttpClient;
	private readonly _musicbrainzClient: IMusicbrainzClient;
	private readonly _extendedCache: ExtendedMetadataCacheHandle;
	private readonly _artistCache: ArtistCache;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);

		this.settings = DEFAULT_SETTINGS;
		this._fileSystem = new FileSystem(
			this.app.vault,
			this.app.fileManager,
			this.app.workspace,
		);

		this._httpClient = new HttpClient();
		this._musicbrainzClient = new MusicbrainzClient(this._httpClient);
		this._extendedCache = getAPI(this.app);
		this._artistCache = new ArtistCache(this.app.vault, this.settings, this._fileSystem);
	}

	public async onload(): Promise<void> {
		await this.loadSettings();
		this._artistCache.register(this);

		this.addCommand({
			id: "add-artist",
			name: "Add artist",
			callback: async () => {
				await addArtist(
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
			callback: () => {
				recommendAlbum(
					this.app,
					this.settings,
					this._fileSystem,
					this._artistCache,
				);
			},
		});

		this.addCommand({
			id: "add-gig",
			name: "Add gig",
			callback: async () => {
				await addGig(this.app, this.settings, this._fileSystem);
			},
		});

		this.addSettingTab(
			new ApolloSettingsTab(this.app, this, this._fileSystem),
		);
	}

	public onunload(): void {
		this._extendedCache.release();
	}

	private async loadSettings(): Promise<void> {
		const loaded = (await this.loadData()) as Partial<ApolloSettings>;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
