import type { App } from "obsidian";
import type { ApolloSettings } from "../settings";
import type { IFileSystem } from "@/files/filesystem";
import { joinAndNormalizePath } from "@/utils/path";
import { AddGigModal, type GigProps } from "../components/add-gig-modal";
import type { HandleSubmitFn } from "@/types/modal";

export async function addGig(
	app: App,
	cfg: ApolloSettings,
	fs: IFileSystem,
): Promise<void> {
	const gigsRoot = joinAndNormalizePath(cfg.dataRoot, "Gigs");
	await fs.ensureFolderExists(gigsRoot);

	const venuesRoot = joinAndNormalizePath(cfg.dataRoot, "Venues");
	await fs.ensureFolderExists(venuesRoot);

	const modal = new AddGigModal(app, createAddGigHandler(), cfg, fs);

	modal.open();
}

function createAddGigHandler(): HandleSubmitFn<GigProps> {
	return async ({ date, venue, mainAct, supportActs }: GigProps) => {
		console.log({
			message: "Handling Gig submit",
			date,
			venue,
			mainAct,
			supportActs,
		});
	};
}
