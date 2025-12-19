import albumsData from "./albums.json";
import type { Album } from "./types";

const data = albumsData as { albums?: Album[] };

export const DEFAULT_ALBUMS: Album[] = data.albums ?? [];
