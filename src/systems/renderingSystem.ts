import { EntityId, EntityManager } from "entix-ecs";
import { Engine } from "../engine";
import { Transform, Sprite, EntityActive, Shape, Rectangle, Circle, Triangle, Text, Button } from "../components";
import { Vector2 } from "../types";
import { EngineInternals } from "../internals/engineInternals";
//RENDERING

export function renderingSystem(engine: Engine) {// some total of all, uses layer filter
    const em: EntityManager = engine.getEntityManager();

    const drawCalls: {
        layer: number;
        drawFn: () => void;
    }[] = [];

    for (const id of em.getAllEntities()) {
        if (!engine.isEntityActive(id)) continue;
        const transform = em.getComponent(id, Transform);
        if (!transform) continue;

        // Handle Sprite
        const sprite = em.getComponent(id, Sprite);
        if (sprite) {
            if (!sprite.active) continue;
            drawCalls.push({
                layer: sprite.layer ?? 0,
                drawFn: () => spriteRenderingSystem(engine, id)
            });
        };
        //Handle Shapes
        const shape = em.getComponent(id, Shape);
        if (shape) {
            if (!shape.active) continue;

            const layer: number = shape.layer;
            let drawFn: (() => void) | null = null;

            if (shape.shape instanceof Rectangle) {
                drawFn = () => rectangleRenderingSystem(engine, id);
            }
            else if (shape.shape instanceof Circle) {
                drawFn = () => circleRenderingSystem(engine, id);
            }
            else if (shape.shape instanceof Triangle) {
                drawFn = () => triangleRenderingSystem(engine, id);
            }
            if (drawFn) {
                drawCalls.push({
                    layer: layer,
                    drawFn: drawFn
                });
            };
        }
        //Handle Text
        const text = em.getComponent(id, Text);
        if (text) {
            if (!text.active) return;
            drawCalls.push({
                layer: text.layer,
                drawFn: () => textRenderingSystem(engine, id)
            })
        }
        //Handle ButtonPressArea
        const button = em.getComponent(id, Button);
        if (button) {
            if (button.showPressArea) {
                drawCalls.push({
                    layer: button.layer,
                    drawFn: () => buttonPressAreaRendering(engine, id)
                })
            }
        }
    };

    drawCalls.sort((a, b) => a.layer - b.layer);

    // Execute all draw calls
    for (const draw of drawCalls) {
        draw.drawFn();
    }
};

//RENDERING SPRITE , SUB SYSTEM!
function spriteRenderingSystem(engine: Engine, id: EntityId) {
    const engineInternals = new EngineInternals(engine);
    const em: EntityManager = engine.getEntityManager();
    const transform = em.getComponent(id, Transform,true);
    const sprite = em.getComponent(id, Sprite,true);
    engineInternals.drawSprite(transform, sprite);
};

//RENDERING RECTANGLES, SUB SYSTEM!
function rectangleRenderingSystem(engine: Engine, id: EntityId) {
    const em: EntityManager = engine.getEntityManager();
    const ctx = engine.getCtx();
    const transform = em.getComponent(id, Transform,true);
    const shape = em.getComponent(id, Shape,true);
    const rectangle = shape.shape;
    if ((rectangle instanceof Rectangle)) {
        const x: number = transform.globalPosition.position.x;
        const y: number = transform.globalPosition.position.y;
        const w: number = rectangle.width;
        const h: number = rectangle.height;
        const selfRotationInRadians = (Math.PI * rectangle.rotation) / 180;
        const transformRotationInRadians = (Math.PI * transform.rotation.value) / 180
        const totalRotationInRadians = selfRotationInRadians + transformRotationInRadians;
        const offset: Vector2 = {
            x: rectangle.centered ? -w / 2 : 0,
            y: rectangle.centered ? -h / 2 : 0
        }

        ctx.save();

        //SHAPE
        ctx.fillStyle = shape.color;
        ctx.globalAlpha = shape.alpha;

        ctx.beginPath();

        ctx.translate(x, y);

        ctx.rotate(totalRotationInRadians);

        ctx.scale(transform.scale.value.x, transform.scale.value.y);

        if (rectangle.rounded) {
            ctx.roundRect(offset.x, offset.y, w, h, rectangle.roundedRadius);
        }
        else {
            ctx.rect(offset.x, offset.y, w, h);
        }


        ctx.fill();

        ctx.closePath();

        //OUTLINE

        if (shape.outlineEnabled) {
            ctx.strokeStyle = shape.outlineColor;
            ctx.lineWidth = shape.outlineWidth;

            ctx.beginPath();

            if (rectangle.rounded) {
                ctx.roundRect(offset.x, offset.y, w, h, rectangle.roundedRadius);
            }
            else {
                ctx.rect(offset.x, offset.y, w, h);
            }


            ctx.stroke();

            ctx.closePath();
        };

        ctx.restore();
    }
    else {
        console.warn("SHAPE IS NOT A RECTANGLE BUT IS IN RECTANGLE RENDERING SYSTEM! " + id);
    }

};

//RENDERING CIRCLES, SUB SYSTEM! 
function circleRenderingSystem(engine: Engine, id: EntityId) {
    const em: EntityManager = engine.getEntityManager();
    const ctx = engine.getCtx();
    const transform = em.getComponent(id, Transform,true);
    const shape = em.getComponent(id, Shape,true);
    if ((shape.shape instanceof Circle)) {
        const x: number = transform.globalPosition.position.x;
        const y: number = transform.globalPosition.position.y;
        const r: number = shape.shape.radius;

        ctx.save();

        //SHAPE

        ctx.fillStyle = shape.color;
        ctx.globalAlpha = shape.alpha;

        ctx.beginPath();

        ctx.translate(x, y);

        ctx.scale(transform.scale.value.x, transform.scale.value.y);

        ctx.arc(0, 0, r, 0, Math.PI * 2);

        ctx.fill();

        ctx.closePath();

        //OUTLINE

        if (shape.outlineEnabled) {
            ctx.strokeStyle = shape.outlineColor;
            ctx.lineWidth = shape.outlineWidth;

            ctx.beginPath();

            ctx.arc(0, 0, r, 0, Math.PI * 2);

            ctx.stroke();

            ctx.closePath();
        }

        ctx.restore();
    }
    else {
        console.warn("SHAPE IS NOT A CIRCLE BUT IS IN RECTANGLE RENDERING SYSTEM! " + id);
    }
};

//RENDERING TRIANGLES, SUB SYSTEM!

function triangleRenderingSystem(engine: Engine, id: EntityId) {
    const em: EntityManager = engine.getEntityManager();
    const ctx = engine.getCtx();
    const transform = em.getComponent(id, Transform,true);
    const shape = em.getComponent(id, Shape,true);
    const triangle = shape.shape;
    if (!(triangle instanceof Triangle)) {
        console.warn("SHAPE IS NOT A TRIANGLE BUT IS IN TRIANGLE RENDERING SYSTEM! " + id);
        return;
    }

    const pos = transform.globalPosition.position;
    const selfRotationInRadians = (Math.PI * triangle.rotation) / 180;
    const transformRotationInRadians = (Math.PI * transform.rotation.value) / 180
    const totalRotationInRadians = selfRotationInRadians + transformRotationInRadians;

    // Step 1: calculate local triangle points relative to center or p1
    let localP1: Vector2, localP2: Vector2, localP3: Vector2;

    if (triangle.centered) {
        const centroid = {
            x: (triangle.p1.x + triangle.p2.x + triangle.p3.x) / 3,
            y: (triangle.p1.y + triangle.p2.y + triangle.p3.y) / 3,
        };

        localP1 = { x: triangle.p1.x - centroid.x, y: triangle.p1.y - centroid.y };
        localP2 = { x: triangle.p2.x - centroid.x, y: triangle.p2.y - centroid.y };
        localP3 = { x: triangle.p3.x - centroid.x, y: triangle.p3.y - centroid.y };
    } else {
        // treat p1 as origin
        localP1 = { x: 0, y: 0 };
        localP2 = { x: triangle.p2.x - triangle.p1.x, y: triangle.p2.y - triangle.p1.y };
        localP3 = { x: triangle.p3.x - triangle.p1.x, y: triangle.p3.y - triangle.p1.y };
    }

    // Step 2: draw using local coordinates, then translate/rotate
    ctx.save();

    ctx.fillStyle = shape.color;
    ctx.globalAlpha = shape.alpha;

    ctx.translate(pos.x, pos.y);
    ctx.rotate(totalRotationInRadians);
    ctx.scale(transform.scale.value.x, transform.scale.value.y);

    ctx.beginPath();
    ctx.moveTo(localP1.x, localP1.y);
    ctx.lineTo(localP2.x, localP2.y);
    ctx.lineTo(localP3.x, localP3.y);
    ctx.closePath();
    ctx.fill();

    if (shape.outlineEnabled) {
        ctx.strokeStyle = shape.outlineColor;
        ctx.lineWidth = shape.outlineWidth;

        ctx.beginPath();
        ctx.moveTo(localP1.x, localP1.y);
        ctx.lineTo(localP2.x, localP2.y);
        ctx.lineTo(localP3.x, localP3.y);
        ctx.closePath();
        ctx.stroke();
    }

    ctx.restore();
};

//TEXT RENDERING SYSTEM, SUB SYSTEM!

function textRenderingSystem(engine: Engine, id: EntityId) {
    const em: EntityManager = engine.getEntityManager();
    const ctx: CanvasRenderingContext2D = engine.getCtx();
    const transform = em.getComponent(id, Transform,true);
    const text = em.getComponent(id, Text,true);

    const pos: Vector2 = transform.globalPosition.position;
    const selfRotationInRadians = (Math.PI * text.rotation) / 180;
    const transformRotationInRadians = (Math.PI * transform.rotation.value) / 180
    const totalRotationInRadians = selfRotationInRadians + transformRotationInRadians;

    ctx.save();

    ctx.translate(pos.x, pos.y);
    ctx.rotate(totalRotationInRadians);
    ctx.scale(transform.scale.value.x, transform.scale.value.y);

    //DRAWING TEXT

    ctx.beginPath();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = text.color;
    ctx.font = `${text.size}px ${text.style}`;
    ctx.fillText(text.content, 0, 0, text.maxWidth);
    ctx.closePath();

    //OUTLINE

    if (text.outlineEnabled) {
        ctx.beginPath();
        ctx.strokeStyle = text.outlineColor;
        ctx.lineWidth = text.outlineWidth;
        ctx.font = `${text.size}px ${text.style}`;
        ctx.strokeText(text.content, 0, 0, 50);
        ctx.closePath();
    }

    ctx.restore();
};

//BUTTON PRESSAREA RENDEING, SUB SYSTEM!

function buttonPressAreaRendering(engine: Engine, id: EntityId) {
    const em: EntityManager = engine.getEntityManager();
    const ctx: CanvasRenderingContext2D = engine.getCtx();
    const transform = em.getComponent(id, Transform,true);
    const button = em.getComponent(id, Button,true);
    const pos: Vector2 = transform?.globalPosition.position;
    const w: number = button.pressArea.x;
    const h: number = button.pressArea.y;
    const rotationInRadians: number = (Math.PI * transform.rotation.value) / 180;
    if (button.showPressArea) {
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(rotationInRadians);
        ctx.scale(transform.scale.value.x, transform.scale.value.y);
        ctx.beginPath();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = button.pressAreaShowColor;
        ctx.rect(-w / 2, -h / 2, button.pressArea.x, button.pressArea.y);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    };
}