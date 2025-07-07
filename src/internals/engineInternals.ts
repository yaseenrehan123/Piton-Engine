import { EntityManager, EntityId } from "entix-ecs";
import { Sprite, Shape, Text, Rectangle, Circle, Triangle, Scene, Transform, Alignment, Button, Children, Parent } from "../components";
import { Vector2 } from "../types";
import { Engine } from "../engine";

export class EngineInternals {
    private engine: Engine;
    constructor(engine: Engine) {
        this.engine = engine;
    };

    //DRAWSPRITE
    drawSprite(transform: Transform, sprite: Sprite) {// draws a sprite, runs in spriteRenderingSystem(auto handles sprite loading)
        const ctx: CanvasRenderingContext2D = this.engine.getCtx();
        const selfRotationInRadians = (Math.PI * sprite.rotation) / 180;
        const transformRotationInRadians = (Math.PI * transform.rotation.value) / 180
        const totalRotationInRadians = selfRotationInRadians + transformRotationInRadians;
        const pos: Vector2 = transform.globalPosition.position;
        const scaledWidth:number = sprite.scale.x * sprite.width;
        const scaledHeight:number = sprite.scale.y * sprite.height;
        ctx.save();

        ctx.translate(pos.x, pos.y);

        ctx.scale(transform.scale.value.x, transform.scale.value.y);

        ctx.globalAlpha = sprite.alpha;

        ctx.rotate(totalRotationInRadians)

        ctx.drawImage(sprite.image, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);

        ctx.restore();
    };

    //ISENTITYBLOCKINGINPUT
    isEntityBlockingInput(x: number, y: number, layer: number): boolean {
        const em = this.engine.getEntityManager();
        let blocked = false;

        // Check all Sprites
        em.query('All', { transform: Transform, sprite: Sprite }, (id, { transform, sprite }) => {
            if (!this.engine.isEntityActive(id)) return;
            if (!sprite.active || !sprite.blocksInput) return;
            if (sprite.layer <= layer) return;

            const pos = transform.globalPosition.position;
            const width = sprite.width * transform.scale.value.x;
            const height = sprite.height * transform.scale.value.y;
            const centeredX = pos.x - width / 2;
            const centeredY = pos.y - height / 2;

            if (x >= centeredX && x <= centeredX + width && y >= centeredY && y <= centeredY + height) {
                blocked = true;
            }
        });

        // Check all Shapes
        em.query('All', { transform: Transform, shape: Shape }, (id, { transform, shape }) => {
            if (!this.engine.isEntityActive(id)) return;
            if (!shape.active || !shape.blocksInput) return;
            if (shape.layer <= layer) return;

            const shapeType = shape.shape;
            if (shapeType instanceof Rectangle) {
                const width: number = shapeType.width * transform.scale.value.x;
                const height: number = shapeType.height * transform.scale.value.y;
                let pos: Vector2 = { ...transform.globalPosition.position };;
                if (shapeType.centered) {
                    pos.x -= width / 2;
                    pos.y -= height / 2;
                }

                if (x >= pos.x && x <= pos.x + width && y >= pos.y && y <= pos.y + height) {
                    blocked = true;
                }
            }
            else if (shapeType instanceof Circle) {
                const radius = shapeType.radius;
                const pos = transform.globalPosition.position;
                const scale = transform.scale.value;

                const rx = radius * scale.x;
                const ry = radius * scale.y;

                const dx = x - pos.x;
                const dy = y - pos.y;

                if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
                    blocked = true;
                }
            }
            else if (shapeType instanceof Triangle) {
                const pos = transform.globalPosition.position;
                const scale = transform.scale.value;
                const rotation = (Math.PI * (shapeType.rotation + transform.rotation.value)) / 180;

                // Step 1: get local triangle points
                let localP1: Vector2, localP2: Vector2, localP3: Vector2;

                if (shapeType.centered) {
                    const centroid = {
                        x: (shapeType.p1.x + shapeType.p2.x + shapeType.p3.x) / 3,
                        y: (shapeType.p1.y + shapeType.p2.y + shapeType.p3.y) / 3,
                    };
                    localP1 = { x: shapeType.p1.x - centroid.x, y: shapeType.p1.y - centroid.y };
                    localP2 = { x: shapeType.p2.x - centroid.x, y: shapeType.p2.y - centroid.y };
                    localP3 = { x: shapeType.p3.x - centroid.x, y: shapeType.p3.y - centroid.y };
                } else {
                    localP1 = { x: 0, y: 0 };
                    localP2 = {
                        x: shapeType.p2.x - shapeType.p1.x,
                        y: shapeType.p2.y - shapeType.p1.y
                    };
                    localP3 = {
                        x: shapeType.p3.x - shapeType.p1.x,
                        y: shapeType.p3.y - shapeType.p1.y
                    };
                }

                // Step 2: apply scale, rotation, and global position
                function transformPoint(p: Vector2): Vector2 {
                    // scale
                    let x = p.x * scale.x;
                    let y = p.y * scale.y;

                    // rotate
                    const cos = Math.cos(rotation);
                    const sin = Math.sin(rotation);
                    const rotatedX = x * cos - y * sin;
                    const rotatedY = x * sin + y * cos;

                    // translate
                    return { x: pos.x + rotatedX, y: pos.y + rotatedY };
                }

                const worldP1 = transformPoint(localP1);
                const worldP2 = transformPoint(localP2);
                const worldP3 = transformPoint(localP3);

                // Step 3: point-in-triangle test
                function isPointInTriangle(p: Vector2, a: Vector2, b: Vector2, c: Vector2): boolean {
                    const area = (a.x - p.x) * (b.y - p.y) - (b.x - p.x) * (a.y - p.y);
                    const area1 = (b.x - p.x) * (c.y - p.y) - (c.x - p.x) * (b.y - p.y);
                    const area2 = (c.x - p.x) * (a.y - p.y) - (a.x - p.x) * (c.y - p.y);
                    const hasNeg = (area < 0) || (area1 < 0) || (area2 < 0);
                    const hasPos = (area > 0) || (area1 > 0) || (area2 > 0);
                    return !(hasNeg && hasPos);
                }

                if (isPointInTriangle({ x, y }, worldP1, worldP2, worldP3)) {
                    blocked = true;
                }
            }
            // Add checks for other shape types if needed (e.g., Circle, Polygon)
        });

        return blocked;
    };

    //GETENTITYSIZE
    getEntitySize(id: EntityId): Vector2 | null {
        const em: EntityManager = this.engine.getEntityManager();
        const scene = em.getComponent(id, Scene);
        if (scene) return { x: this.engine.getCanvasBounds().x, y: this.engine.getCanvasBounds().y };

        const sprite = em.getComponent(id, Sprite);
        if (sprite) return { x: sprite.width, y: sprite.height };

        const shape = em.getComponent(id, Shape);
        if (shape) {
            const s = shape.shape;
            if (s instanceof Rectangle) return { x: s.width, y: s.height };
            if (s instanceof Circle) return { x: s.radius * 2, y: s.radius * 2 };
            if (s instanceof Triangle) {
                const minX = Math.min(s.p1.x, s.p2.x, s.p3.x);
                const maxX = Math.max(s.p1.x, s.p2.x, s.p3.x);
                const minY = Math.min(s.p1.y, s.p2.y, s.p3.y);
                const maxY = Math.max(s.p1.y, s.p2.y, s.p3.y);
                return { x: maxX - minX, y: maxY - minY };
            }
        }

        const text = em.getComponent(id, Text);
        if (text) {
            // Approximated, could use canvas.measureText for exact size
            const ctx = this.engine.getCtx(); // Access canvas context
            ctx.font = `${text.size}px ${text.style}`;
            const metrics = ctx.measureText(text.content);
            const actualWidth = Math.min(metrics.width, text.maxWidth);
            return { x: actualWidth, y: text.size };
        }

        const button = em.getComponent(id, Button);//IF THERE IS JUST BUTTON THAN USE IT FOR CENTERING
        if (button) {
            return { x: button.pressArea.x, y: button.pressArea.x };
        }

        return null;
    };

    //CALCULATE ALIGNED POSITION
    calculateAlignedPosition(
        parentPos: Vector2,
        parentSize: Vector2,
        childSize: Vector2,
        align: Alignment,
        isParentCentered: boolean,
        isChildCentered: boolean
    ): Vector2 {
        let x = parentPos.x;
        let y = parentPos.y;

        // Step 1: Shift origin if parent is centered (to get top-left)
        if (isParentCentered) {
            x -= parentSize.x / 2;
            y -= parentSize.y / 2;
        }

        // Step 2: Apply alignment from parent's top-left
        switch (align.alignmentHorizontal) {
            case 'center':
                x += parentSize.x / 2 - childSize.x / 2;
                break;
            case 'right':
                x += parentSize.x - childSize.x;
                break;
            case 'left':
            default:
                break;
        }

        switch (align.alignmentVertical) {
            case 'middle':
                y += parentSize.y / 2 - childSize.y / 2;
                break;
            case 'bottom':
                y += parentSize.y - childSize.y;
                break;
            case 'top':
            default:
                break;
        }

        // Step 3: Apply offset
        x += align.offset.x;
        y += align.offset.y;

        // Step 4: Final adjustment for centered child
        if (isChildCentered) {
            x += childSize.x / 2;
            y += childSize.y / 2;
        }

        return { x, y };
    };

    //ISENTITYCENTERED
    isEntityCentered(id: EntityId): boolean {
        const em: EntityManager = this.engine.getEntityManager();
        const scene = em.getComponent(id, Scene);
        if (scene) return false; // Scene is not centered

        const shape = em.getComponent(id, Shape);
        if (shape) {
            const s = shape.shape;
            if (s instanceof Rectangle || s instanceof Triangle) return s.centered;
            if (s instanceof Circle) return true; // Circles are centered by nature
        }

        const sprite = em.getComponent(id, Sprite);
        if (sprite) return true; // You can change this based on sprite config

        return true; // Default assumption
    };

    //REMOVE CHILDREN RECLUSIVELY *DONT NEED STRICTMODE*
    removeChildrenReclusively(id: EntityId) {
        const em: EntityManager = this.engine.getEntityManager();
        const children = em.getComponent(id, Children);
        if (children) {
            for (const childId of children.value) {
                //console.log("CHILD ID:", childId);
                if (em.hasEntity(childId)) {
                    this.engine.removeEntityWithCleanup(childId);
                }
            }
        }
    };
    
    //UNLINK FROM PARENT *DONT NEED STRICTMODE*
    unlinkFromParent(id: EntityId) {
        const em: EntityManager = this.engine.getEntityManager();
        const parent = em.getComponent(id, Parent);
        if (!parent) return;

        if (parent?.value !== null && em.hasEntity(parent.value)) {
            const parentChildren = em.getComponent(parent.value, Children);
            if (parentChildren) {
                parentChildren.value = parentChildren.value.filter(e => e !== id);
            }
        }
    }

}

