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
            this.keyState.set(event.code, true);
            this.eventTarget.dispatchEvent(new Event(`keydown.${event.code}`));
        });
        this.target.addEventListener('keyup', event => {
            this.keyState.set(event.code, false);
            this.eventTarget.dispatchEvent(new Event(`keyup.${event.code}`));
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
