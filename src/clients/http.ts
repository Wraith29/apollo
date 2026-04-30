import { Notice, requestUrl, RequestUrlParam, RequestUrlResponse } from "obsidian";

export interface IHttpClient {
    httpGet<T>(request: RequestUrlParam): Promise<T>
}

export class HttpClient implements IHttpClient {
    public async httpGet<T>(request: RequestUrlParam): Promise<T> {
        let response: RequestUrlResponse;
        try {
            response = await requestUrl(request);
        } catch (error) {
            console.error({ message: "Failed to request url", url: request.url, error: error });
            new Notice(
                "Failed to get artist details.\nSee console for more information.",
            );

            throw error;
        }

        const result = response.json as T;
        if (!result) {
            throw new Error(`Failed to cast responset to ${typeof result}`);
        }

        return result;
    }
}
