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
            let keyIdentifier = event.code;

            // @todo João, isso é um ajuste temporário até decidir o que fazer nesses casos...
            // o caso em questão é que teclas secundárias são identificadas pela propriedade 'key'
            // e não pela 'code' como estava sendo feito até então... pensar melhor sobre isso...
            if (event.shiftKey && keyIdentifier === 'Equal') {
                keyIdentifier = event.key;
            }

            this.keyState.set(keyIdentifier, true);
            this.eventTarget.dispatchEvent(new Event(`keydown.${keyIdentifier}`))
        });
    
        this.target.addEventListener('keyup', event => {
            let keyIdentifier = event.code;

            // @todo João, isso é um ajuste temporário até decidir o que fazer nesses casos...
            // o caso em questão é que teclas secundárias são identificadas pela propriedade 'key'
            // e não pela 'code' como estava sendo feito até então... pensar melhor sobre isso...
            if (event.shiftKey && keyIdentifier === 'Equal') {
                keyIdentifier = event.key;
            }

            this.keyState.set(keyIdentifier, false);
            this.eventTarget.dispatchEvent(new Event(`keyup.${keyIdentifier}`))
        });

        window.addEventListener('blur', this.onLostFocus);
    }

    public stopListening() {
        // @todo João, falta implementar
        throw "KeyBoardInput#stopListening não implentado ainda";
    }

    public removeListener() {
        // @todo João, falta implementar
        throw "KeyBoardInput#removeListener não implentado ainda";
    }

    public isKeyPressed(key: string) {
        return this.keyState.has(key) && !!this.keyState.get(key);
    }
    
    public areBothKeysPressed(key1: string,  key2: string) {
        return !!this.keyState.get(key1) && !!this.keyState.get(key2);
    }

    public addListener(eventTypeName: string, handler: (event: Event) => void) {
        this.eventTarget.addEventListener(eventTypeName, handler);
    }

    private onLostFocus = () => {
        this.keyState.forEach((value, key, map) => {
            if (value) {
                map.set(key, false);
            }
        });
    }
}
