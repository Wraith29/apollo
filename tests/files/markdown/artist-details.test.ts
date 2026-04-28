import { describe, test, expect, mock, spyOn } from "bun:test";
import { IFileSystem } from "@/files/filesystem";
import ArtistDetailsFile from "@/files/markdown/artist-details";

const fsMock: IFileSystem = {
    readFile: mock(async (path: string) => "readFile"),
};

const readFileSpy = spyOn(fsMock, "readFile");

let instance = new ArtistDetailsFile("any-file", fsMock);

describe("process", () => {
    test("calls fileSystem.readFile", () => {

        
    });
});
