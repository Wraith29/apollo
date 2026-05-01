import { App } from "obsidian";
import { ApolloSettings } from "../settings";
import { IFileSystem } from "@/files/filesystem";
import { IMusicbrainzClient } from "@/clients/musicbrainz";
import { AddArtistModal, type OnSubmitFn } from "../components/add-artist-modal";

export function addArtist(app: App, cfg: ApolloSettings, fs: IFileSystem, mbClient: IMusicbrainzClient): void {
    const modal = new AddArtistModal(app, createAddArtistHandler(app, cfg, fs, mbClient));

    modal.open();
}

function createAddArtistHandler(app: App, cfg: ApolloSettings, fs: IFileSystem, mbClient: IMusicbrainzClient): OnSubmitFn {
    return async function (musicbrainzUrl: string): Promise<void> {
        const musicbrainzId = extractMbidFromUrl(musicbrainzUrl);
        const artistDetails = await mbClient.getArtistDetails(musicbrainzId);

        console.log(artistDetails);
    }
}


function extractMbidFromUrl(url: string): string {
    return url.slice(url.lastIndexOf("/")+1);
}
