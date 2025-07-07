import { EntityId, EntityManager } from "entix-ecs";
import { Engine } from "../engine";
import { Vector2 } from "../types";
import { Particle, Sprite, Transform } from "../components";

export function particleSimulationSystem(engine: Engine) {
    const em: EntityManager = engine.getEntityManager();
    const deltaTime: number = engine.getDeltaTime();
    //const toRemove: EntityId[] = [];

    em.query('All', { transform: Transform, sprite: Sprite, particle: Particle }, (id, { transform, sprite, particle }) => {
        if (!engine.isEntityActive(id)) return;
        const pos: Vector2 = transform.globalPosition.position;
        // Move
        pos.x += particle.velocity.x * deltaTime;
        pos.y += particle.velocity.y * deltaTime;

        // Lifetime
        particle.lifeTime -= deltaTime;
        sprite.alpha = Math.max(particle.lifeTime / particle.alphaReductionRate, 0);

        if (particle.lifeTime <= 0) {
            //toRemove.push(id);
        }
    });
    /*
    for (const id of toRemove) {
        engine.removeEntityWithCleanup(id);
    }
    */
}