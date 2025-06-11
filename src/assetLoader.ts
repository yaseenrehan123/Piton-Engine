import { AssetResources } from "./types";

export class AssetLoader {
    private resources: AssetResources;
    constructor(resources: AssetResources = {}) {
        this.resources = resources;
    };
    private fetchData(url: string) {
        return fetch(url)
            .then((data) => {
                return data.json();
            })
            .catch((error) => {
                throw new Error("Fetch Data Error" + url + error);
            });
    };
    private loadImages() : Promise<Record<string,HTMLImageElement>> {
        const imagesUrl: string = this.resources.images_JSON_path ?? '';
        if (imagesUrl === '') console.warn("NO IMAGES PASSED TO LOAD");
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
                            reject(new Error(`IMAGE FAILED TO LOAD ${data[key]}`));
                        }
                    })
                })
                .catch((error) => {
                    throw new Error("IMAGE LOADING ERROR" + error);
                })
        })

    };
    private loadAudio(): Promise<Record<string,HTMLAudioElement>> {
        const audioUrl: string = this.resources.audio_JSON_path ?? '';
        if (audioUrl === '') console.warn("NO SOUNDS PASSED TO LOAD");
       return new Promise((resolve, reject) => {
            this.fetchData(audioUrl)
                .then((data) => {
                    const keys: string[] = Object.keys(data);
                    const length: number = keys.length;
                    let loadCount: number = 0;
                    let audios:Record<string,HTMLAudioElement> = {};

                    keys.forEach((key) => {
                        const audio = new Audio();
                        audio.src = data[key];
                        audio.preload = 'auto';
                        audios[key] = audio;

                        audio.onload = () => {
                            loadCount++;
                            if (loadCount === length) {
                                resolve(audios);
                            }
                        };

                        audio.onerror = () => {
                            reject(new Error(`AUDIO FAILED TO LOAD ${data[key]}!`));
                        }
                    })
                })
                .catch((error) => {
                    throw new Error("IMAGE LOADING ERROR" + error);
                })
        });
    };
    loadAll(){
        const imagesPromise = this.loadImages();
        const audioPromise = this.loadAudio();

        const jsonPromises:Promise<any>[] = []
        const jsonKeys:string[] = [];
        if (this.resources.jsons) {
        for (const [key, url] of Object.entries(this.resources.jsons)) {
            jsonKeys.push(key);
            jsonPromises.push(this.fetchData(url));
        }
    }
        return Promise.all([imagesPromise,audioPromise,...jsonPromises])
        .then(([imagesData,audioData,...customJsons])=>{
            const customJsonData:Record<string,any> = {};
            jsonKeys.forEach((key, i) => {
                customJsonData[key] = customJsons[i];
            });
            const resources = {
                imagesData:imagesData,
                audioData:audioData,
                customJsonData:customJsonData
            };
            return resources;
        })
        .catch((error)=>{
            throw new Error("LOADING ALL RESOURCES FAILED!" + error);
        })
    }
}