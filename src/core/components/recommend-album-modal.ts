import { IFileSystem } from "@/files/filesystem";
import { App, Modal, Setting } from "obsidian";
import { ApolloSettings } from "@/core/settings";
import { getAllTagsInFolder } from "@/utils/tags";
import { joinAndNormalizePath } from "@/utils/path";
import { ExtendedMetadataCacheAPI } from "obsidian-extended-metadatacache";

export class RecommendAlbumModal extends Modal {
	private readonly _cfg: ApolloSettings;
	private readonly _fileSystem: IFileSystem;
	private readonly _cache: ExtendedMetadataCacheAPI;
	private readonly _tags: string[];
	private _selectedTag: string = "";

	constructor(
		app: App,
		cfg: ApolloSettings,
		fs: IFileSystem,
		cache: ExtendedMetadataCacheAPI,
	) {
		super(app);
		this._cfg = cfg;
		this._fileSystem = fs;
		this._cache = cache;

		const allTags = getAllTagsInFolder(
			app.metadataCache,
			fs,
			joinAndNormalizePath(cfg.dataRoot, "Artists"),
		);

		this._tags = allTags.map((tag) => tag.slice(1));

		this.configureLayout();
	}

	private configureLayout(): void {
		this.setTitle("Album recommendation");

		new Setting(this.contentEl)
			.setName("Filter by tag:")
			.addDropdown((drop) => {
				drop.addOption("", "No filter");

				this._tags.forEach((tag) => {
					drop.addOption(tag, tag);
				});

				drop.onChange((value) => {
					this._selectedTag = value;
				});
			});

		new Setting(this.contentEl).addButton((btn) =>
			btn.setButtonText("Get recommendation").onClick(() => {
				this.getRecommendation();
			}),
		);
	}

	private getRecommendation(): void {}

	private getValidFiles(): string[] {
		const artistRoot = joinAndNormalizePath(this._cfg.dataRoot, "Artists");

		if (this._selectedTag === "") {
			return this._fileSystem.getFilesInFolder(artistRoot);
		}

		const filesWithTag = this._cache.getFilesWithTag(this._selectedTag);
	}
}
