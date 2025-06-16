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
    const rectangle = shape.shape;
    if ((rectangle instanceof Rectangle)) {
        const x: number = transform.globalPosition.position.x;
        const y: number = transform.globalPosition.position.y;
        const w: number = rectangle.width;
        const h: number = rectangle.height;
        const rotationInRadians = (Math.PI * rectangle.rotation) / 180
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

        ctx.rotate(rotationInRadians);

        ctx.scale(transform.scale.value.x,transform.scale.value.y);

        ctx.rect(offset.x, offset.y, w, h);

        ctx.fill();

        ctx.closePath();

        //OUTLINE

        if (shape.outlineEnabled) {
            ctx.strokeStyle = shape.outlineColor;
            ctx.lineWidth = shape.outlineWidth;

            ctx.beginPath();

            ctx.rect(offset.x, offset.y, w, h);

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

        ctx.translate(x,y);

        ctx.scale(transform.scale.value.x,transform.scale.value.y);

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
    const transform = em.getComponent(id, Transform);
    const shape = em.getComponent(id, Shape);
    if (!transform) throw new Error("TRANSFORM NULL IN TRIANGLE RENDERING SYSTEM !" + id);
    if (!shape) throw new Error("SHAPE NULL IN TRIANGLE RENDERING SYSTEM! " + id);
    const triangle = shape.shape;
    if (!(triangle instanceof Triangle)) {
        console.warn("SHAPE IS NOT A TRIANGLE BUT IS IN TRIANGLE RENDERING SYSTEM! " + id);
        return;
    }

    const pos = transform.globalPosition.position;
    const rotationInRadians = (Math.PI * triangle.rotation) / 180;

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
    ctx.rotate(rotationInRadians);
    ctx.scale(transform.scale.value.x,transform.scale.value.y);

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
