import { Engine } from "../engine";
import { Input } from "../input";
import { Vector2 } from "../types";

export class InputInternals {
    private engine: Engine;
    constructor(engine: Engine) {
        this.engine = engine;
    };
    
    //ISOVER

    isOver(x: number, y: number, w: number, h: number) {
        const input:Input = this.engine.getInput();
        const position:Vector2 = input.getPosition();
        return (
            position.x >= x &&
            position.x <= x + w &&
            position.y >= y &&
            position.y <= y + h
        );
    };
}