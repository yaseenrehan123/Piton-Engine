import { AssetResources, EngineOptions, LoadedResources, Vector2 } from "./types";
import { EntityId, EntityManager } from "entix-ecs";
import { AssetLoader } from "./assetLoader";
import { Transform, Sprite, EntityActive, Parent, Scene, Children, Rectangle, Shape } from "./components";
import { renderingSystem } from "./systems/renderingSystem";
import { Input } from "./input";
import { buttonActionSystem } from "./systems/buttonActionSystem";
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
        this.input = new Input(this);
        if (!this.input) throw new Error("INPUT NOT FOUND!");
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

        this.ctx?.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

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
    getInput(): Input {
        if (!this.input) throw new Error("INPUT NOT FOUND!");
        return this.input;
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
    public drawSprite(transform: Transform, sprite: Sprite) {// draws a sprite, runs in spriteRenderingSystem(auto handles sprite loading)
        if (!this.ctx) throw new Error("CTX NOT FOUND IN DRAW SPRITE!");
        const selfRotationInRadians = (Math.PI * sprite.rotation) / 180;
        const transformRotationInRadians = (Math.PI * transform.rotation.value) / 180
        const totalRotationInRadians = selfRotationInRadians + transformRotationInRadians;
        const pos: Vector2 = transform.globalPosition.position;

        this.ctx.save();

        this.ctx.translate(pos.x, pos.y);

        this.ctx.scale(transform.scale.value.x, transform.scale.value.y);

        this.ctx.globalAlpha = sprite.alpha;

        this.ctx.rotate(totalRotationInRadians)

        this.ctx.drawImage(sprite.image, -sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height);

        this.ctx.restore();
    };
    public isEntityActive(id: EntityId): boolean {//checks whether the entity or it's parent chain is active or not
        let currentEntity: EntityId | null = id;

        while (currentEntity) {
            const entityActiveComponent: EntityActive | null = this.entityManager?.getComponent(currentEntity, EntityActive) ?? null;
            const parentComponent: Parent | null = this.entityManager?.getComponent(currentEntity, Parent) ?? null;
            if (!entityActiveComponent) throw new Error("ENTITY DOES NOT HAVE ENTITYACTIVE COMPONENT IN ISENTITYACTIVE() " + id);
            if (!parentComponent) throw new Error("ENTITY DOES NOT HAVE PARENT COMPONENT IN ISENTITYACTIVE() " + id);
            if (entityActiveComponent.value !== true) return false;// return false
            currentEntity = parentComponent.value;
        }
        return true;
    };
    public addScene(id: EntityId) {//ads a scene,used upon creating a scene using scene template
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
    isEntityBlockingInput(x: number, y: number, layer: number): boolean {
        const em = this.getEntityManager();
        let blocked = false;

        // Check all Sprites
        em.query('All', { transform: Transform, sprite: Sprite }, (_, { transform, sprite }) => {
            if (!sprite.active || !sprite.blocksInput) return;
            if (sprite.layer <= layer) return;

            const pos = transform.globalPosition.position;
            const width = sprite.width * transform.scale.value.x;
            const height = sprite.height * transform.scale.value.y;
            const centeredX = pos.x - width / 2;
            const centeredY = pos.y - height / 2;

            if (x >= centeredX && x <= centeredX + width && y >= centeredY && y <= centeredY + height) {
                blocked = true;
            }
        });

        // Check all Shapes
        em.query('All', { transform: Transform, shape: Shape }, (_, { transform, shape }) => {
            if (!shape.active || !shape.blocksInput) return;
            if (shape.layer <= layer) return;

            const shapeType = shape.shape;
            if (shapeType instanceof Rectangle) {
                const width = shapeType.width * transform.scale.value.x;
                const height = shapeType.height * transform.scale.value.y;
                const pos = transform.globalPosition.position;
                const centeredX = pos.x - width / 2;
                const centeredY = pos.y - height / 2;

                if (x >= centeredX && x <= centeredX + width && y >= centeredY && y <= centeredY + height) {
                    blocked = true;
                }
            }
            // Add checks for other shape types if needed (e.g., Circle, Polygon)
        });

        return blocked;
    }

};