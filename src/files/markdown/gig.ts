import type { GigProps } from "@/core/components/add-gig-modal";
import type { IFileSystem } from "../filesystem";
import { unified } from "unified";
import remarkParse from "remark-parse";
import {
	buildHeading,
	buildParagraph,
	buildText,
	getIndexOfHeader,
} from "./utils";
import type { Root, RootContent } from "mdast";
import remarkStringify from "remark-stringify";

export type FileProperties = {
	"main-act": string;
	"support-acts": string[];
	venue: string;
};

function defaultProperties(): FileProperties {
	return {
		"main-act": "",
		"support-acts": [],
		venue: "",
	};
}

export default class GigFile {
	private _properties: FileProperties = defaultProperties();
	private _notes: string[] = [];

	private constructor(
		private readonly _filePath: string,
		private readonly _fileSystem: IFileSystem,
	) {}

	public static async fromDetails(
		filePath: string,
		fileSystem: IFileSystem,
		details: GigProps,
	): Promise<GigFile> {
		await fileSystem.ensureFileExists(filePath);
		const inst = new GigFile(filePath, fileSystem);

		const currentData = await fileSystem.readFile(filePath);
		const processor = unified().use(remarkParse);
		const ast = processor.parse(currentData);

		inst.processProperties(details);
		inst.processNotes(ast);

		return inst;
	}

	public async save(): Promise<void> {
		await this._fileSystem.ensureFileExists(this._filePath);

		const processor = unified().use(remarkStringify);
		const ast = this.buildAst();

		const content = processor.stringify(ast);

		const venueLink = this._fileSystem.getFileLinkText(
			this._properties.venue,
			this._filePath,
		);

		const mainActLink = this._fileSystem.getFileLinkText(
			this._properties["main-act"],
			this._filePath,
		);

		const supportActLinks = this._properties["support-acts"].map((act) =>
			this._fileSystem.getFileLinkText(act, this._filePath),
		);

		await this._fileSystem.writeFile(this._filePath, content);
		await this._fileSystem.processProperties(this._filePath, {
			"main-act": mainActLink,
			"support-acts": supportActLinks,
			venue: venueLink,
		});
	}

	private buildAst(): Root {
		return {
			type: "root",
			children: [...this.buildNotesNode(), ...this.buildSetlistNode()],
		};
	}

	private buildNotesNode(): RootContent[] {
		const paragraphs = this._notes.map((note) =>
			buildParagraph([buildText(note)]),
		);

		return [buildHeading("Notes", 2), ...paragraphs];
	}

	// This exists so that it's nicer for future
	private buildSetlistNode(): RootContent[] {
		return [buildHeading("Setlist", 2)];
	}

	private processProperties(details: GigProps): void {
		this._properties = {
			"main-act": details.mainAct,
			"support-acts": details.supportActs,
			venue: details.venue,
		};
	}

	private processNotes(ast: Root): void {
		const notesNode = getIndexOfHeader(ast, "Notes");
		const setlistNode = getIndexOfHeader(ast, "Setlist");

		let notesSrc: RootContent[] = [];
		if (notesNode >= 0 && setlistNode < 0) {
			notesSrc = ast.children.slice(notesNode + 1);
		} else if (notesNode >= 0 && setlistNode >= 0) {
			notesSrc = ast.children.slice(notesNode + 1, setlistNode);
		}

		const paragraphs = notesSrc.filter((node) => node.type === "paragraph");
		this._notes = paragraphs.flatMap((para) =>
			para.children
				.filter((node) => node.type === "text")
				.map((node) => node.value),
		);
	}
}
