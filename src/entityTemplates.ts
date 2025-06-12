import { EntityId, EntityManager } from "entix-ecs";
import { Engine } from "./engine";
import { Sprite, Transform } from "./components";

export class EntityTemplates {
    private engine:Engine;
    private em:EntityManager;;
    constructor(engine:Engine){
        this.engine = engine;
        this.em = engine.getEntityManager();
    };
    createEmptyEntity():EntityId{// creates a entity with basic Transform component
        const id:EntityId =  this.em.createEntity();// new entity created
        this.em.addComponent(id,Transform, new Transform({}));
        return id;
    };
    createSpriteEntity(image:HTMLImageElement,width:number,height:number){
        const id:EntityId = this.em.createEntity();
        this.em.addComponent(id,Transform, new Transform({}));
        this.em.addComponent(id,Sprite,new Sprite({
            image:image,
            width:width,
            height:height
        }));
        return id;
    };
}