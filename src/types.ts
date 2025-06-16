import { EntityId } from "entix-ecs";
import { Circle, Rectangle, Triangle } from "./components";

//GENERAL TYPES
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
    customJsonData?: Record<string, any>; // extra jsons like enemyWaveData, playerStats
};
//ENGINE TYPES
export type Vector2 = {
    x:number,
    y:number
};
export type GlobalPosition = {
    position:Vector2//(x,y)
};
export type LocalPosition = {
    position:Vector2//(x,y)
};
//ENTITY OPTIONS TYPES
export type RotationOptions = {
    value?:number
};
export type ScaleOptions = {
    value?:Vector2
};
export type TransformOptions = {
    globalPosition?:Vector2,
    localPosition?:Vector2,
    rotation?:RotationOptions,
    scale?:ScaleOptions
};
export type SpriteOptions = {
    image:HTMLImageElement,
    width:number,
    height:number,
    alpha?:number,
    rotation?:number,
    layer?:number,
    active?:boolean
};
export type EntityActiveOptions = {
    value?:boolean
};
export type ParentOptions = {
    value?:EntityId
};
export type SceneOptions = {
    name:string,
    onLoad?:Function
    onUnload?:Function
};
export type ShapeType = Rectangle | Circle | Triangle;
export type ShapeOptions = {
    shape:ShapeType,
    color?:string,
    outlineEnabled?:boolean,
    outlineWidth?:number,
    outlineColor?:string,
    alpha?:number,
    active?:boolean,
    layer?:number
};
export type RectangleOptions = {
    width?:number,
    height?:number,
    centered?:boolean,
    rotation?:number
};
export type CircleOptions = {
    radius?:number
};
export type TriangleOptions = {
    p1?:Vector2,
    p2?:Vector2,
    p3?:Vector2,
    centered?:boolean,
    rotation?:number
};