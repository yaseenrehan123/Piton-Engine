import { EntityId, EntityManager } from "entix-ecs";
import { Engine } from "./engine";
import { Children, EntityActive, Parent, Scene, Sprite, Transform } from "./components";

export class EntityTemplates {
    private engine:Engine;
    private em:EntityManager;;
    constructor(engine:Engine){
        this.engine = engine;
        this.em = engine.getEntityManager();
    };
    createEmptyEntity(parent?:EntityId):EntityId{// creates a entity with basic Transform component
        const id:EntityId =  this.em.createEntity();// new entity created
        this.em.addComponent(id,Transform, new Transform({}));
        this.em.addComponent(id,EntityActive, new EntityActive({}));
         this.em.addComponent(id,Parent,new Parent());
        this.em.addComponent(id,Children,new Children());

        if(parent){//assign only if a valid parent is passed
            this.engine.addParent(id,parent);
        }
        return id;
    };
    createSpriteEntity(image:HTMLImageElement,width:number,height:number,parent?:EntityId){//creates a basic sprite entity
        const id:EntityId = this.createEmptyEntity(parent);
        this.em.addComponent(id,Sprite,new Sprite({
            image:image,
            width:width,
            height:height
        }));
      
        return id;
    };
    createSceneEntity(name:string = 'unnamedScene'){// creates a scene entity
        const id:EntityId = this.createEmptyEntity();//do not require parent
        this.em.addComponent(id,Scene,new Scene({name:name}));
        this.em.addComponent(id,Children,new Children());
        this.engine.addScene(id);
        return id;
    };
};