import { type App, Modal, Setting } from "obsidian";

export type OnSubmitFn = (_: string) => Promise<void>;

export class AddArtistModal extends Modal {
	private _input: string | undefined;
	private _onSubmit: OnSubmitFn;

	constructor(app: App, handleSubmit: OnSubmitFn) {
		super(app);
		this._onSubmit = handleSubmit;

		this.configureLayout();
	}

	private configureLayout(): void {
		this.setTitle("Add artist");

		const description = new DocumentFragment();
		const link = description.createEl("a");
		link.innerText = "Musicbrainz website";
		link.href = "https://musicbrainz.org/";

		new Setting(this.contentEl)
			.setName("Musicbrainz id")
			.setDesc(description)
			.addText((inp) => inp.onChange((val: string) => (this._input = val)));

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(async () => {
					if (this._input) {
						await this._onSubmit(this._input);

						this.close();
					}
				}),
		);
	}
}
