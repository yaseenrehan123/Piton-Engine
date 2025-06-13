import { EntityId, EntityManager } from "entix-ecs";
import { Engine } from "./engine";
import { Transform, Sprite, EntityActive } from "./components";

//RENDERING

export function renderingSystem(engine: Engine) {// some total of all, uses layer filter
    const em: EntityManager = engine.getEntityManager();

    const drawCalls: {
        layer: number;
        drawFn: () => void;
    }[] = [];

    for (const id of em.getAllEntities()) {
        if(!engine.isEntityActive(id)) continue;
        const transform = em.getComponent(id, Transform);
        if (!transform) continue;

        // Handle Sprite
        const sprite = em.getComponent(id, Sprite);
        if (sprite) {
            if(!sprite.active) continue;
            drawCalls.push({
                layer: sprite.layer ?? 0,
                drawFn: () => spriteRenderingSystem(engine, id)
            });
        }
    };

    drawCalls.sort((a, b) => a.layer - b.layer);

    // Execute all draw calls
    for (const draw of drawCalls) {
        draw.drawFn();
    }
};

//RENDERING SPRITE , SUB SYSTEM!
export function spriteRenderingSystem(engine: Engine, id: EntityId) {
    const em: EntityManager = engine.getEntityManager();
    const transform = em.getComponent(id, Transform);
    const sprite = em.getComponent(id, Sprite);
    if (!transform) throw new Error("TRANSFORM NULL IN SPRITE RENDERING SYSTEM!");
    if (!sprite) throw new Error("SPRITE NULL IN SPRITE RENDERING SYSTEM!");
    engine.drawSprite(transform, sprite);
}