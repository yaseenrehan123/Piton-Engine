import type { Vector2, GlobalPosition, LocalPosition, TransformOptions, ScaleOptions, SpriteOptions } from "./types";
export class Rotation {
    public value: number = 0;
    constructor(value: number = 0) {
        this.value = value;
    }
};
export class Scale {
    public value: Vector2 = {x:1,y:1};
    constructor(options:ScaleOptions){
        this.value = options.value;
    }
};
export class Transform {
    public globalPosition: GlobalPosition;
    public localPosition: LocalPosition;
    public rotation: Rotation;
    public scale: Scale;
    constructor(options: TransformOptions) {
        this.globalPosition = {position:options.globalPosition ?? {x:0,y:0}};
        this.localPosition = {position:options.localPosition ?? {x:0,y:0}};
        this.rotation = new Rotation(options.rotation?.value ?? 0);
        this.scale = new Scale({value:options.scale?.value ?? {x:1,y:1}});
    }

}
export class Sprite{
    public image: HTMLImageElement;
    public width: number;
    public height: number;
    public alpha: number;
    public rotation: number;
    public layer:number
    constructor(options:SpriteOptions){
        this.image = options.image;
        this.width = options.width;
        this.height = options.height;
        this.alpha = options.alpha ?? 1;
        this.rotation = options.rotation ?? 0;
        this.layer = options.layer ?? 0;
    }
}