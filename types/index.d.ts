export type VideoQuality = '360' | '480' | '720' | '1080';
export type Format = 'mp3' | VideoQuality;

export interface Progress {
  stage: 'converting' | 'downloading';
  progress?: unknown;
  downloaded?: number;
  total?: number;
  percent?: number | null;
}

export interface Options {
  /** Directory used for the suggested / saved file path. Default "./" */
  dir?: string;
  /** Also download the file to disk. */
  save?: boolean;
  onProgress?: (p: Progress) => void;
  /** Override the download-service key (or set YTDL_API_KEY). */
  apiKey?: string;
  timeout?: number;
  maxWaitMs?: number;
  pollMs?: number;
  retries?: number;
}

export interface SearchOptions {
  limit?: number;
  timeout?: number;
  cache?: boolean;
  providers?: Array<'innertube' | 'piped' | 'invidious' | 'html'>;
}

export interface SearchResult {
  id: string; url: string; title: string; author: string;
  duration: string; seconds: number; views: string; thumbnail: string;
}

export interface Thumbnails { default: string; medium: string; high: string; standard: string; maxres: string }

export interface Chapter { time: string; seconds: number; title: string }

export interface VideoInfo {
  status: true;
  id: string; url: string; title: string; description: string;
  author: string; channelId: string; channelUrl: string;
  duration: string; seconds: number;
  views: number | null;
  /** Best effort — null when YouTube hides it or markup changed. */
  likes: number | null;
  publishDate: string | null; uploadDate: string | null; category: string | null;
  keywords: string[]; chapters: Chapter[];
  isLive: boolean; isLiveContent: boolean; isPrivate: boolean; isUnlisted: boolean;
  isFamilySafe: boolean | null; availableCountries: string[];
  playlistId: string | null;
  thumbnail: string; thumbnails: Thumbnails; thumbnailList: Array<{ url: string; width: number; height: number }>;
  /** true when only basic info could be fetched */
  partial?: boolean;
}

export interface PlaylistItem {
  index: number; id: string; url: string; title: string; author: string; channelId: string;
  duration: string; seconds: number; thumbnail: string; isPlayable: boolean;
}

export interface PlaylistInfo {
  status: true; id: string; url: string; title: string; description: string;
  author: string; channelId: string; channelUrl: string;
  videoCount: number; views: number | null; lastUpdated: string | null;
  totalSeconds: number; thumbnail: string; hasMore: boolean; items: PlaylistItem[];
}

export interface DownloadResult {
  status: true;
  id: string; videoId: string; title: string; author: string; duration: string;
  thumbnail: string; thumbnails: Thumbnails;
  url: string; quality: string; type: 'audio' | 'video'; label: string;
  /** Suggested (or, with save:true, actual) file path. */
  path: string;
  /** Present when save:true */
  file?: string;
  size?: number;
}

export interface Media { type: 'audio' | 'video'; quality: string; label: string; url: string; path: string }

export interface AllFormatsResult extends Omit<DownloadResult, 'url' | 'quality' | 'type' | 'label' | 'path'> { medias: Media[] }

export function ytmp3(input: string, quality?: string, opts?: Options): Promise<DownloadResult>;
export function ytmp4(input: string, quality: null, opts?: Options): Promise<AllFormatsResult>;
export function ytmp4(input: string, quality?: VideoQuality | `${VideoQuality}p` | 'best' | 'worst' | 'highest' | 'lowest', opts?: Options): Promise<DownloadResult>;
export function search(query: string, opts?: SearchOptions): Promise<SearchResult[]>;
export function getInfo(input: string, opts?: { timeout?: number; likes?: boolean }): Promise<VideoInfo>;
export function getPlaylist(input: string, opts?: { limit?: number; all?: boolean; timeout?: number }): Promise<PlaylistInfo>;
export function resolve(input: string, opts?: { timeout?: number }): Promise<SearchResult>;
export function getLink(videoUrl: string, format?: Format, opts?: Options): Promise<string>;
export function saveFile(url: string, filePath: string, opts?: Pick<Options, 'onProgress'> & { saveTimeout?: number }): Promise<{ file: string; size: number }>;
export function clearSearchCache(): void;

export const FORMATS: Format[];
export const VIDEO_QUALITIES: VideoQuality[];

export class YTDLError extends Error {
  code: string; status?: number; cause?: unknown;
}

export function slugify(title?: string, max?: number): string;
export function buildPath(title: string, ext: 'mp3' | 'mp4' | string, dir?: string): string;
export function extractVideoId(input: string): string | null;
export function isYouTubeUrl(input: string): boolean;
export function extractPlaylistId(input: string): string | null;
export function parseChapters(description: string): Chapter[];
export function formatDuration(seconds: number): string;
export function parseDuration(text: string): number;
export function formatBytes(bytes: number): string;
export function thumbnails(id: string): Thumbnails;

declare const ytdl: {
  ytmp3: typeof ytmp3; ytmp4: typeof ytmp4; search: typeof search; getInfo: typeof getInfo; getPlaylist: typeof getPlaylist;
  extractPlaylistId: typeof extractPlaylistId; parseChapters: typeof parseChapters;
  resolve: typeof resolve; getLink: typeof getLink; saveFile: typeof saveFile;
  clearSearchCache: typeof clearSearchCache; FORMATS: typeof FORMATS; VIDEO_QUALITIES: typeof VIDEO_QUALITIES;
  YTDLError: typeof YTDLError; slugify: typeof slugify; buildPath: typeof buildPath;
  extractVideoId: typeof extractVideoId; isYouTubeUrl: typeof isYouTubeUrl;
  formatDuration: typeof formatDuration; parseDuration: typeof parseDuration;
  formatBytes: typeof formatBytes; thumbnails: typeof thumbnails;
};
export default ytdl;
