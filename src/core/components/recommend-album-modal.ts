import { IFileSystem } from "@/files/filesystem";
import { App, Modal } from "obsidian";
import { ApolloSettings } from "@/core/settings";
import { getAllTagsInFolder } from "@/utils/tags";
import { joinAndNormalizePath } from "@/utils/path";

export class RecommendAlbumModal extends Modal {
	private readonly _tags: string[];

	constructor(app: App, cfg: ApolloSettings, fs: IFileSystem) {
		super(app);

		this.setTitle("Album Recommendation");

		const allTags = getAllTagsInFolder(
			app.metadataCache,
			fs,
			joinAndNormalizePath(cfg.dataRoot, "Artists"),
		);

		this._tags = allTags;

		this.configureLayout();
	}

	private configureLayout(): void {}
}
