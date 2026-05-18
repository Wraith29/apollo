import type { Root, RootContent } from "mdast";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { IFileSystem } from "@/files/filesystem";
import type { ArtistDetails, ReleaseGroup } from "@/types/musicbrainz";
import {
	buildHeading,
	buildLink,
	buildList,
	buildListItem,
	buildParagraph,
	buildText,
	getIndexOfHeader,
} from "./utils";
import remarkStringify from "remark-stringify";

export type FileProperties = {
	"added-on": Date | string | null;
	"updated-on": Date | string | null;
	"musicbrainz-id": string | null;
	"musicbrainz-url": string | null;
	"spotify-url": string | null;
	"instagram-url": string | null;
};

function defaultProperties(): FileProperties {
	return {
		"added-on": new Date(),
		"updated-on": new Date(),
		"musicbrainz-id": null,
		"musicbrainz-url": null,
		"spotify-url": null,
		"instagram-url": null,
	};
}

export default class ArtistDetailsFile {
	private readonly _filePath: string;
	private readonly _fileSystem: IFileSystem;

	private _properties: FileProperties = defaultProperties();
	private _notes: string[] = [];
	private _releases: Record<string, ReleaseGroup[]> = {};

	constructor(filePath: string, fileSystem: IFileSystem) {
		this._filePath = filePath;
		this._fileSystem = fileSystem;
	}

	public getProperties(): FileProperties {
		return this._properties;
	}

	public getNotes(): string[] {
		return this._notes;
	}

	public getReleases(): Record<string, ReleaseGroup[]> {
		return this._releases;
	}

	public async process(artistDetails: ArtistDetails): Promise<void> {
		const currentData = await this._fileSystem.readFile(this._filePath);
		const processor = unified().use(remarkParse).use(remarkFrontmatter);
		const ast = processor.parse(currentData);

		await this.processProperties(artistDetails);
		this.processBody(ast, artistDetails);
	}

	public save(): void {
		this._fileSystem.ensureFileExists(this._filePath);

		const processor = unified().use(remarkStringify);
		const ast = this.buildTree();

		const content = processor.stringify(ast);

		this._fileSystem.writeFile(this._filePath, content);

		// This needs to be done at the end, so that the other bits of content (Notes, music details) are already present;
		this._fileSystem.processProperties(this._filePath, this._properties);
	}

	private buildTree(): Root {
		return {
			type: "root",
			children: [...this.buildNotesNode(), ...this.buildMusicNode()],
		};
	}

	private buildNotesNode(): RootContent[] {
		const paragraphs = this._notes.map((note) =>
			buildParagraph([buildText(note)]),
		);
		return [buildHeading("Notes", 2), ...paragraphs];
	}

	private buildMusicNode(): RootContent[] {
		const releaseTypeNodes = [];

		for (const [releaseType, values] of Object.entries(this._releases)) {
			const releasesList = buildList(
				values.map((release) => {
					const link = `https://musicbrainz.org/release-group/${release.id}`;
					const firstRelease = new Date(
						release["first-release-date"],
					);

					const detailsNodes = [
						buildListItem([
							buildParagraph([
								buildText(
									`Release Date: ${firstRelease.toLocaleDateString()}`,
								),
							]),
						]),
						buildListItem([
							buildParagraph([
								buildText(
									`Primary Type: ${release["primary-type"]}`,
								),
							]),
						]),
					];

					if (release["secondary-types"].length > 0) {
						const joined = release["secondary-types"].join(", ");
						detailsNodes.push(
							buildListItem([
								buildParagraph([buildText(joined)]),
							]),
						);
					}

					return buildListItem([
						buildParagraph([
							buildLink(link, [buildText(release.title)]),
						]),
						buildList(detailsNodes),
					]);
				}),
			);

			releaseTypeNodes.push(
				buildHeading(`${releaseType}s`, 3),
				releasesList,
			);
		}

		return [buildHeading("Music", 2), ...releaseTypeNodes];
	}

	private async processProperties(
		artistDetails: ArtistDetails,
	): Promise<void> {
		const existingProperties =
			await this._fileSystem.parseProperties<FileProperties>(
				this._filePath,
			);

		let addedOn = new Date();
		if (existingProperties && existingProperties["added-on"]) {
			addedOn = new Date(existingProperties["added-on"]);
		}

		const spotifyUrl =
			artistDetails.relations
				.filter((rel) => rel.type === "free streaming")
				.find((rel) =>
					rel.url.resource.startsWith("https://open.spotify.com"),
				)?.url.resource ?? null;

		const instagramUrl =
			artistDetails.relations
				.filter((rel) => rel.type === "social network")
				.find((rel) =>
					rel.url.resource.startsWith("https://www.instagram.com"),
				)?.url.resource ?? null;

		this._properties = {
			"added-on": addedOn,
			"updated-on": new Date(),
			"musicbrainz-id": artistDetails.id,
			"musicbrainz-url": `https://musicbrainz.org/artist/${artistDetails.id}`,
			"spotify-url": spotifyUrl,
			"instagram-url": instagramUrl,
		};
	}

	private processBody(ast: Root, artistDetails: ArtistDetails): void {
		const notesNode = getIndexOfHeader(ast, "Notes");
		const musicNode = getIndexOfHeader(ast, "Music");

		let notesSrc: RootContent[] = [];
		if (notesNode >= 0 && musicNode < 0) {
			notesSrc = ast.children.slice(notesNode + 1);
		} else if (notesNode >= 0 && musicNode >= 0) {
			notesSrc = ast.children.slice(notesNode + 1, musicNode);
		}

		const paragraphs = notesSrc.filter((node) => node.type === "paragraph");
		this._notes = paragraphs.flatMap((para) =>
			para.children
				.filter((node) => node.type === "text")
				.map((node) => node.value),
		);

		const primaryTypes = new Set(
			artistDetails["release-groups"].map((grp) => grp["primary-type"]),
		);

		primaryTypes.forEach((typ) => {
			const releasesOfType = artistDetails["release-groups"].filter(
				(grp) => grp["primary-type"] === typ,
			);

			this._releases[typ] = releasesOfType;
		});
	}
}
