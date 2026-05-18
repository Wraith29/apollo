export async function parseYaml<T>(content: string): Promise<T | null> {
	return import("obsidian")
		.then((obsidian) => {
			const obj = obsidian.parseYaml(content);
			if (obj as T) {
				return obj as T;
			}

			return null;
		})
		.catch(() =>
			import("bun")
				.then((bun) => {
					const obj = bun.YAML.parse(content);
					if (obj as T) {
						return obj as T;
					}

					return null;
				})
				.catch(() => null),
		);
}
