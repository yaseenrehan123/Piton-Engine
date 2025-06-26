import { EntityManager } from "entix-ecs";
import { Engine } from "../engine";
import { Input } from "../input";
import { Button, Transform } from "../components";
import { Vector2 } from "../types";
import { EngineInternals } from "../internals/engineInternals";
import { InputInternals } from "../internals/inputInternals";

export function buttonActionSystem(engine: Engine) {
    const engineInternals:EngineInternals = new EngineInternals(engine);
    const inputInternals:InputInternals = new InputInternals(engine);
    const em: EntityManager = engine.getEntityManager();
    const input: Input = engine.getInput();
    const ctx: CanvasRenderingContext2D = engine.getCtx();
    let anyButtonHovered: boolean = false;
    em.query('All', {
        transform: Transform,
        button: Button
    }, (id, { transform, button }) => {
        if (!engine.isEntityActive(id) || !button.active) {
            if (button.isHovered) {
                button.isHovered = false;
                button.onHoveredReleased();
            }
            return;
        };

        const pos: Vector2 = transform.globalPosition.position;
        const w: number = button.pressArea.x;
        const h: number = button.pressArea.y;
        const scaledW:number =  w * transform.scale.value.x;
        const scaledH:number = h * transform.scale.value.y;
        const centeredX: number = pos.x - w / 2;
        const centeredY: number = pos.y - h / 2;
        
        const isHovering = inputInternals.isOver(centeredX, centeredY, scaledW, scaledH);

        if (isHovering) {
            if(engineInternals.isEntityBlockingInput(input.getPosition().x, input.getPosition().y, button.layer))return;
            anyButtonHovered = true;
            if (!button.isHovered) {
                button.isHovered = true;
                button.onJustHovered();
            };
            button.onHovered();
            //JUST PRESSED
            if (input.getJustPressed()) {
                button.onJustPressed();
            };
            //PRESSED
            if (input.getPressed()) {
                button.onPress();
            };
            //JUST RELEASED
            if (input.getJustReleased()) {
                button.onJustReleased();
            }
        }
        else {
            if (button.isHovered) {
                button.isHovered = false;
                button.onHoveredReleased();
            }
        }

        if (button.changeCursorToPointer) {
            const canvas = engine.getCanvas();
            if (anyButtonHovered) {
                canvas.style.cursor = 'pointer';
            } else {
                canvas.style.cursor = 'default';
            }
        }

    });
};