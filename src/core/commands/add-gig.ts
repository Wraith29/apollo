import type { App } from "obsidian";
import type { ApolloSettings } from "../settings";
import type { IFileSystem } from "@/files/filesystem";
import { joinAndNormalizePath } from "@/utils/path";
import { AddGigModal, type GigProps } from "../components/add-gig-modal";
import type { HandleSubmitFn } from "@/types/modal";
import GigFile from "@/files/markdown/gig";
import { format } from "date-fns";
import { DATE_FORMAT_YMD } from "@/consts";

export async function addGig(
	app: App,
	cfg: ApolloSettings,
	fs: IFileSystem,
): Promise<void> {
	const gigsRoot = joinAndNormalizePath(cfg.dataRoot, "Gigs");
	await fs.ensureFolderExists(gigsRoot);

	const venuesRoot = joinAndNormalizePath(cfg.dataRoot, "Venues");
	await fs.ensureFolderExists(venuesRoot);

	const modal = new AddGigModal(app, createAddGigHandler(cfg, fs), cfg, fs);

	modal.open();
}

function createAddGigHandler(
	cfg: ApolloSettings,
	fs: IFileSystem,
): HandleSubmitFn<GigProps> {
	return async (details: GigProps) => {
		const gigFilePath = joinAndNormalizePath(
			cfg.dataRoot,
			"Gigs",
			`${format(details.date, DATE_FORMAT_YMD)}.md`,
		);

		const gigFile = await GigFile.fromDetails(gigFilePath, fs, details);
		await gigFile.save();

		await fs.openFile(gigFilePath);
	};
}
