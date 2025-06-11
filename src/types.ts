export type EngineOptions = {
    canvas?: HTMLCanvasElement,
    canvasWidth?: number,
    canvasHeight?: number,
    resources?: AssetResources
}
export type AssetResources = {
    images_JSON_path?: string,
    audio_JSON_path?: string,
    jsons?:Record<string, string>
}
export type LoadedResources = {
    imagesData?: Record<string, HTMLImageElement>;
    audioData?: Record<string, HTMLAudioElement>;
    [key: string]: any; // extra jsons like enemyWaveData, playerStats
};
