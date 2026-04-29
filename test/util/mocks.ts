import { IFileSystem } from "@/files/filesystem";
import { mock } from "bun:test";

export function buildFsMock({
	readFile = "",
}: {
	readFile?: string;
} = {}): IFileSystem {
	return {
		readFile: mock(async (_: string) => readFile),
	};
}
