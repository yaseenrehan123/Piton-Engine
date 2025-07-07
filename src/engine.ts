import { AssetResources, EngineOptions, LoadedResources, playAudioOptions, Vector2 } from "./types";
import { EntityId, EntityManager, ComponentClass } from "entix-ecs";
import { AssetLoader } from "./assetLoader";
import { Transform, Sprite, EntityActive, Parent, Scene, Children, Rectangle, Shape, Circle, Triangle, Text, Alignment } from "./components";
import { renderingSystem } from "./systems/renderingSystem";
import { Input } from "./input";
import { buttonActionSystem } from "./systems/buttonActionSystem";
import { alignmentSystem } from "./systems/alignmentSystem";
import { EngineInternals } from "./internals/engineInternals";
import { particleRemovalSystem } from "./systems/particleRemovalSystem";
import { particleSimulationSystem } from "./systems/particleSimulationSystem";
import { StorageManager } from "./storageManager";
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
    private sceneEntities: EntityId[] = [];
    private currentSceneId: EntityId | null = null;
    private input: Input | null = null;
    private domInteracted: boolean = false;
    private onDOMInteractionFunctions: Function[] = [];
    private storageManager: StorageManager | null = null;
    constructor(options: EngineOptions = {}) {
        this.init(options);
        this.start().then(() => {
            requestAnimationFrame(this.update.bind(this));
        });

    };
    //PRIVATES
    private init(options: EngineOptions) {// used to init all the important libs / files
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
        //this.canvas.width = this.canvasWidth;
        // this.canvas.height = this.canvasHeight;
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
        this.input = new Input(this);
        if (!this.input) throw new Error("INPUT NOT FOUND!");
        this.storageManager = new StorageManager();
        if (!this.storageManager) throw new Error("STORAGE MANAGAER NOT FOUND!");
    };
    private async start(): Promise<void> {//other game stuff
        try {
            const loadedResources = await this.assetLoader?.loadAll();
            this.loadedResources = loadedResources!;
            console.log("RESOURCES LOADED! ", loadedResources);
            this.startFunctions.forEach(fn => fn());
        }
        catch (error) {
            console.error("FAILED TO LOAD ASSETS:", error);
        }

    };
    private update(timeStamp: number) {//gameloop
        this.deltaTime = (timeStamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timeStamp;

        this.ctx?.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.waitForDOMInteraction();

        particleRemovalSystem(this);
        particleSimulationSystem(this);
        alignmentSystem(this);
        renderingSystem(this);
        buttonActionSystem(this);

        this.updateFunctions.forEach((fn) => {
            fn();
        });

        this.input?.resetStates();

        requestAnimationFrame(this.update.bind(this));
    };
    private waitForDOMInteraction() {
        const listener = () => {
            if (this.domInteracted) return;
            this.domInteracted = true;

            // Trigger callbacks immediately in the same stack as the event
            this.onDOMInteractionFunctions.forEach(fn => fn());
            this.onDOMInteractionFunctions = []; // optional cleanup

            console.log("DOM INTERACTION COMPLETE!");

            // Remove listeners after interaction
            window.removeEventListener("pointerdown", listener);
            window.removeEventListener("keydown", listener);
        };

        window.addEventListener("pointerdown", listener);
        window.addEventListener("keydown", listener);
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
    public getCanvasBounds(): Vector2 {
        return { x: this.canvasWidth, y: this.canvasHeight }
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
    };
    public getSceneByName(name:string):EntityId | null;
    public getSceneByName(name:string,strict:true):EntityId;
    public getSceneByName(name:string,strict:false):EntityId | null;
    public getSceneByName(name: string,strict?:boolean): EntityId | null {
        const em:EntityManager = this.getEntityManager();
        for (const id of this.sceneEntities) {
            const scene = em.getComponent(id, Scene,true);
            if (scene.name === name) return id;
        };
        if(strict) throw new Error("SCENE ID NOT FOUND IN getSceneByName(). KEY: " + name);
        return null;
    };
    public getInput(): Input {
        if (!this.input) throw new Error("INPUT NOT FOUND!");
        return this.input;
    };
    public getChildWithComponent<T>(id:EntityId,componentClass:ComponentClass<T>):EntityId | null;
    public getChildWithComponent<T>(id:EntityId,componentClass:ComponentClass<T>,strict:true):EntityId;
    public getChildWithComponent<T>(id:EntityId,componentClass:ComponentClass<T>,strict:false):EntityId | null;
    public getChildWithComponent<T>(id: EntityId, componentClass: ComponentClass<T>,strict?:boolean): EntityId | null {//Get first component with class
        const em: EntityManager = this.getEntityManager();
        const children = em.getComponent(id, Children,true);
        for (const childId of children.value) {
            const component = em.getComponent(childId, componentClass);
            if (component) {
                return childId;
            }
        }
        if(strict)
            throw new Error("NO CHILD FOUND WITH THE REQUESTED COMPONENT IN getChildWithComponet(). ID: "+id+" COMPONENT:"+componentClass.name)
        return null;
    };
    public getChildrenWithComponent<T>(id: EntityId, componentClass: ComponentClass<T>): EntityId[] {//Returns all children with specified component
        const em: EntityManager = this.getEntityManager();
        const children = em.getComponent(id, Children,true);
        let entityArr: EntityId[] = [];
        children.value.forEach((childId: EntityId) => {
            if (em.getComponent(childId, componentClass)) {
                entityArr.push(childId);
            }
        });
        return entityArr;
    };
    public getRandomInt(min: number = 0, max: number = 1): number {
        return Math.floor(Math.random() * (max - min + 1)) + min
    };
    public getRandomFloat(min: number = 0, max: number = 1): number {
        return Math.random() * (max - min) + min;
    };
    public getStorageManager(): StorageManager {
        if (!this.storageManager) throw new Error("STORAGE MANAGAER NOT FOUND!");
        return this.storageManager;
    };
    //FUNCTIONS
    public addUpdateFunction(fn: Function) {
        if (this.updateFunctions.includes(fn)) {
            console.warn("FAILED TO ADD UPDATE FN IN addUpdateFunction(), ALREADY CONTAINS FUNCTION !", fn);
            return;
        }
        this.updateFunctions.push(fn);
    };
    public removeUpdateFunction(fn: Function) {
        const index: number = this.updateFunctions.indexOf(fn);
        if (index > -1) {
            this.updateFunctions.splice(index, 1);
        }
    };
    public addStartFunction(fn: Function) {
        if (this.startFunctions.includes(fn)) {
            console.warn("FAILED TO ADD START FN IN addStartFunction(), ALREADY CONTAINS FUNCTION !", fn);
            return;
        }
        this.startFunctions.push(fn);
    };
    public removeStartFunction(fn: Function) {
        const index: number = this.startFunctions.indexOf(fn);
        if (index > -1) {
            this.startFunctions.splice(index, 1);
        }
    };
    public isEntityActive(id: EntityId): boolean {//checks whether the entity or it's parent chain is active or not
        const em:EntityManager = this.getEntityManager();
        let currentEntity: EntityId | null = id;

        while (currentEntity !== null) {
            const entityActiveComponent  = em.getComponent(currentEntity, EntityActive,true);
            const parentComponent: Parent | null = em.getComponent(currentEntity, Parent) ?? null;
            // Early return if entity is a Scene
            const sceneComponent = this.entityManager?.getComponent(currentEntity, Scene);
            if (sceneComponent) {
                return entityActiveComponent.value;
            };
            if (!parentComponent || parentComponent.value === null) {
                return entityActiveComponent.value;
            }
            if (entityActiveComponent.value !== true) return false;// return false
            currentEntity = parentComponent.value;
        }
        return true;
    };
    public addScene(id: EntityId) {//ads a scene,used upon creating a scene using scene template
        const em:EntityManager = this.getEntityManager();
        if(!em.hasComponent(id,Scene))
             throw new Error("ENTITY DOES NOT HAS A SCENE COMPONENT IN addScene() YET YOU ARE TRYING TO ADD IT !")
        if (this.sceneEntities.includes(id)) {
            console.warn("THE SCENE YOU ARE TRYING TO ADD IS ALREADY ADDED! " + id);
            return;
        }
        this.sceneEntities.push(id);
    };
    public loadScene(id: EntityId) {//loads a scene
        const em:EntityManager = this.getEntityManager();
        const sceneComponent = em.getComponent(id, Scene,true);

        for (const sceneEntity of this.sceneEntities) {// turn of all scenes
            const entityActive = em.getComponent(sceneEntity, EntityActive,true);
            entityActive.value = false;
        }

        if (this.currentSceneId !== null) {
            const oldScene = this.entityManager?.getComponent(this.currentSceneId, Scene);
            oldScene?.onUnload();
        }

        this.currentSceneId = id;
        const entityActive = em.getComponent(this.currentSceneId, EntityActive,true);
        entityActive.value = true;
        sceneComponent.onLoad();
    };
    public addParent(id: EntityId, parentId: EntityId) {// adds a parent to a entity
        const em:EntityManager = this.getEntityManager();
        if (em.hasComponent(id, Scene)) throw new Error// scenes dont have parent component!
            ("CANT ASSIGN PARENT TO A SCENE! " + id);
        const entityParentComponent = em.getComponent(id, Parent,true);
        const parentChildrenComponent = em.getComponent(parentId, Children,true);
        if (parentChildrenComponent.value.includes(id)) {
            console.warn
                ("ENTITY ALREADY HAS THIS PARENT ASSIGNED! ARE YOU ASSIGNING THE SAME PARENT AGAIN ? " + id);
            return;
        }
        entityParentComponent.value = parentId;
        parentChildrenComponent.value.push(id);

    };
    public playAudio(options: playAudioOptions) { //PLAYS AUDIO
        if (!this.domInteracted) return;
        const key: string = options.key;
        const loop: boolean = options.loop ?? false;
        const volume: number = options.volume ?? 1;
        const audio: HTMLAudioElement = this.getAudio(options.key);
        const cloneInstance: HTMLAudioElement = audio.cloneNode(false) as HTMLAudioElement;
        cloneInstance.loop = loop;
        cloneInstance.volume = volume;
        cloneInstance.play();
    };
    public addOnDOMInteractionFunction(fn: Function) {
        if (this.onDOMInteractionFunctions.includes(fn)) {
            console.warn("FAILED TO ADD START FN IN addStartFunction(), ALREADY CONTAINS FUNCTION !", fn);
            return;
        };
        this.onDOMInteractionFunctions.push(fn);
    };
    public removeEntityWithCleanup(id: EntityId) {
        const engineInternals: EngineInternals = new EngineInternals(this);
        engineInternals.unlinkFromParent(id);
        engineInternals.removeChildrenReclusively(id);
        this.entityManager?.removeEntity(id);
    };
    /* *EXPERIMENTAL* //NOT NEEDED
    public mustGetComponent<T>(id:EntityId,comp:ComponentClass<T>):T{
        const em:EntityManager = this.getEntityManager();
        const c = em.getComponent(id,comp);
        if(!c) throw new Error(comp + " COMPONENT NOT FOUND IN mustGetComponent()! ");
        return c;
    };
    */
};