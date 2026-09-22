import type { IFileSystem } from "@/files/filesystem";
import type { HandleSubmitFn } from "@/types/modal";
import { joinAndNormalizePath } from "@/utils/path";
import { type App, Modal, Setting, SettingGroup } from "obsidian";
import type { ApolloSettings } from "../settings";
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
	venue: string;
	mainAct: string;
	supportActs: string[];
};

export class AddGigModal extends Modal {
	private _onSubmit: HandleSubmitFn<GigProps>;
	private _artistOptions: DropdownOption[];
	private _venueOptions: DropdownOption[];

	private _date: string = this.getCurrentDate();
	private _venue: string | null = null;
	private _mainAct: string | null = null;

	private _supportActCount: number;
	private _supportActEl: HTMLDivElement | null = null;
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

		this._venueOptions = fs
			.getFilesInFolder(joinAndNormalizePath(cfg.dataRoot, "Venues"))
			.map(filePathToOption)
			.filter((opt) => opt !== null);

		this._supportActCount = cfg.defaultSupportActCount;

		this.configureLayout();
	}

	private configureLayout(): void {
		this.setTitle("Add gig");

		new Setting(this.contentEl)
			.setName("Date")
			.setDesc("When was the gig?")
			.addText((text) => {
				text.setPlaceholder(this._date);
				text.setValue(this._date);
				text.onChange((val) => (this._date = val));
			});

		new Setting(this.contentEl)
			.setName("Venue")
			.setDesc("Where was the gig?")
			.addDropdown((drop) => {
				this._venueOptions.forEach((opt) =>
					drop.addOption(opt.key, opt.value),
				);

				drop.setValue("");
				drop.onChange((val) => (this._venue = val));
			});

		new Setting(this.contentEl)
			.setName("Main act")
			.setDesc("Who was the headliner?")
			.addDropdown((drop) => {
				this._artistOptions.forEach((opt) =>
					drop.addOption(opt.key, opt.value),
				);

				drop.setValue("");
				drop.onChange((val) => (this._mainAct = val));
			});

		this._supportActEl = this.contentEl.createDiv("support-acts");
		this.updateSupportActGroup();

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
						venue: this._venue!,
						mainAct: this._mainAct!,
						supportActs: this._supportActs,
					});

					this.close();
				}),
		);
	}

	private updateSupportActGroup(): void {
		if (!this._supportActEl) {
			console.error({ message: "Support act element should exist" });
			return;
		}

		// Empty the current group
		this._supportActEl.empty();

		const group = new SettingGroup(this._supportActEl).setHeading(
			"Support acts",
		);

		group.addSetting((setting) => {
			setting
				.setName("Number of supports")
				.setDesc("Changing this will reset your current support acts")
				.addSlider((slider) => {
					slider.setLimits(0, 10, 1);
					slider.setValue(this._supportActCount);

					slider.onChange((val) => {
						this._supportActCount = val;
						this.updateSupportActGroup();
					});
				});
		});

		this._supportActs = new Array(this._supportActCount);

		for (let i = 0; i < this._supportActCount; i++) {
			group.addSetting((setting) => {
				setting.setName(`Support act ${i + 1}`).addDropdown((drop) => {
					this._artistOptions.forEach((opt) =>
						drop.addOption(opt.key, opt.value),
					);

					drop.setValue("");
					drop.onChange((act) => {
						this._supportActs[i] = act;
					});
				});
			});
		}
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

		if (!this._supportActs?.every((sup) => sup !== "")) {
			return false;
		}

		return true;
	}
}
