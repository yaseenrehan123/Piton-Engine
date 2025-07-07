import { EntityId } from "entix-ecs";
import type { Vector2, GlobalPosition, TransformOptions, ScaleOptions, SpriteOptions, EntityActiveOptions, ParentOptions, SceneOptions, RectangleOptions, CircleOptions, ShapeType, ShapeOptions, TriangleOptions, TextOptions, ButtonOptions, AlignmentHorizontal, AlignmentVertical, AlignmentOptions, ParticleOptions, ParticleContainerOptions } from "./types";
/* PRIVATE COMPONENTS*/
class Rotation {
    public value: number = 0;
    constructor(value: number = 0) {
        this.value = value ?? 0;
    }
};
class Scale {
    public value: Vector2 = {x:1,y:1};
    constructor(options:ScaleOptions = {}){
        this.value = options.value ?? {x:1,y:1};
    }
};
/*PUBLIC COMPONENTS*/
export class Transform {
    public globalPosition: GlobalPosition;
    //public localPosition: LocalPosition;
    public rotation: Rotation;
    public scale: Scale;
    constructor(options: TransformOptions = {}) {
        this.globalPosition = {position:options.globalPosition ?? {x:0,y:0}};
        //this.localPosition = {position:options.localPosition ?? {x:0,y:0}};
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
    public blocksInput:boolean = true;
    public scale:Vector2 = {x:1,y:1};
    constructor(options:SpriteOptions){
        this.image = options.image;
        this.width = options.width;
        this.height = options.height;
        this.alpha = options.alpha ?? 1;
        this.rotation = options.rotation ?? 0;
        this.layer = options.layer ?? 0;
        this.active = options.active ?? true;
        this.blocksInput = options.blocksInput ?? true;
        this.scale = options.scale ?? {x:1,y:1};
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
export class Shape<T extends ShapeType>{
    public shape:T;
    public color:string = 'green';
    public outlineEnabled:boolean = false;
    public outlineWidth:number = 3;
    public outlineColor:string = 'black';
    public alpha:number = 1;
    public active:boolean = true;
    public layer:number = 0;
    public blocksInput:boolean = true;
    constructor(options:ShapeOptions<T>){
        this.shape =  options.shape;
        this.color = options.color ?? 'green';
        this.outlineEnabled = options.outlineEnabled ?? false;
        this.outlineWidth = options.outlineWidth ?? 3;
        this.outlineColor = options.color ?? 'black';
        this.alpha = options.alpha ?? 1;
        this.active = options.active ?? true;
        this.layer = options.layer ?? 0;
        this.blocksInput = options.blocksInput ?? true;
    }
};   
export class Rectangle{
    public width:number;
    public height:number;
    public centered:boolean = true;
    public rotation:number = 0;
    public rounded:boolean = false;
    public roundedRadius:number = 5;
    constructor(options:RectangleOptions){
        this.width = options.width ?? 40;
        this.height = options.height ?? 40;
        this.centered = options.centered ?? true;
        this.rotation = options.rotation ?? 0;
        this.rounded = options.rounded ?? false;
        this.roundedRadius = options.roundRadius ?? 5;
    }
};
export class Circle{
    public radius:number;
    constructor(options:CircleOptions){
        this.radius = options.radius ?? 40;
    }
};
export class Triangle{
    public p1:Vector2;// side 1
    public p2: Vector2;// side 2
    public p3 : Vector2 // side 3
    public centered:boolean = true;
    public rotation:number = 0;
    constructor(options:TriangleOptions){
        this.p1 = options.p1 ?? {x:30,y:0};
        this.p2 = options.p2 ?? {x:0,y:59};
        this.p3 = options.p3 ?? {x:30,y:59};
        this.centered = options.centered ?? true;
        this.rotation = options.rotation ?? 0;
    }
};
export class Text{
    public content:string = 'text';
    public size:number = 16;
    public color:string = 'white';
    public outlineEnabled:boolean = false;
    public outlineWidth:number = 2;
    public outlineColor:string = 'black';
    public alpha:number = 1;
    public active:boolean = true;
    public layer:number = 0;
    public rotation:number = 0;
    public style:string = 'sans-serif';
    public maxWidth:number = 200;
    constructor(options:TextOptions){
        this.content = options.content ?? 'text';
        this.size = options.size ?? 16;
        this.color = options.color ?? 'white';
        this.outlineEnabled = options.outlineEnabled ?? false;
        this.outlineWidth = options.outlineWidth ?? 2;
        this.outlineColor = options.outlineColor ?? 'black';
        this.alpha = options.alpha ?? 1;
        this.active = options.active ?? true;
        this.layer = options.layer ?? 0;
        this.rotation = options.rotation ?? 0;
        this.style = options.style ?? 'sans-serif';
        this.maxWidth = options.maxWidth ?? 200;
    }
};
export class Button{
    public pressArea:Vector2 = {x:100,y:100};
    public onJustPressed:Function = ()=>{};
    public onPress:Function = ()=>{};
    public onJustReleased:Function = ()=>{};
    public onJustHovered:Function = ()=>{};
    public onHovered:Function = ()=>{};
    public onHoveredReleased:Function = ()=>{};
    public showPressArea:boolean = false;
    public pressAreaShowColor:string = 'green';
    public layer:number = 0;
    public active:boolean = true;
    public changeCursorToPointer:boolean = true;
    public isHovered:boolean = false;
    constructor(options:ButtonOptions){
        this.pressArea = options.pressArea ?? {x:100,y:100};
        this.onJustPressed = options.onJustPressed ?? (()=>{});
        this.onPress = options.onPress ?? (()=>{});
        this.onJustReleased = options.onReleased ?? (()=>{});
        this.onJustHovered = options.onJustHovered ?? (()=>{});
        this.onHovered = options.onHovered ?? (()=>{});
        this.onHoveredReleased = options.onHoveredReleased ??(()=>{})
        this.showPressArea = options.showPressArea ?? false;
        this.pressAreaShowColor = options.pressAreaShowColor ?? 'green';
        this.layer = options.layer ?? 0;
        this.active = options.active ?? true;
        this.changeCursorToPointer = options.changeCursorToPointer ?? true;
    }
};
/*
export class RectButton{
    public button:Button;
    public shape:Shape;
    public text:Text;
    constructor(options:RectButtonOptions){
        this.button = options.button ?? new Button({

        });
        this.shape = options.shape ?? new Shape({
            shape:new Rectangle({
                
            })
        });
        this.text = options.text ?? new Text({

        })
    };
};
*/
export class Alignment{// A component to have a entity always fixedly aligned.
    public alignmentHorizontal:AlignmentHorizontal = 'none';//Horizontal Alignment
    public alignmentVertical:AlignmentVertical = 'none';//Vertical Alignment
    public offset:Vector2 = {x:0,y:0};//Offset from aligned position
    constructor(options:AlignmentOptions){
        this.alignmentHorizontal = options.alignmentHorizontal ?? 'none';
        this.alignmentVertical = options.alignmentVertical ?? 'none';
        this.offset = options.offset ?? {x:0,y:0};
    }
};
export class ParticleContainer {
    public maxNumber: number;
    public img: HTMLImageElement; //TEXTURE
    public minScaleRange: Vector2;
    public maxScaleRange: Vector2;
    public minSpeedRange: number;
    public maxSpeedRange: number;
    public minLifeTimeRange: number;
    public maxLifeTimeRange: number;
    public minAlphaRange: number;
    public maxAlphaRange: number;
    public minRotationRange: number;
    public maxRotationRange: number;
    public alphaReductionRate: number;
    public duration:number;
    public counter:number;
    constructor(options: ParticleContainerOptions) {
        this.maxNumber = options.maxNumber ?? 16;
        this.img = options.img;
        this.minScaleRange = options.minScaleRange ?? { x: 1, y: 1 };
        this.maxScaleRange = options.maxScaleRange ?? { x: 2, y: 2 };
        this.minSpeedRange = options.minSpeedRange ?? 30;
        this.maxSpeedRange = options.maxSpeedRange ?? 100;
        this.minLifeTimeRange = options.minLifeTimeRange ?? 1;
        this.maxLifeTimeRange = options.maxLifeTimeRange ?? 2;
        this.minAlphaRange = options.minAlphaRange ?? 0.5;
        this.maxAlphaRange = options.maxAlphaRange ?? 1;
        this.minRotationRange = options.minRotationRange ?? 0;
        this.maxRotationRange = options.maxRotationRange ?? 360;
        this.alphaReductionRate = options.alphaReductionRate ?? 0.4;
        this.duration = options.duration ?? 1;
        this.counter = this.duration;
    }
};
export class Particle {
    public lifeTime: number;
    public velocity: Vector2;
    public alphaReductionRate: number;
    constructor(options: ParticleOptions) {
        this.lifeTime = options.lifeTime;
        this.velocity = options.velocity;
        this.alphaReductionRate = options.alphaReductionRate;
    }
};