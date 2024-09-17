import { KeyBoardInputInterface } from './keyboard-input-interface.js';

export class KeyBoardInput implements KeyBoardInputInterface {
    
    private listening = false;
    private keyState: Map<string, boolean> = new Map();
    private target: HTMLElement;
    private eventTarget: EventTarget;
    
    constructor({ autoStart = false, target = document.body }) {
        this.target = target;
        this.eventTarget = new EventTarget();
        if (autoStart) {
            this.startListening();
        }
    }

    public startListening() {
        if (this.listening) return;

        this.listening = true;
        this.target.addEventListener('keydown', event => {
            this.keyState.set(event.key, true);
            this.eventTarget.dispatchEvent(new Event(`keydown.${event.key}`))
        });
    
        this.target.addEventListener('keyup', event => {
            this.keyState.set(event.key, false);
            this.eventTarget.dispatchEvent(new Event(`keyup.${event.key}`))
        });

        window.addEventListener('blur', this.onLostFocus);
    }

    public stopListening() {
        // @todo João, falta implementar
        throw "KeyBoardInput#stopListening não implentado ainda";
    }

    public isKeyPressed(key: string) {
        return this.keyState.has(key) && !!this.keyState.get(key);
    }
    
    public areBothKeysPressed(key1: string,  key2: string) {
        return !!this.keyState.get(key1) && !!this.keyState.get(key2);
    }

    public addListener(eventTypeName: string, callback: () => void) {
        this.eventTarget.addEventListener(eventTypeName, callback);
    }

    private onLostFocus = () => {
        this.keyState.forEach((value, key, map) => {
            if (value) {
                map.set(key, false);
            }
        });
    }
}
