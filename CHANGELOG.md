# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.11] - 2025-06-16
## Added
- Added `centered` property to both `Rectangle` and `Triangle` class.
- Can access the `centered` property using:
```ts

const engine: Engine = new Engine(engineOptions);
const em = engine.getEntityManager();
const entityTemplates = new EntityTemplates(engine);
const rectId:EntityId = entityTemplates.createRectangleEntity(50,50);
const shape = em.getComponent(rectId,Shape);
if(shape){
    const rectShape = shape.shape;
    if(rectShape instanceOf Rectangle){
        console.log("Is centering enabled? ",rectShape.centered);
    }
}

```
- By default the `centered` property is set to true and all shapes are centered.
- Added `rotation`property to `Rectangle` and `Triangle` components allowing user to rotate the shapes.
The rotation is passed in deg and is automatically converted into radians.
The user can rotation the shapes using:
```ts

const engine: Engine = new Engine(engineOptions);
const em = engine.getEntityManager();
const entityTemplates = new EntityTemplates(engine);
const rectId:EntityId = entityTemplates.createRectangleEntity(50,50);
const shape = em.getComponent(rectId,Shape);
if(shape){
    const rectShape = shape.shape;
    if(rectShape instanceOf Rectangle){
        rectShape.rotation = 30;//rotated 30deg from right
    }
}

```
- The `scale` property in `Transform` now scales the shapes and sprites both horizontally and vertically.

## [0.0.10] - 2025-06-14
## Added
- Fixed `createShapeEntity` , `createCircleEntity` and `createTriangleEntity` to return entityId upon creation.
- Fixed `EntityId` import. Can now import `EntityId` as a type using `import type {EntityId} from 'piton-Engine'`.

## [0.0.9] - 2025-06-14
### Added
- Fixed `loadScene` function to enable and disable scenes(It was just calling unLoad and load fn's of scenes).
- Added `Shape` , `Rectangle` , `Circle` and `Triangle` components for shapes.
- Added `createShapeEntity` , `createCircleEntity` and `createTriangleEntity` fns in `entityTemplates.ts`.
- Added `rectangleRenderingSystem` , `circleRenderingSystem`and `triangleRenderingSystem` in `systems.ts`.


## [0.0.8] - 2025-06-13
### Added
- Introduced `CHANGELOG.md` to the project.
- Fixed some component types, making their values optional and set by default.
- Added `EntityActive` component to keep track of active entities.
- Added `active` property in `Sprite` component. Now you can toggle visibility of just sprites.
- Added `isEntityActive` function to check in systems whether a `Entity` or it's `Parent` is active before processing it.
- Added `addParent` component to assign a `Parent` to an entity.
- Added `Scene` component.
- Added `loadScene` , `addScene` , `getSceneByName`.
- Added `createSceneEntity` function in `entityTemplates.ts`.
- Modified exisiting entity templates to take in account components such as `Active` , `Parent`, `Children`.

## [0.0.7] - [Untracked]
### Note
- Versions before `0.0.7` were experimental and not formally tracked.
