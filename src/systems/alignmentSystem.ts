import { EntityManager } from "entix-ecs";
import { Engine } from "../engine";
import { Alignment, Transform, Parent } from "../components";
import { EngineInternals } from "../internals/engineInternals";

export function alignmentSystem(engine: Engine) {
    const engineInternals:EngineInternals = new EngineInternals(engine);
    const em: EntityManager = engine.getEntityManager();
    //console.log("ALIGNMENT SYSTEM CALLED!");
    em.query('All', {
        transform: Transform,
        alignment: Alignment,
        parent: Parent,
    }, (id, { transform, alignment, parent }) => {
        //console.log("ALIGNMENT QUERY RAN!");
        const parentId = parent.value;
        //console.log(parentId);
        //console.log(id);
        if (parentId === null) return;
        
        const parentTransform = em.getComponent(parentId, Transform,true);

        const parentSize = engineInternals.getEntitySize(parentId);
        const childSize = engineInternals.getEntitySize(id);
        if (!parentSize || !childSize) return;

        const isParentCentered:boolean = engineInternals.isEntityCentered(parentId);
        const isChildCentered:boolean = engineInternals.isEntityCentered(id);
        const newPos = engineInternals.calculateAlignedPosition(
            parentTransform.globalPosition.position,
            parentSize,
            childSize,
            alignment,
            isParentCentered,
            isChildCentered
        );

        transform.globalPosition.position = newPos;
    });
    
}
