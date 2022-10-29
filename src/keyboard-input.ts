
export class KeyBoardInput {
    
    private listening = false;
    private keyState: Map<string, boolean> = new Map();
    private target: HTMLElement;
    
    constructor({ autoStart = false, target = document.body }) {
        this.target = target;
        if (autoStart) {
            this.startListening();
        }
    }

    public startListening() {
        if (this.listening) return;

        this.listening = true;
        this.target.addEventListener('keydown', event => this.keyState.set(event.key, true));
    
        this.target.addEventListener('keyup', event => {
            this.keyState.set(event.key, false);
        });

        window.addEventListener('blur', this.onLostFocus);
    }

    public stopListening() {
        // @todo João, falta implementar
        throw "KeyBoardInput#stopListening não implentado ainda";
    }

    public isKeyPressed(key: string) {
        return this.keyState.has(key) && this.keyState.get(key);
    }
    
    public areBothKeysPressed(key1: string,  key2: string) {
        return this.keyState.get(key1) && this.keyState.get(key2);
    }


    private onLostFocus = () => {
        this.keyState.forEach((value, key, map) => {
            if (value) {
                map.set(key, false);
            }
        });
    }
}
