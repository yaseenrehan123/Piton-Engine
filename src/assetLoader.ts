import { AssetResources } from "./types";

export class AssetLoader {
    private resources: AssetResources;
    constructor(resources: AssetResources = {}) {
        this.resources = resources;
    };
    private async fetchData(url: string) {
        try {
            const response = await fetch(url);
            if(!response.ok){
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
            }
            return await response.json();
        }
        catch(error){
            console.error(`❌ Failed to fetch JSON at: ${url}\n`, error);
            throw new Error(`FetchDataError\nURL: ${url}\nReason: ${(error as Error).message}`);
        }
    };
    private loadImages() : Promise<Record<string,HTMLImageElement>> {
        const imagesUrl: string = this.resources.images_JSON_path ?? '';
        if (imagesUrl === ''){
            console.warn("NO IMAGES PASSED TO LOAD")
            return Promise.resolve({});
        };
       return new Promise((resolve, reject) => {
            this.fetchData(imagesUrl)
                .then((data) => {
                    const keys: string[] = Object.keys(data);
                    const length: number = keys.length;
                    let loadCount: number = 0;
                    let images:Record<string,HTMLImageElement> = {};

                    keys.forEach((key) => {
                        const image = new Image();
                        image.src = data[key];
                        images[key] = image;

                        image.onload = () => {
                            loadCount++;
                            if (loadCount === length) {
                                resolve(images);
                            }
                        };

                        image.onerror = () => {
                            console.error(`❌ Failed to load image: ${data[key]}`);
                            reject(new Error(`ImageLoadError\nFile: ${data[key]}`));
                        }
                    })
                })
                .catch((error) => {
                    console.error("❌ Failed during image JSON loading:", error);
                    reject(new Error(`ImageLoadingError\n${(error as Error).message}`));
                })
        })

    };
    private loadAudio(): Promise<Record<string, HTMLAudioElement>> {
        const audioUrl: string = this.resources.audio_JSON_path ?? '';
        if (audioUrl === '') {
            console.warn("⚠️ No audio JSON path provided.");
            return Promise.resolve({});
        }

        return new Promise((resolve, reject) => {
            this.fetchData(audioUrl)
                .then((data) => {
                    const keys = Object.keys(data);
                    let loadCount = 0;
                    const audios: Record<string, HTMLAudioElement> = {};

                    keys.forEach((key) => {
                        const audio = new Audio();
                        audio.src = data[key];
                        audio.preload = 'auto';
                        audios[key] = audio;

                        // There’s no onload for <audio> reliably — you can use `canplaythrough` instead
                        audio.addEventListener("canplaythrough", () => {
                            loadCount++;
                            if (loadCount === keys.length) {
                                resolve(audios);
                            }
                        });

                        audio.onerror = () => {
                            console.error(`❌ Failed to load audio: ${data[key]}`);
                            reject(new Error(`AudioLoadError\nFile: ${data[key]}`));
                        };
                    });
                })
                .catch((error) => {
                    console.error("❌ Failed during audio JSON loading:", error);
                    reject(new Error(`AudioLoadingError\n${(error as Error).message}`));
                });
        });
    }

    async loadAll() {
        const imagesPromise = this.loadImages();
        const audioPromise = this.loadAudio();

        const jsonPromises: Promise<any>[] = [];
        const jsonKeys: string[] = [];

        if (this.resources.jsons) {
            for (const [key, url] of Object.entries(this.resources.jsons)) {
                jsonKeys.push(key);
                jsonPromises.push(this.fetchData(url));
            }
        }

        try {
            const [imagesData, audioData, ...customJsons] = await Promise.all([
                imagesPromise,
                audioPromise,
                ...jsonPromises,
            ]);

            const customJsonData: Record<string, any> = {};
            jsonKeys.forEach((key, i) => {
                customJsonData[key] = customJsons[i];
            });

            return {
                imagesData,
                audioData,
                customJsonData,
            };
        } catch (error) {
            console.error("❌ Failed to load all resources:", error);
            throw new Error(`LoadAllResourcesError\n${(error as Error).message}`);
        }
    }
}