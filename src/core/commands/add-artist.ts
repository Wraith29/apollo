import { App } from "obsidian";
import { ApolloSettings } from "../settings";
import { IFileSystem } from "@/files/filesystem";
import { IMusicbrainzClient } from "@/clients/musicbrainz";
import { AddArtistModal, type OnSubmitFn } from "../components/add-artist-modal";
import ArtistDetailsFile from "@/files/markdown/artist-details";

export function addArtist(app: App, cfg: ApolloSettings, fs: IFileSystem, mbClient: IMusicbrainzClient): void {
    const modal = new AddArtistModal(app, createAddArtistHandler(app, cfg, fs, mbClient));

    modal.open();
}

function createAddArtistHandler(app: App, cfg: ApolloSettings, fs: IFileSystem, mbClient: IMusicbrainzClient): OnSubmitFn {
    return async function (musicbrainzId: string): Promise<void> {
        const artistDetails = await mbClient.getArtistDetails(musicbrainzId);
    }
}
