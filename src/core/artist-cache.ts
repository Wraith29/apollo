import { Plugin, TAbstractFile, Vault } from "obsidian";
import { ApolloSettings } from "./settings";
import { joinAndNormalizePath } from "@/utils/path";
import ArtistDetailsFile from "@/files/markdown/artist-details";
import { IFileSystem } from "@/files/filesystem";

type SearchableData = {
	tags: string[];
	albums: string[];
};

export default class ArtistCache {
	private _tags: Set<string> = new Set<string>();
	private _artistMap: Record<string, SearchableData> = {};

	public constructor(
		private readonly _vault: Vault,
		private readonly _config: ApolloSettings,
		private readonly _fileSystem: IFileSystem,
	) { }

	public register(plugin: Plugin): void {
		plugin.registerEvent(
			this._vault.on("modify", async file => await this.refreshArtistData(file))
		);

		plugin.registerEvent(
			this._vault.on("create", async file => await this.refreshArtistData(file))
		)

		plugin.registerEvent(
			this._vault.on("delete", async file => await this.removeArtistData(file))
		)
	}

	public get allTags(): string[] {
		return [...this._tags];
	}

	public getArtistsWithTag(tag: string): string[] {
		const filtered = Object.entries(this._artistMap)
			.filter(([_, value]) => value.tags.contains(tag))
			.map(([key, _]) => key);

		return filtered;
	}

	private async refreshArtistData(file: TAbstractFile): Promise<void> {
		if (!this.isArtistFile(file.path)) {
			return;
		}

		const details = await ArtistDetailsFile.fromFile(file.path, this._fileSystem);

		this._artistMap[file.path] = {
			tags: details.tags ?? [],
			albums: details.albums.map(grp => grp.title) ?? []
		};

		(details.tags ?? []).forEach(tag => this._tags.add(tag));
	}

	private async removeArtistData(file: TAbstractFile): Promise<void> {
		if (!this.isArtistFile(file.path)) {
			return;
		}

		delete this._artistMap[file.path];

		this._tags.clear();
		Object.values(this._artistMap)
			.forEach(data =>
				data.tags.forEach(tag => this._tags.add(tag))
			);
	}

	private isArtistFile(path: string): boolean {
		const root = joinAndNormalizePath(this._config.dataRoot, "Artists");
		return path.startsWith(root) && path !== root;
	}
}
