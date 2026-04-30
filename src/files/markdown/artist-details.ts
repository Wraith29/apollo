import { unified } from "unified";
import { ArtistDetails, ReleaseGroup } from "@/types/musicbrainz";
import { IFileSystem } from "@/files/filesystem";
import { Root, RootContent } from "mdast";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { YAML } from "bun";
import { getIndexOfHeader } from "./utils";

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

		this.processProperties(ast, artistDetails);
		this.processBody(ast, artistDetails);
	}

	private processProperties(ast: Root, artistDetails: ArtistDetails): void {
		const propertyNode = ast.children.find((node) => node.type === "yaml");
		const propertyData =
			propertyNode && propertyNode.value
				? (YAML.parse(propertyNode.value) as FileProperties)
				: null;

		let addedOn = new Date();
		if (propertyNode && propertyData && propertyData["added-on"]) {
			addedOn = new Date(propertyData["added-on"]);
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

		const primaryTypes = new Set(artistDetails["release-groups"].map(grp => grp["primary-type"]));

		primaryTypes.forEach(typ => {
			const releasesOfType = artistDetails["release-groups"].filter(grp => grp["primary-type"] === typ);

			this._releases[typ] = releasesOfType;
		});
	}
}
