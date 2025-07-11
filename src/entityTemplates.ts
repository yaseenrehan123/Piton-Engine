import { EntityId, EntityManager } from "entix-ecs";
import { Engine } from "./engine";
import { Children, Circle, EntityActive, Parent, Rectangle, Scene, Shape, Sprite, Transform, Triangle, Text, Button, Alignment, ParticleContainer, Particle } from "./components";
import { ParticleContainerOptions, Vector2 } from "./types";

export class EntityTemplates {
    private engine: Engine;
    private em: EntityManager;;
    constructor(engine: Engine) {
        this.engine = engine;
        this.em = engine.getEntityManager();
    };
    createEmptyEntity(parent?: EntityId): EntityId {// creates a entity with basic Transform component
        const id: EntityId = this.em.createEntity();// new entity created
        this.em.addComponent(id, Transform, new Transform({}));
        this.em.addComponent(id, EntityActive, new EntityActive({}));
        this.em.addComponent(id, Parent, new Parent());
        this.em.addComponent(id, Children, new Children());

        if (parent !== undefined) {//assign only if a valid parent is passed
            this.engine.addParent(id, parent);
            console.log("CREATE ENTITY ADD PARENT CALLED!");
        }
        return id;
    };
    createSpriteEntity(image: HTMLImageElement, width: number, height: number, parent?: EntityId): EntityId {//creates a basic sprite entity
        const id: EntityId = this.createEmptyEntity(parent);
        this.em.addComponent(id, Sprite, new Sprite({
            image: image,
            width: width,
            height: height
        }));

        return id;
    };
    createSceneEntity(name: string = 'unnamedScene'): EntityId {// creates a scene entity
        const id: EntityId = this.em.createEntity();
        this.em.addComponent(id, Transform, new Transform({}));
        this.em.addComponent(id, EntityActive, new EntityActive({}));
        this.em.addComponent(id, Scene, new Scene({ name: name }));
        this.em.addComponent(id, Children, new Children());
        this.engine.addScene(id);
        return id;
    };
    createRectangleEntity(width: number, height: number, parent?: EntityId): EntityId {
        const id: EntityId = this.createEmptyEntity(parent);
        this.em.addComponent(id, Shape, new Shape({
            shape: new Rectangle({
                width: width,
                height: height
            })
        }));
        return id;
    };
    createCircleEntity(radius: number, parent?: EntityId) {
        const id: EntityId = this.createEmptyEntity(parent);
        this.em.addComponent(id, Shape, new Shape({
            shape: new Circle({
                radius: radius
            })
        }));
        return id;
    };
    createTriangleEntity(p1: Vector2, p2: Vector2, p3: Vector2, parent?: EntityId): EntityId {
        const id: EntityId = this.createEmptyEntity(parent);
        this.em.addComponent(id, Shape, new Shape({
            shape: new Triangle({
                p1: p1,
                p2: p2,
                p3: p3
            })
        }));
        return id;
    };
    createTextEntity(content: string, parent?: EntityId): EntityId {
        const id: EntityId = this.createEmptyEntity(parent);
        this.em.addComponent(id, Text, new Text({
            content: content
        }));
        return id;
    };
    createRectButtonEntity(width: number, height: number, textContent?: string, parent?: EntityId): EntityId {
        const id: EntityId = this.createEmptyEntity(parent);
        this.em.addComponent(id, Button, new Button(
            {
                pressArea: { x: width, y: height }
            }
        ));
        this.em.addComponent(id, Shape, new Shape({
            shape: new Rectangle({
                width: width,
                height: height
            }),
            blocksInput: false
        }));
        const id2: EntityId = this.createTextEntity(textContent ?? 'Text', id);
        this.em.addComponent(id2, Alignment, new Alignment({
            alignmentHorizontal: 'center',
            alignmentVertical: 'middle'
        }));
        return id;
    };
    createTexturedButtonEntity(image: HTMLImageElement, width: number, height: number, parent?: EntityId): EntityId {
        const id: EntityId = this.createEmptyEntity(parent);
        this.em.addComponent(id, Button, new Button({
            pressArea: { x: width, y: height }
        }));
        this.em.addComponent(id, Sprite, new Sprite({
            image: image,
            width: width,
            height: height,
            blocksInput: false
        }));
        return id;
    };
    createParticleContainerEntity(options: ParticleContainerOptions): { id: EntityId, instance: Function } {
        const id: EntityId = this.createEmptyEntity();
        this.em.addComponent(id, ParticleContainer, new ParticleContainer(options));

        const run: Function = () => {
            const transform = this.em.getComponent(id, Transform,true);
            const particleContainer = this.em.getComponent(id, ParticleContainer,true);

            const pos: Vector2 = transform.globalPosition.position;
            const img: HTMLImageElement = particleContainer.img;

            //ATTACH THE VALUES
            for (let i = 0; i < particleContainer.maxNumber; i++) { //CREATE CHILD PARTICLES
                const scale: Vector2 = {
                    x: this.engine.getRandomFloat(particleContainer.minScaleRange.x, particleContainer.maxScaleRange.x),
                    y: this.engine.getRandomFloat(particleContainer.minScaleRange.y, particleContainer.maxScaleRange.y)
                };
                const speed: number = this.engine.getRandomFloat(particleContainer.minSpeedRange, particleContainer.maxSpeedRange);
                const lifeTime: number = this.engine.getRandomFloat(particleContainer.minLifeTimeRange, particleContainer.maxLifeTimeRange);
                const alpha: number = this.engine.getRandomFloat(particleContainer.minAlphaRange, particleContainer.maxAlphaRange);
                const rotation: number = this.engine.getRandomFloat(particleContainer.minRotationRange, particleContainer.maxRotationRange);
                const angle: number = Math.random() * Math.PI * 2;
                const velocity: Vector2 = {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                };

                const childId: EntityId = this.createSpriteEntity(img, img.width, img.height, id);
                this.em.addComponent(childId, Particle, new Particle({
                    lifeTime: lifeTime,
                    velocity: velocity,
                    alphaReductionRate: particleContainer.alphaReductionRate
                }));

                const childTransform = this.em.getComponent(childId, Transform,true);
                const childSprite = this.em.getComponent(childId, Sprite,true);
              
                childTransform.scale.value = scale;
                childTransform.globalPosition.position = {
                    x: pos.x,
                    y: pos.y
                };
                
                childSprite.alpha = alpha;
                childSprite.rotation = rotation;
                
            }
        };
        return { id: id, instance: run };
    }
};