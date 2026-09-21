import { IFileSystem } from "@/files/filesystem";
import type { HandleSubmitFn } from "@/types/modal";
import { joinAndNormalizePath } from "@/utils/path";
import { type App, Modal, Setting } from "obsidian";
import { ApolloSettings } from "../settings";
import { format } from "date-fns/fp";
import { parse } from "date-fns";
import { DATE_FORMAT_DMY } from "@/consts";

type DropdownOption = {
	key: string;
	value: string;
};

function filePathToOption(filepath: string): DropdownOption | null {
	const elements = filepath.split("/");
	const artistName = elements.last();

	if (!artistName) {
		return null;
	}

	return {
		key: filepath,
		value: artistName.substring(0, artistName.length - 3),
	};
}

export type GigProps = {
	date: Date;
	mainAct: string;
	supportActs: string[];
};

export class AddGigModal extends Modal {
	private _onSubmit: HandleSubmitFn<GigProps>;
	private _artistOptions: DropdownOption[];

	private _date: string = this.getCurrentDate();
	private _mainAct: string | null = null;
	private _supportActs: string[] = [];

	constructor(
		app: App,
		handleSubmit: HandleSubmitFn<GigProps>,
		cfg: ApolloSettings,
		fs: IFileSystem,
	) {
		super(app);
		this._onSubmit = handleSubmit;

		this._artistOptions = fs
			.getFilesInFolder(joinAndNormalizePath(cfg.dataRoot, "Artists"))
			.map(filePathToOption)
			.filter((opt) => opt !== null);

		this.configureLayout();
	}

	private configureLayout(): void {
		this.setTitle("Add gig");
		this.contentEl.innerHTML = ``;

		// new Setting(this.contentEl).setName("Date").addText((text) => {
		// 	text.setPlaceholder(this._date);
		// 	text.setValue(this._date);
		// 	text.onChange((val) => (this._date = val));
		// });

		// new Setting(this.contentEl).setName("Main act").addDropdown((drop) => {
		// 	this._artistOptions.forEach((opt) =>
		// 		drop.addOption(opt.key, opt.value),
		// 	);

		// 	drop.setValue("");
		// 	drop.onChange((val) => (this._mainAct = val));
		// });

		// const supportActSetting = new Setting(this.contentEl).setName(
		// 	"Support acts",
		// );

		// supportActSetting
		// 	.addDropdown((drop) => {
		// 		this._artistOptions.forEach((opt) =>
		// 			drop.addOption(opt.key, opt.value),
		// 		);
		// 	})
		// 	.addExtraButton((btn) => {
		// 		btn.setIcon("plus");
		// 		btn.onClick(() => {
		// 			supportActSetting.addDropdown((drop) => {
		// 				this._artistOptions.forEach((opt) =>
		// 					drop.addOption(opt.key, opt.value),
		// 				);
		// 			});
		// 		});
		// 	});

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(async () => {
					if (!this.isValid()) {
						console.warn({ message: "Invalid input" });
						return;
					}

					await this._onSubmit({
						date: parse(this._date, DATE_FORMAT_DMY, new Date()),
						mainAct: this._mainAct!,
						supportActs: this._supportActs,
					});

					this.close();
				}),
		);
	}

	private getCurrentDate(): string {
		const today = Date.now();

		return format(DATE_FORMAT_DMY, today);
	}

	private isValid(): boolean {
		console.info({
			message: "Checking modal validity",
			date: this._date,
			mainAct: this._mainAct,
			supportActs: this._supportActs,
		});

		if (!this._date) {
			console.warn({ message: "Date not valid" });
			return false;
		}

		if (!this._mainAct) {
			console.warn({ message: "Main Act not valid" });
			return false;
		}

		return true;
	}
}
