import { IFileSystem } from "@/files/filesystem";
import { getAllTags, MetadataCache } from "obsidian";

export function getAllTagsInFolder(
	cache: MetadataCache,
	fs: IFileSystem,
	root: string,
): string[] {
	const tags: string[] = [];
	const files = fs.getFilesInFolder(root);

	for (const path of files) {
		const metadata = cache.getCache(path);
		if (!metadata) {
			continue;
		}

		const fileTags = getAllTags(metadata);
		if (!fileTags) {
			continue;
		}

		tags.push(...fileTags);
	}

	return tags;
}
