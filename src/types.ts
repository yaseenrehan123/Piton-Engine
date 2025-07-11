import { EntityId } from "entix-ecs";
import { Button, Circle, Rectangle, Shape, Text, Triangle } from "./components";

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
    jsons?: Record<string, string>
}
export type LoadedResources = {
    imagesData?: Record<string, HTMLImageElement>;
    audioData?: Record<string, HTMLAudioElement>;
    customJsonData?: Record<string, any>; // extra jsons like enemyWaveData, playerStats
};
//ENGINE TYPES
export type Vector2 = {
    x: number,
    y: number
};
export type GlobalPosition = {
    position: Vector2//(x,y)
};
export type AlignmentHorizontal = 'none' | 'left' | 'center' | 'right';
export type AlignmentVertical = 'none'| 'top' | 'middle' | 'bottom';
export type ShapeType = Rectangle | Circle | Triangle;
/* //DISABLED
export type LocalPosition = {
    position:Vector2//(x,y)
};
*/
//ENTITY OPTIONS TYPES
export type RotationOptions = {
    value?: number
};
export type ScaleOptions = {
    value?: Vector2
};
export type TransformOptions = {
    globalPosition?: Vector2,
    //localPosition?: Vector2,
    rotation?: RotationOptions,
    scale?: ScaleOptions
};
export type SpriteOptions = {
    image: HTMLImageElement,
    width: number,
    height: number,
    alpha?: number,
    rotation?: number,
    layer?: number,
    active?: boolean,
    blocksInput?: boolean,
    scale?:Vector2
};
export type EntityActiveOptions = {
    value?: boolean
};
export type ParentOptions = {
    value?: EntityId
};
export type SceneOptions = {
    name: string,
    onLoad?: Function
    onUnload?: Function
};
export type ShapeOptions<T extends ShapeType> = {
    shape: T,
    color?: string,
    outlineEnabled?: boolean,
    outlineWidth?: number,
    outlineColor?: string,
    alpha?: number,
    active?: boolean,
    layer?: number,
    blocksInput?: false
};
export type RectangleOptions = {
    width?: number,
    height?: number,
    centered?: boolean,
    rotation?: number,
    rounded?:boolean,
    roundRadius?:number
};
export type CircleOptions = {
    radius?: number
};
export type TriangleOptions = {
    p1?: Vector2,
    p2?: Vector2,
    p3?: Vector2,
    centered?: boolean,
    rotation?: number
};
export type TextOptions = {
    content?: string,
    size?: number,
    color?: string,
    outlineEnabled?: boolean,
    outlineWidth?: number,
    outlineColor?: string,
    alpha?: number,
    active?: boolean,
    layer?: number,
    rotation?: number,
    style?: string,
    maxWidth?: number
};
export type ButtonOptions = {
    pressArea?: Vector2
    onJustPressed?: Function,
    onPress?: Function,
    onReleased?: Function,
    onJustHovered?: Function,
    onHovered?: Function,
    onHoveredReleased?: Function,
    showPressArea?: boolean,
    pressAreaShowColor?: string,
    layer?: number,
    active?: boolean,
    changeCursorToPointer?: boolean
};
/*
export type RectButtonOptions = {
    button?:Button,
    shape?:Shape,
    text?:Text
};
*/
export type AlignmentOptions ={
    alignmentHorizontal?:AlignmentHorizontal,
    alignmentVertical?:AlignmentVertical,
    offset?:Vector2
};
export type ParticleContainerOptions = {
    maxNumber?: number,
    img: HTMLImageElement, //TEXTURE
    minScaleRange?: Vector2,
    maxScaleRange?: Vector2,
    minSpeedRange?: number,
    maxSpeedRange?: number,
    minLifeTimeRange?: number,
    maxLifeTimeRange?: number,
    minAlphaRange?: number,
    maxAlphaRange?: number,
    minRotationRange?: number,
    maxRotationRange?: number
    alphaReductionRate?: number,
    duration?:number
};
export type ParticleOptions = {
    lifeTime: number,
    velocity: Vector2,
    alphaReductionRate: number;
};
//FUNCTION OPTION TYPES
export type playAudioOptions = {
    key:string,
    loop?:boolean,
    volume?:number
}