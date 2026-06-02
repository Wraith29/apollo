import { IFileSystem } from "@/files/filesystem";
import {
	App,
	ButtonComponent,
	Modal,
	Notice,
	Platform,
	Setting,
} from "obsidian";
import { ApolloSettings } from "@/core/settings";
import { getAllTagsInFolder } from "@/utils/tags";
import { joinAndNormalizePath } from "@/utils/path";
import { ExtendedMetadataCacheAPI } from "obsidian-extended-metadatacache";
import { ReleaseGroup } from "@/types/musicbrainz";
import ArtistDetailsFile from "@/files/markdown/artist-details";

export class RecommendAlbumModal extends Modal {
	private readonly _cfg: ApolloSettings;
	private readonly _fileSystem: IFileSystem;
	private readonly _cache: ExtendedMetadataCacheAPI;
	private readonly _tags: string[];
	private _recommendationEl: HTMLDivElement | undefined;
	private _selectedTag: string = "";
	private _releaseArtist: string = "";
	private _releaseGroup: ReleaseGroup | null = null;
	private _saveRecommendationButton: ButtonComponent | null = null;

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

		this._tags = [...new Set(allTags.map((tag) => tag.slice(1)))];

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

		this._recommendationEl = this.contentEl.createDiv(
			"recommendation-view",
		);

		const footerEl = this.contentEl.createDiv("footer");

		new Setting(footerEl)
			.addButton((btn) => {
				this._saveRecommendationButton = btn;

				this._saveRecommendationButton
					.setButtonText("Save to recommendation log")
					.setClass("save-rec-btn")
					.setDisabled(true)
					.onClick(async () => {
						await this.saveRecommendationToLog();
					});

				return this._saveRecommendationButton;
			})
			.addButton((btn) =>
				btn.setButtonText("Get recommendation").onClick(async () => {
					await this.getRecommendation();
				}),
			);
	}

	private updateRecommendationView(): void {
		if (!this._recommendationEl) {
			console.error({ message: "Recommendation element not found." });
			return;
		}
		if (!this._releaseGroup) {
			console.error({ message: "Recommended releaseg roup not found." });
			return;
		}

		this._saveRecommendationButton?.setDisabled(false);

		if (Platform.isMobile) {
			this._recommendationEl.innerText = "Haha mobile loser.\nFuck you";
			return;
		}

		this._recommendationEl.empty();

		const imgEl = this._recommendationEl.createEl("img", "cover-art");
		imgEl.src = `http://coverartarchive.org/release-group/${this._releaseGroup.id}/front`;
		imgEl.alt = `Cover art for "${this._releaseGroup.title}" by ${this._releaseArtist}`;

		const detailsEl = this._recommendationEl.createDiv("details");
		const artistNameEl = detailsEl.createEl("p", "artist-name");
		artistNameEl.innerText = this._releaseArtist;

		const albumNameEl = detailsEl.createEl("p", "album-name");
		albumNameEl.innerText = this._releaseGroup.title;

		const albumLinkEl = detailsEl.createEl("a", "album-link");
		albumLinkEl.href = `https://musicbrainz.org/release-group/${this._releaseGroup.id}`;
	}

	private async getRecommendation(): Promise<void> {
		const availableFiles = this.getValidFiles();
		const shuffled = availableFiles.shuffle();

		let index = 0;
		let releaseGroup: ReleaseGroup | null = null;
		do {
			const artist = shuffled[index];
			if (!artist) {
				continue;
			}
			const details = await ArtistDetailsFile.fromFile(
				artist,
				this._fileSystem,
			);

			const albums = details.getReleaseGroupsOfType("Album");
			if (albums.length === 0) {
				continue;
			}

			const shuffledAlbums = albums.shuffle();
			const selectedAlbum = shuffledAlbums.find((alb) => alb);
			if (!selectedAlbum) {
				continue;
			}
			releaseGroup = selectedAlbum;
			this._releaseArtist = this.getArtistNameFromFilePath(artist);

			index++;
		} while (releaseGroup === null && index < shuffled.length);

		if (releaseGroup === null) {
			new Notice(
				"Failed to find any albums.\nPlease update your filters and try again.",
			);
		}

		this._releaseGroup = releaseGroup;

		this.updateRecommendationView();
	}

	private getValidFiles(): string[] {
		const artistRoot = joinAndNormalizePath(this._cfg.dataRoot, "Artists");

		if (this._selectedTag === "") {
			return this._fileSystem.getFilesInFolder(artistRoot);
		}

		const filesWithTag = this._cache.getFilesWithTag(this._selectedTag);

		return [...filesWithTag];
	}

	private async saveRecommendationToLog(): Promise<void> {}

	private getArtistNameFromFilePath(filePath: string): string {
		const nameWithExt = filePath.split("/").last()!;
		return nameWithExt.substring(0, nameWithExt.indexOf("."));
	}
}
