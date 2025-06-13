import { EntityId } from "entix-ecs";
import type { Vector2, GlobalPosition, LocalPosition, TransformOptions, ScaleOptions, SpriteOptions, EntityActiveOptions, ParentOptions, SceneOptions } from "./types";
export class Rotation {
    public value: number = 0;
    constructor(value: number = 0) {
        this.value = value ?? 0;
    }
};
export class Scale {
    public value: Vector2 = {x:1,y:1};
    constructor(options:ScaleOptions = {}){
        this.value = options.value ?? {x:1,y:1};
    }
};
export class Transform {
    public globalPosition: GlobalPosition;
    public localPosition: LocalPosition;
    public rotation: Rotation;
    public scale: Scale;
    constructor(options: TransformOptions = {}) {
        this.globalPosition = {position:options.globalPosition ?? {x:0,y:0}};
        this.localPosition = {position:options.localPosition ?? {x:0,y:0}};
        this.rotation = new Rotation(options.rotation?.value);
        this.scale = new Scale({value:options.scale?.value});
    }

};
export class Sprite{
    public image: HTMLImageElement;
    public width: number;
    public height: number;
    public alpha: number;
    public rotation: number;
    public layer:number;
    public active:boolean;
    constructor(options:SpriteOptions){
        this.image = options.image;
        this.width = options.width;
        this.height = options.height;
        this.alpha = options.alpha ?? 1;
        this.rotation = options.rotation ?? 0;
        this.layer = options.layer ?? 0;
        this.active = options.active ?? true;
    }
};
export class EntityActive{
    public value:boolean = true;
    constructor(options:EntityActiveOptions = {}){
        this.value = options.value ?? true;
    }
};
export class Parent{
    public value:EntityId | null = null;
    constructor(options:ParentOptions = {}){
        this.value = options.value ?? null;
    }
};
export class Children{// increment through code
    public value:EntityId[] = [];
};
export class Scene{
    public name:string = '';
    public onLoad:Function;
    public onUnload:Function;
    constructor(options:SceneOptions){
        this.name = options.name;
        this.onLoad = options.onLoad ?? (()=>{});
        this.onUnload = options.onUnload ?? (()=>{});

    }
};