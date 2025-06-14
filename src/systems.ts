import { EntityId, EntityManager } from "entix-ecs";
import { Engine } from "./engine";
import { Transform, Sprite, EntityActive, Shape, Rectangle, Circle, Triangle } from "./components";
import { Vector2 } from "./types";

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
            if (!shape.active) return;

            const layer: number = shape.layer;
            let drawFn: (() => void) | null = null;

            if (shape.shape instanceof Rectangle) {
                drawFn = () => rectangleRenderingSystem(engine, id);
            }
            else if (shape.shape instanceof Circle) {
                drawFn = () => circleRenderingSystem(engine, id);
            }
            else if(shape.shape instanceof Triangle){
                drawFn = () => triangleRenderingSystem(engine,id);
            }
            if (drawFn) {
                drawCalls.push({
                    layer: layer,
                    drawFn: drawFn
                });
            };


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
    const em: EntityManager = engine.getEntityManager();
    const transform = em.getComponent(id, Transform);
    const sprite = em.getComponent(id, Sprite);
    if (!transform) throw new Error("TRANSFORM NULL IN SPRITE RENDERING SYSTEM! " + id);
    if (!sprite) throw new Error("SPRITE NULL IN SPRITE RENDERING SYSTEM! " + id);
    engine.drawSprite(transform, sprite);
};

//RENDERING RECTANGLES, SUB SYSTEM!
function rectangleRenderingSystem(engine: Engine, id: EntityId) {
    const em: EntityManager = engine.getEntityManager();
    const ctx = engine.getCtx();
    const transform = em.getComponent(id, Transform);
    const shape = em.getComponent(id, Shape);
    if (!transform) throw new Error("TRANSFORM NULL IN RECTANGLE RENDERING STSTEM !" + id);
    if (!shape) throw new Error("SHAPE NULL IN RECTANGLE RENDERING SYSTEM! " + id);
    if ((shape.shape instanceof Rectangle)) {
        const x: number = transform.globalPosition.position.x;
        const y: number = transform.globalPosition.position.y;
        const w: number = shape.shape.width;
        const h: number = shape.shape.height;

        ctx.save();

        //SHAPE
        ctx.fillStyle = shape.color;
        ctx.globalAlpha = shape.alpha;

        ctx.beginPath();

        ctx.rect(x, y, w, h);

        ctx.fill();

        ctx.closePath();

        //OUTLINE

        if (shape.outlineEnabled) {
            ctx.strokeStyle = shape.outlineColor;
            ctx.lineWidth = shape.outlineWidth;

            ctx.beginPath();

            ctx.rect(x, y, w, h);

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
    const transform = em.getComponent(id, Transform);
    const shape = em.getComponent(id, Shape);
    if (!transform) throw new Error("TRANSFORM NULL IN RECTANGLE RENDERING STSTEM !" + id);
    if (!shape) throw new Error("SHAPE NULL IN RECTANGLE RENDERING SYSTEM! " + id);
    if ((shape.shape instanceof Circle)) {
        const x: number = transform.globalPosition.position.x;
        const y: number = transform.globalPosition.position.y;
        const r: number = shape.shape.radius;

        ctx.save();

        //SHAPE

        ctx.fillStyle = shape.color;
        ctx.globalAlpha = shape.alpha;

        ctx.beginPath();

        ctx.arc(x, y, r, 0, Math.PI * 2);

        ctx.fill();

        ctx.closePath();

        //OUTLINE

        if (shape.outlineEnabled) {
            ctx.strokeStyle = shape.outlineColor;
            ctx.lineWidth = shape.outlineWidth;

            ctx.beginPath();

            ctx.arc(x, y, r, 0, Math.PI * 2);

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
    const transform = em.getComponent(id, Transform);
    const shape = em.getComponent(id, Shape);
    if (!transform) throw new Error("TRANSFORM NULL IN RECTANGLE RENDERING STSTEM !" + id);
    if (!shape) throw new Error("SHAPE NULL IN RECTANGLE RENDERING SYSTEM! " + id);
    if ((shape.shape instanceof Triangle)) {
        const s1: Vector2 = shape.shape.s1;
        const s2: Vector2 = shape.shape.s2;
        const s3: Vector2 = shape.shape.s3;

        ctx.save();

        //SHAPE

        ctx.fillStyle = shape.color;
        ctx.globalAlpha = shape.alpha;

        ctx.beginPath();

        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
        ctx.lineTo(s3.x, s3.y);

        ctx.fill();

        ctx.closePath();

        //OUTLINE

        if (shape.outlineEnabled) {
            ctx.strokeStyle = shape.outlineColor;
            ctx.lineWidth = shape.outlineWidth;

            ctx.beginPath();

            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.lineTo(s3.x, s3.y);

            ctx.stroke();

            ctx.closePath();
        }

        ctx.restore();
    }
    else {
        console.warn("SHAPE IS NOT A TRIANGLE BUT IS IN RECTANGLE RENDERING SYSTEM! " + id);
    }
};