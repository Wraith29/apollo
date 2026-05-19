import type { Heading, Root, RootContent } from "mdast";
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
	tags: string[];
};

function defaultProperties(): FileProperties {
	return {
		"added-on": new Date(),
		"updated-on": new Date(),
		"musicbrainz-id": null,
		"musicbrainz-url": null,
		"spotify-url": null,
		"instagram-url": null,
		tags: [],
	};
}

export default class ArtistDetailsFile {
	private _properties: FileProperties = defaultProperties();
	private _notes: string[] = [];
	private _releases: Record<string, ReleaseGroup[]> = {};

	private constructor(
		private readonly _filePath: string,
		private readonly _fileSystem: IFileSystem,
	) {}

	public static async fromDetails(
		filePath: string,
		fileSystem: IFileSystem,
		details: ArtistDetails,
	): Promise<ArtistDetailsFile> {
		await fileSystem.ensureFileExists(filePath);
		const inst = new ArtistDetailsFile(filePath, fileSystem);

		const currentData = await fileSystem.readFile(filePath);
		const processor = unified().use(remarkParse).use(remarkFrontmatter);
		const ast = processor.parse(currentData);

		await inst.processPropertiesFromDetails(details);
		inst.processNotes(ast);
		inst.processReleasesFromDetails(details);

		return inst;
	}

	public static async fromFile(
		filePath: string,
		fileSystem: IFileSystem,
	): Promise<ArtistDetailsFile> {
		const inst = new ArtistDetailsFile(filePath, fileSystem);
		await inst.processPropertiesFromFile();

		const currentData = await fileSystem.readFile(filePath);
		const processor = unified().use(remarkParse).use(remarkFrontmatter);
		const ast = processor.parse(currentData);

		inst.processNotes(ast);
		inst.processReleasesFromFile(ast);

		return inst;
	}

	public async save(): Promise<void> {
		await this._fileSystem.ensureFileExists(this._filePath);

		const processor = unified().use(remarkStringify);
		const ast = this.buildAst();

		const content = processor.stringify(ast);

		await this._fileSystem.writeFile(this._filePath, content);

		// This needs to be done at the end, so that the other bits of content (Notes, music details) are already present;
		await this._fileSystem.processProperties(
			this._filePath,
			this._properties,
		);
	}

	private buildAst(): Root {
		return {
			type: "root",
			children: [...this.buildNotesNodes(), ...this.buildMusicNodes()],
		};
	}

	private buildNotesNodes(): RootContent[] {
		const paragraphs = this._notes.map((note) =>
			buildParagraph([buildText(note)]),
		);

		return [buildHeading("Notes", 2), ...paragraphs];
	}

	private buildMusicNodes(): RootContent[] {
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
								buildParagraph([
									buildText(`Secondary Types: ${joined}`),
								]),
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

	private async processPropertiesFromFile(): Promise<void> {
		const properties =
			await this._fileSystem.parseProperties<FileProperties>(
				this._filePath,
			);

		if (properties) {
			this._properties = properties;
		}
	}

	// This will set the properties from the source of truth (Musicbrainz)
	// However, the `added-date` and `tags` are retained from the current data,
	// as these are user-set and personal
	private async processPropertiesFromDetails(
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

		let tags: string[] = [];
		if (existingProperties) {
			tags = existingProperties.tags;
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
			tags: tags,
		};
	}

	private processNotes(ast: Root): void {
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
	}

	private processReleasesFromDetails(artistDetails: ArtistDetails): void {
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

	private processReleasesFromFile(ast: Root): void {
		const musicNodeIndex = getIndexOfHeader(ast, "Music");
		if (musicNodeIndex < 0) {
			return;
		}

		const nodesBelowMusicHeader = ast.children.slice(musicNodeIndex + 1);

		const releaseTypeNames = nodesBelowMusicHeader
			.filter((node) => node.type === "heading" && node.depth === 3)
			.map((node) => node as Heading)
			.filter((node) =>
				node.children.find((child) => child.type === "text"),
			)
			.map((node) => {
				const textNode = node.children.find(
					(child) => child.type === "text",
				);
				if (!textNode) {
					return null;
				}

				return textNode.value;
			})
			.filter((name) => name !== null);

		console.error({ releaseTypeNames });
	}
}
