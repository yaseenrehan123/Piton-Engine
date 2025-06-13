import { AssetResources, EngineOptions, LoadedResources, Vector2 } from "./types";
import { EntityManager } from "entix-ecs";
import { AssetLoader } from "./assetLoader";
import { Transform,Sprite } from "./components";
import { renderingSystem } from "./systems";
export class Engine {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private canvasWidth: number = 0;
    private canvasHeight: number = 0;
    private canvasDefWidth: number = 680;
    private canvasDefHeight: number = 600;
    private entityManager: EntityManager | null = null;
    private lastFrameTime: number = 0;
    private deltaTime: number = 0;
    private updateFunctions: Function[] = [];
    private resources: AssetResources = {};
    private assetLoader: AssetLoader | null = null;
    private loadedResources: LoadedResources = {};
    private startFunctions: Function[] = [];
    constructor(options: EngineOptions) {
        this.init(options);
        this.start();
        requestAnimationFrame(this.update.bind(this));
    };
    init(options: EngineOptions) {// used to init all the important libs / files
        this.canvas = options.canvas ?? null;
        if (!this.canvas) {// create one
            const newCanvas: HTMLCanvasElement = document.createElement('canvas');
            this.canvas = newCanvas;
            document.body.appendChild(this.canvas);
        };
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) throw new Error("CTX NOT FOUND!");
        this.canvasWidth = options.canvasWidth ?? 0;
        if (this.canvasWidth === 0) this.canvasWidth = this.canvasDefWidth;
        this.canvasHeight = options.canvasHeight ?? 0;
        if (this.canvasHeight === 0) this.canvasHeight = this.canvasDefHeight;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvasWidth * dpr;
        this.canvas.height = this.canvasHeight * dpr;
        this.canvas.style.width = `${this.canvasWidth}px`;
        this.canvas.style.height = `${this.canvasHeight}px`;
        this.ctx.scale(dpr, dpr);
        this.entityManager = new EntityManager();
        if (!this.entityManager) throw new Error("ENTITY MANAGER NOT FOUND!");
        this.resources = options.resources ?? {};
        this.assetLoader = new AssetLoader(this.resources);

    };
    start() {//other game stuff
        this.assetLoader?.loadAll().then((loadedResources) => {
            this.loadedResources = loadedResources;
            console.log("Resources loaded!", loadedResources);
            this.startFunctions.forEach((fn) => {
                fn();
            });
            // now you can assign to this.resources or something similar
        }).catch((error) => {
            console.error("FAILED TO LOAD ASSETS: ", error);
        });

    };
    update(timeStamp: number) {//gameloop
        this.deltaTime = (timeStamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timeStamp;

        this.ctx?.clearRect(0,0,this.canvasWidth,this.canvasHeight);

        renderingSystem(this);

        this.updateFunctions.forEach((fn) => {
            fn();
        });

        requestAnimationFrame(this.update.bind(this));
    };
    //GETTER
    public getCanvas(): HTMLCanvasElement {
        if (!this.canvas) throw new Error("CANVAS NOT FOUND!");
        return this.canvas;
    };
    public getCtx(): CanvasRenderingContext2D {
        if (!this.ctx) throw new Error("CTX NOT FOUND");
        return this.ctx;
    };
    public getEntityManager(): EntityManager {
        if (!this.entityManager) throw new Error("ENTITY MANAGER NOT FOUND!");
        return this.entityManager;
    };
    public getDeltaTime(): number {
        return this.deltaTime;
    };
    public getImage(key: string): HTMLImageElement {
        if (!this.loadedResources?.imagesData || !this.loadedResources.imagesData[key]) {
            throw new Error("LOADED IMAGE RESOURCE " + key + " NOT FOUND!");
        }
        return this.loadedResources.imagesData[key];
    };
    public getAudio(key: string): HTMLAudioElement {
        if (!this.loadedResources.audioData || !this.loadedResources.audioData[key]) {
            throw new Error("LOADED AUDIO RESOURCE " + key + " NOT FOUND!");
        }
        return this.loadedResources.audioData[key];
    };
    public getJSON<T = any>(key: string): T {
        if (!this.loadedResources.customJsonData || !(key in this.loadedResources.customJsonData))
            throw new Error("LOADED JSON RESOURCE " + key + " NOT FOUND!");
        return this.loadedResources.customJsonData[key] as T;
    }
    //FUNCTIONS
    public addUpdateFunction(fn: Function) {
        this.updateFunctions.push(fn);
    };
    public removeUpdateFunction(fn: Function) {
        const index: number = this.updateFunctions.indexOf(fn);
        if (index > -1) {
            this.updateFunctions.splice(index, 1);
        }
    };
    public addStartFunction(fn: Function) {
        this.startFunctions.push(fn);
    };
    public removeStartFunction(fn: Function) {
        const index: number = this.startFunctions.indexOf(fn);
        if (index > -1) {
            this.startFunctions.splice(index, 1);
        }
    };
    public drawSprite(transform:Transform,sprite:Sprite){
        if(!this.ctx) throw new Error("CTX NOT FOUND IN DRAW SPRITE!");

        const pos:Vector2 = transform.globalPosition.position;

        this.ctx.save();

        this.ctx.translate(pos.x,pos.y);

        this.ctx.globalAlpha = sprite.alpha;

        this.ctx.rotate((sprite.rotation * Math.PI) / 180)

        this.ctx.drawImage(sprite.image,-sprite.width / 2,-sprite.height / 2,sprite.width,sprite.height);

        this.ctx.restore();
    };
}