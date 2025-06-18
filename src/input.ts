import { Engine } from "./engine";
import { Vector2 } from "./types";
export class Input {
    private engine: Engine;
    private position: Vector2 = { x: 0, y: 0 };
    private justPressed: boolean = false;//just pressed, used to detect clicks
    private pressed: boolean = false;// currently pressing
    private justReleased: boolean = false;//just released, used to detect mouse leaves
    constructor(engine: Engine) {
        this.engine = engine;

        this.start();
    };
    start() {
        this.engine.addUpdateFunction(this.update.bind(this));
        this.addListeners();
    };
    update() {
        //console.log("JUST PRESSED:", this.justPressed);
        //console.log("PRESSED:", this.pressed);
        //console.log("JUST RELEASED", this.justReleased);
        //console.log("POS", this.x, this.y);

    };
    updatePos(clientX: number, clientY: number) {
        const canvas: HTMLCanvasElement = this.engine.getCanvas();
        const rect: DOMRect = canvas.getBoundingClientRect();
        this.position.x = clientX - rect.left;
        this.position.y = clientY - rect.top;
    };
    addListeners() {
        const pressedListeners = ['mousedown', 'touchstart'];
        const moveListeners = ['mousemove', 'touchmove'];
        const releasedListeners = ['mouseup', 'touchend'];

        pressedListeners.forEach((event) => {
            this.engine.getCanvas().addEventListener(event, (e: Event) => {
                if (e instanceof MouseEvent) {
                    this.updatePos(e.clientX, e.clientY);
                }
                else if (e instanceof TouchEvent) {
                    this.updatePos(e.touches[0].clientX, e.touches[0].clientY);
                }
                this.justPressed = true;
                this.pressed = true;
            }, { passive: true });
        });

        moveListeners.forEach((event) => {// dont change press bools
            this.engine.getCanvas().addEventListener(event, (e: Event) => {
                if (e instanceof MouseEvent) {
                    this.updatePos(e.clientX, e.clientY);
                }
                else if (e instanceof TouchEvent) {
                    this.updatePos(e.touches[0].clientX, e.touches[0].clientY);
                }
            }, { passive: true });
        });

        releasedListeners.forEach((event) => {// dont change press bools
            this.engine.getCanvas().addEventListener(event, () => {
                this.justReleased = true;
                this.pressed = false;
            });
        });
    };
    resetStates() {
        this.justPressed = false;//reset
        this.justReleased = false;//reset
    }
    isOver(x: number, y: number, w: number, h: number) {
        return (
            this.position.x >= x &&
            this.position.x <= x + w &&
            this.position.y >= y &&
            this.position.y <= y + h
        );
    };
    //GETTERS
    getPosition(): Vector2 {
        return this.position;
    }
    getJustPressed(): boolean {
        return this.justPressed;
    };
    getPressed(): boolean {
        return this.pressed;
    };
    getJustReleased(): boolean {
        return this.justReleased;
    };
};