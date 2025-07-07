import { EntityManager } from "entix-ecs";
import { Engine } from "../engine";
import { ParticleContainer } from "../components";

export function particleRemovalSystem(engine:Engine){
    const em:EntityManager = engine.getEntityManager();
    const deltaTime:number = engine.getDeltaTime();
    em.query('All',{
        particleContainer:ParticleContainer
    },(id,{particleContainer})=>{
        particleContainer.counter -= deltaTime;
        if(particleContainer.counter <= 0){
            engine.removeEntityWithCleanup(id); //REMOVE SELF + CHILDREN
            //console.log("PARTICLE CONTAINER REMOVED!");
        }
    });
};