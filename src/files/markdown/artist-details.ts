import { unified } from "unified";
import { ArtistDetails, ReleaseGroup } from "../../types/musicbrainz";
import { IFileSystem } from "../filesystem";
import { Root } from "mdast";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { YAML } from "bun";

class FileProperties {
    "added-on": Date | null = new Date();
    "updated-on": Date | null = new Date();
    "musicbrainz-id": string | null = null;
    "musicbrainz-url": string | null = null;
    "spotify-url": string | null = null;
    "instagram-url": string | null = null;
    "tags": string[] = [];
}

export default class ArtistDetailsFile {
    private readonly _filePath: string;
    private readonly _fileSystem: IFileSystem;

    private _properties: FileProperties = new FileProperties();
    private _notes: string | null = null;
    private _releases: Record<string, ReleaseGroup[]>[] = [];

    constructor(filePath: string, fileSystem: IFileSystem) {
        this._filePath = filePath;
        this._fileSystem = fileSystem;
    }

    public async process(artistDetails: ArtistDetails): Promise<void> {
        const currentData = await this._fileSystem.readFile(this._filePath);
        const processor = unified().use(remarkParse).use(remarkFrontmatter);
        const ast = processor.parse(currentData);

        this.processProperties(ast, artistDetails);
    }

    private processProperties(ast: Root, artistDetails: ArtistDetails): void { 
        const propertyNode = ast.children.find(node => node.type === "yaml");
        if (!propertyNode) {
            return;
        }

        const propertyData = YAML.parse(propertyNode.value) as FileProperties;
        this._properties = this._properties || propertyData;
    }

    private processBody(ast: Root, artistDetails: ArtistDetails): void { }
}
