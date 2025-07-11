# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.16] - [2025-07-7]
## Added
- Added `domInteracted` and `onDOMInteractionFunctions` variables in `engine.ts`.
- Added private `waitForDOMInteraction()` to check and trigger `domInteracted` in `engine.ts`.
- Added type `playAudioOptions` in `types.ts`.
- Added `playAudio()` in `engine.ts`, Checks for `domInteraction` before playing audio.
- Added `removeChildrenReclusively()` & `unlinkFromParent()` in `engineInternals.ts`.
- Added `removeEntityWithCleanup()` in engine.ts to remove entity and calls `removeChildrenReclusively()` & `unlinkFromParent()`.
- Added `ParticleContainer` and `Particle` components in `components.ts`.
- Added `ParticleContainerOptions` and `ParticleOptions` in `types.ts`.
- Added `particleSimulationSystem()` and `particleRemovalSystem()` in `particleSimulationSystem.ts` & `particleRemovalSystem.ts` respectively.
- Added `storageManager.ts` with a storage system.
- Added `createParticleContainerEntity()` in `EntityTemplates` to create particles and run them.
- Added overloads for `getSceneByName()` and `getChildWithComponent()` to take a strict parameter to avoid null checks.
Example:
```ts
const sceneId:EntityId = engine.getSceneByName('scene',true); //STRICT, ALWAYS RETURNS VALUE ELSE NULL ERROR
const childId:EntityId = engine.getChildWithComponent(sceneId,Transform,true);
```
## Fixed
- Added check in `addStartFunction()` and `addUpdateFunction()` to prevent adding function if already added.
- Implemented `Shape` component to a generic which extends `ShapeType`.

## [0.0.15] - [2025-06-26]
## Added
- Added `AlignmentHorizontal` and `AlignmentVertical` types in `types.ts`.
- Added `Alignment` component in component.ts.
- Added `alignmentSystem.ts` in `systems/alignmentSystem.ts`.
- Added `getEntitySize` , `isEntityCentered` and `calculatedAlignedPosition` in `engine.ts`.
- Added circle and triangle support in `isEntityBlockingInput`.
- Added `getRandomInt()` and `getRandomFloat`() To get random numbers in a range.
## Removed
- Removed `Parent` component from scene template in `EntityTemplates.createSceneEntity()`.
## Changed
- Changed `EntityTemplates.createRectButtton` to have the text as a separate child entity.
## Fixed
- Fixed not able to assign first entity as a Parent in `EntityTemplates`.
- Fixed use of `maxWidth` property of `Text` in `textRenderingSystem` in `systems/renderingSystem.ts`.
- Fixed `isEntityBlockingInput` to take centered property into account.(It was only working when rectangle shape was centered).


## [0.0.14] - [2025-06-18]
## Fixed
- Update running before start is finished loading assets(Properly Fixed!).

## [0.0.13] - [2025-06-18]
## Fixed
- Update running before start is finished loading assets.


## [0.0.12] - [2025-06-18]
## Added
- Added basic input system for touch and mouse press.
- Added `Input` class. Can get input class using `const input = engine.getInput()`;
- Use `input.getJustPressed()`, `input.getPressed()` and `input.getJustReleased()` for click or touch detection.
- `input.getJustPressed()` returns true once after a press is detected. Is used to chheck whether a click happend.
- `input.getPressed()` returns true as long as input is pressed.
- `input.getReleased()` returns true once after a press is released.
- Use `input.getPosition()` to get position of current or last pressed location.
- Added `Text` component. Can now spawn text using `createTextEntity` under `EntityTemplates`.
- Added Button component. 
- Added `createRectButton` and `createTexturedButton` functions in `EntityTemplates`.
- Added `buttonActiveSystem` in systems folder to process button input.
- Added `rounded` and `roundedRadius` property under `Rectangle` class. Can now use rounded rect for shapes.
## Removed
- Removed `localPosition` in `Transform` as it was useless for now. Might reimplement in future.

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
