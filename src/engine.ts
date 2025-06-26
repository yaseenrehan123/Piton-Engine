import { AssetResources, EngineOptions, LoadedResources, Vector2 } from "./types";
import { EntityId, EntityManager, ComponentClass } from "entix-ecs";
import { AssetLoader } from "./assetLoader";
import { Transform, Sprite, EntityActive, Parent, Scene, Children, Rectangle, Shape, Circle, Triangle, Text, Alignment } from "./components";
import { renderingSystem } from "./systems/renderingSystem";
import { Input } from "./input";
import { buttonActionSystem } from "./systems/buttonActionSystem";
import { alignmentSystem } from "./systems/alignmentSystem";
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
    constructor(options: EngineOptions ={}) {
        this.init(options);
        this.start().then(() => {
            requestAnimationFrame(this.update.bind(this));
        });

    };
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

        alignmentSystem(this);
        renderingSystem(this);
        buttonActionSystem(this);

        this.updateFunctions.forEach((fn) => {
            fn();
        });

        this.input?.resetStates();

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
    public getSceneByName(name: string): EntityId | null {
        for (const id of this.sceneEntities) {
            const scene = this.entityManager?.getComponent(id, Scene);
            if (scene && scene.name === name) return id;
        }
        return null;
    };
    public getInput(): Input {
        if (!this.input) throw new Error("INPUT NOT FOUND!");
        return this.input;
    };
    public getChildWithComponent<T>(id: EntityId, componentClass: ComponentClass<T>): EntityId | null {//Get first component with class
        const em: EntityManager = this.getEntityManager();
        const children = em.getComponent(id, Children);
        if (!children)
            throw new Error("CHILDREN COMPONENT NOT FOUND IN GETCHILDWITHCOMPONENT FN" + id);
        for (const childId of children.value) {
            const component = em.getComponent(childId, componentClass);
            if (component) {
                return childId;
            }
        }
        return null;
    };
    public getChildrenWithComponent<T>(id: EntityId, componentClass: ComponentClass<T>): EntityId[] {//Returns all children with specified component
        const em: EntityManager = this.getEntityManager();
        const children = em.getComponent(id, Children);
        let entityArr: EntityId[] = [];
        if (!children)
            throw new Error("CHILDREN COMPONENT NOT FOUND IN GETCHILDRENWITHCOMPONENT FN" + id);
        children.value.forEach((childId: EntityId) => {
            if (em.getComponent(childId, componentClass)) {
                entityArr.push(childId);
            }
        });
        return entityArr;
    };
    getRandomInt(min: number = 0, max: number = 1): number {
        return Math.floor(Math.random() * (max - min + 1)) + min
    };
    getRandomFloat(min: number = 0, max: number = 1): number {
        return Math.random() * (max - min) + min;
    };
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
    public isEntityActive(id: EntityId): boolean {//checks whether the entity or it's parent chain is active or not
        let currentEntity: EntityId | null = id;

        while (currentEntity !== null) {
            const entityActiveComponent: EntityActive | null = this.entityManager?.getComponent(currentEntity, EntityActive) ?? null;
            const parentComponent: Parent | null = this.entityManager?.getComponent(currentEntity, Parent) ?? null;
            if (!entityActiveComponent) throw new Error("ENTITY DOES NOT HAVE ENTITYACTIVE COMPONENT IN ISENTITYACTIVE() " + id);
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
        if (this.sceneEntities.includes(id)) {
            console.warn("THE SCENE YOU ARE TRYING TO ADD IS ALREADY ADDED! " + id);
            return;
        }
        this.sceneEntities.push(id);
    };
    public loadScene(id: EntityId) {//loads a scene
        const sceneComponent = this.entityManager?.getComponent(id, Scene);
        if (!sceneComponent) throw new Error("Scene component not found on entity: " + id);

        for (const sceneEntity of this.sceneEntities) {// turn of all scenes
            const entityActive = this.entityManager?.getComponent(sceneEntity, EntityActive);
            if (!entityActive) throw new Error
                ("SCENE DOES NOT HAVE ENTITY ACTIVE COMPONENT! WONT BE ABLE TO SWITCH TO THIS SCENE! " + sceneEntity);
            entityActive.value = false;
        }

        if (this.currentSceneId !== null) {
            const oldScene = this.entityManager?.getComponent(this.currentSceneId, Scene);
            oldScene?.onUnload();
        }

        this.currentSceneId = id;
        const entityActive = this.entityManager?.getComponent(this.currentSceneId, EntityActive);
        if (!entityActive) throw new Error("Target scene missing EntityActive component!");
        entityActive.value = true;
        sceneComponent.onLoad();
    };
    public addParent(id: EntityId, parentId: EntityId) {// adds a parent to a entity
        if (this.entityManager?.getComponent(id, Scene)) throw new Error// scenes dont have parent component!
            ("CANT ASSIGN PARENT TO A SCENE! " + id);
        const entityParentComponent = this.entityManager?.getComponent(id, Parent);
        const parentChildrenComponent = this.entityManager?.getComponent(parentId, Children);
        if (!entityParentComponent) throw new Error
            ("ENTITY DOES NOT HAVE PARENT COMPONENT, AND YOU ARE TRYING TO ASSIGN A VALUE! " + id);
        if (!parentChildrenComponent) throw new Error
            ("ENTITY DOES NOT HAVE CHILDREN COMPONENT, AND YOU ARE TRYING TO ASSIGN A VALUE! " + id);
        if (parentChildrenComponent.value.includes(id)) {
            console.warn
                ("ENTITY ALREADY HAS THIS PARENT ASSIGNED! ARE YOU ASSIGNING THE SAME PARENT AGAIN ? " + id);
            return;
        }
        entityParentComponent.value = parentId;
        parentChildrenComponent.value.push(id);

    };
};