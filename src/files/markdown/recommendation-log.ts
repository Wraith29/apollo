import { joinAndNormalizePath } from "@/utils/path";
import type { IFileSystem } from "../filesystem";
import type { ApolloSettings } from "@/core/settings";
import type { List, Root, RootContent } from "mdast";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { formatDate, parse } from "date-fns";
import {
	buildHeading,
	buildLink,
	buildList,
	buildListItem,
	buildParagraph,
	buildText,
} from "./utils";

const DATE_FORMAT = "yyyy-MM-dd";

type Recommendation = {
	releaseName: string;
	artistName: string;
	artistPath: string;
};

export default class RecommendationLogFile {
	private _recommendations: Record<string, Recommendation[]> = {};

	private constructor(
		private readonly _filePath: string,
		private readonly _fileSystem: IFileSystem,
	) {}

	public static async fromFile(
		cfg: ApolloSettings,
		fileSystem: IFileSystem,
	): Promise<RecommendationLogFile> {
		const filePath = joinAndNormalizePath(
			cfg.dataRoot,
			"Recommendations.md",
		);
		await fileSystem.ensureFileExists(filePath);

		const inst = new RecommendationLogFile(filePath, fileSystem);
		await inst.process();

		return inst;
	}

	public addRecommendation(recommendation: Recommendation): void {
		const dateKey = formatDate(new Date(), DATE_FORMAT);

		const entries = this._recommendations[dateKey] ?? [];
		entries.push(recommendation);

		this._recommendations[dateKey] = entries;
	}

	public async save(): Promise<void> {
		const processor = unified().use(remarkStringify);
		const ast = this.buildAst();

		const content = processor.stringify(ast);

		await this._fileSystem.writeFile(this._filePath, content);
	}

	private buildAst(): Root {
		const keys = Object.keys(this._recommendations);
		keys.sort(
			(left, right) =>
				new Date(left).getTime() - new Date(right).getTime(),
		);

		return {
			type: "root",
			children: [...keys.flatMap((key) => this.buildListForDate(key))],
		};
	}

	private buildListForDate(dateKey: string): RootContent[] {
		const entries = this._recommendations[dateKey];
		if (!entries) {
			return [];
		}

		const listItems = entries.map((entry) =>
			buildListItem([
				buildParagraph([
					buildText(entry.releaseName + " - "),
					buildLink(entry.artistPath, [buildText(entry.artistName)]),
				]),
			]),
		);

		return [buildHeading(dateKey, 2), buildList(listItems)];
	}

	private async process(): Promise<void> {
		const contents = await this._fileSystem.readFile(this._filePath);
		const processor = unified().use(remarkParse);
		const ast = processor.parse(contents);

		this.processRecommendationsFromFile(ast);
	}

	private processRecommendationsFromFile(ast: Root): void {
		for (let i = 0; i < ast.children.length; i += 2) {
			if (ast.children.length < i + 1) {
				continue;
			}

			const heading = ast.children[i];
			const list = ast.children[i + 1];
			if (heading?.type !== "heading" || list?.type !== "list") {
				continue;
			}

			const headingDate = heading.children.find(
				(node) => node.type === "text",
			)?.value;
			if (!headingDate) {
				continue;
			}
			const date = parse(headingDate, DATE_FORMAT, new Date());

			const dateRecommendations = this.processRecommendationList(
				list,
				date,
			);

			this._recommendations[headingDate] = dateRecommendations;
		}
	}

	private processRecommendationList(
		list: List,
		date: Date,
	): Recommendation[] {
		const recommendations: Recommendation[] = [];

		list.children.forEach((listItem) => {
			const paragraph = listItem.children.find(
				(child) => child.type === "paragraph",
			);
			if (!paragraph) {
				return;
			}

			const text = paragraph.children.find(
				(child) => child.type === "text",
			)?.value;
			if (!text) {
				return;
			}

			const albumName = text.substring(0, text.length - 3);
			const link = paragraph.children.find(
				(child) => child.type === "link",
			);
			if (!link) {
				return;
			}

			const artistUrl = link.url;
			const artistName = link.children.find(
				(child) => child.type === "text",
			)?.value;
			if (!artistName) {
				return;
			}

			recommendations.push({
				releaseName: albumName,
				artistName: artistName,
				artistPath: artistUrl,
			});
		});

		return recommendations;
	}
}
