
const htmlMarkup = `
<div class="c-gamepad-root">
    <div class="c-gamepad-directionals">
        <button class="c-gamepad-root__button a" type="button">a</button>
        <button class="c-gamepad-root__button s" type="button">s</button>
        <button class="c-gamepad-root__button w" type="button">w</button>
        <button class="c-gamepad-root__button d" type="button">d</button>
    </div>
    <button class="c-gamepad-root__button space" type="button">space</button>
</div>
`;

const cssStyle = `
.c-gamepad-root {
    display: flex;
    position: fixed;
    left: 0;
    bottom: 0;
    font-size: 5vw;
    width: 100vw;
    justify-content: space-between;
}
.c-gamepad-directionals {
    display: flex;
    font-size: inherit;
    flex-wrap: wrap;
    flex-direction: column-reverse;
    height: 5.7em;
}
.c-gamepad-root__button {
    background-color: rgba(0, 0, 255, .1);
    border: none;
    outline: none;
    border-radius: 5%;
    font-size: inherit;
    width: 1.7em;
    height: 2.8em;
    /* color: transparent; */
}
.c-gamepad-root__button.a, .c-gamepad-root__button.d {
    height: 3em;
}
.c-gamepad-root__button:active {
    background-color: rgba(0, 0, 255, .05);
}
.c-gamepad-root__button.space {
    border-radius: 50%;
    width: 3em;
    height: 3em;
}
`;

type VirtualKeys = 'a' | 'w' | 's' | 'd' | 'space';
type KeyStateObject = { [key in VirtualKeys]: boolean };

class VirtualGamepad {
    private keyState: KeyStateObject = { a: false, w: false, s: false, d: false, space: false, };
    private target: HTMLElement;
    private eventTarget: EventTarget;
    private gamepadRoot: HTMLElement | null;
    private isHTMLSetupDone: boolean;
    private isListenersSetupDone: boolean;

    constructor(target: HTMLElement) {
        this.target = target;
        this.eventTarget = new EventTarget();
        this.isHTMLSetupDone = false;
        this.isListenersSetupDone = false;
        this.gamepadRoot = null;
    }

    addGamepadToPage(setupListeners = false) {
        if (this.isHTMLSetupDone) return;

        this.isHTMLSetupDone = true;

        const html = document.createElement('html');
        const style = document.createElement('style');

        style.innerHTML = cssStyle;
        style.dataset.gamepad = '';

        document.head.appendChild(style);
        
        html.innerHTML = htmlMarkup;
        this.gamepadRoot = html.querySelector('.c-gamepad-root');

        
        if (this.gamepadRoot) {
            if (setupListeners) {
                this.setupKeyListeners();
            }
            this.gamepadRoot.setAttribute('data-gamepad', '');
            this.gamepadRoot.remove();
            this.target.appendChild(this.gamepadRoot);
        }
    }

    /**
     * 
     * @todo João, implementar um 'cleanKeyListeners'
     * @param gamepadRoot 
     */
    setupKeyListeners() {
        if (this.gamepadRoot == null) return;
        if (this.isListenersSetupDone) return;
        if (!this.isHTMLSetupDone) return;

        this.isListenersSetupDone = true;

        const vKeys: VirtualKeys[] = [ 'a', 'w', 's', 'd', 'space' ];
        for (const vKey of vKeys) {
            const button = this.gamepadRoot.querySelector(`.c-gamepad-root__button.${vKey}`)
        
            if (button) {
                button.addEventListener('pointerdown', () => {
                    this.keyState[vKey] = true;
                    this.eventTarget.dispatchEvent(new Event(`keydown.${vKey}`));
                });
                
                button.addEventListener('pointerup', () => {
                    this.keyState[vKey] = false;
                    this.eventTarget.dispatchEvent(new Event(`keyup.${vKey}`))
                });

                button.addEventListener('pointerout', () => {
                    this.keyState[vKey] = false;
                    this.eventTarget.dispatchEvent(new Event(`keyup.${vKey}`))
                });
            }
        }

        window.addEventListener('blur', () => {
            for (const vKey of vKeys) {
                this.keyState[vKey] = false;
            }
        })
    }

    startListening() {
        // @todo João, implementar
        throw new Error("Não implementado");
    }

    addListener(name: string, handler: (event: Event) => void) {
        this.eventTarget.addEventListener(name, handler);
    }

    removeListeners(name: string, handler: (event: Event) => void) {
        // @todo João, implementar
        throw new Error("Não implementado");
    }

    isKeyPressed(vKey: VirtualKeys) {
        return this.keyState[vKey];
    }
}

const square = document.getElementById('square');
const gamepad = new VirtualGamepad(document.body);

if (!square) throw "Adicionar o div ao HTML";

gamepad.addGamepadToPage(true);

const vKeys: VirtualKeys[] = [ 'a', 'w', 's', 'd', 'space' ];
for (const vKey of vKeys) {
    gamepad.addListener(`keydown.${vKey}`, (event) => {
        console.log(`keydown.${vKey}`, event);
    });
    
    gamepad.addListener(`keyup.${vKey}`, (event) => {
        console.log(`keyup.${vKey}`, event);
    });
};

requestAnimationFrame(function updatePosition(time) {

    if (gamepad.isKeyPressed('a')) {
        square.style.left = parseInt(getComputedStyle(square).left) - 1 + 'px';
    }

    if (gamepad.isKeyPressed('d')) {
        square.style.left = parseInt(getComputedStyle(square).left) + 1 + 'px';
    }

    if (gamepad.isKeyPressed('w')) {
        square.style.top = parseInt(getComputedStyle(square).top) - 1 + 'px';
    }

    if (gamepad.isKeyPressed('s')) {
        square.style.top = parseInt(getComputedStyle(square).top) + 1 + 'px';
    }

    requestAnimationFrame(updatePosition);
});

