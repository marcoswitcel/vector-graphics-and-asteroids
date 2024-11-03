export class KeyBoardInput {
    constructor({ autoStart = false, target = document.body }) {
        this.listening = false;
        this.keyState = new Map();
        this.onLostFocus = () => {
            this.keyState.forEach((value, key, map) => {
                if (value) {
                    map.set(key, false);
                }
            });
        };
        this.target = target;
        this.eventTarget = new EventTarget();
        if (autoStart) {
            this.startListening();
        }
    }
    startListening() {
        if (this.listening)
            return;
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
            this.eventTarget.dispatchEvent(new Event(`keydown.${keyIdentifier}`));
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
            this.eventTarget.dispatchEvent(new Event(`keyup.${keyIdentifier}`));
        });
        window.addEventListener('blur', this.onLostFocus);
    }
    stopListening() {
        // @todo João, falta implementar
        throw "KeyBoardInput#stopListening não implentado ainda";
    }
    removeListener() {
        // @todo João, falta implementar
        throw "KeyBoardInput#removeListener não implentado ainda";
    }
    isKeyPressed(key) {
        return this.keyState.has(key) && !!this.keyState.get(key);
    }
    areBothKeysPressed(key1, key2) {
        return !!this.keyState.get(key1) && !!this.keyState.get(key2);
    }
    addListener(eventTypeName, handler) {
        this.eventTarget.addEventListener(eventTypeName, handler);
    }
}
