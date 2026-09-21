import type { App } from "obsidian";
import type { ApolloSettings } from "../settings";
import type { IFileSystem } from "@/files/filesystem";
import { joinAndNormalizePath } from "@/utils/path";
import { AddGigModal, GigProps } from "../components/add-gig-modal";
import { HandleSubmitFn } from "@/types/modal";

export async function addGig(
	app: App,
	cfg: ApolloSettings,
	fs: IFileSystem,
): Promise<void> {
	const gigsRoot = joinAndNormalizePath(cfg.dataRoot, "Gigs");
	await fs.ensureFolderExists(gigsRoot);

	const modal = new AddGigModal(app, createAddGigHandler(), cfg, fs);

	modal.open();
}

function createAddGigHandler(): HandleSubmitFn<GigProps> {
	return async ({ date, mainAct, supportActs }: GigProps) => {
		console.log({
			message: "Handling Gig submit",
			date,
			mainAct,
			supportActs,
		});
	};
}
