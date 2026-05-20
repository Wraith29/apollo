export function extractMbidFromUrl(url: string): string {
	return url.slice(url.lastIndexOf("/") + 1);
}
