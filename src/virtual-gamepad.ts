
/**
 * @todo João, aumentar tamanho dos botões, testar usar polegadas como unidade de medida.
 * @todo João, ajustar para acionar o botão ao passar o dedo por cima do botão.
 */

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
    font-size: .15in;
    width: 100vw;
    justify-content: space-between;
    user-select: none;
}
.c-gamepad-directionals {
    display: flex;
    font-size: inherit;
    flex-wrap: wrap;
    flex-direction: column-reverse;
    height: 1.2in;
}
.c-gamepad-root__button {
    background-color: rgba(0, 0, 255, .1);
    border: none;
    outline: none;
    border-radius: 5%;
    font-size: inherit;
    width: 0.5in;
    height: 0.6in;
    /* color: transparent; */
}
.c-gamepad-root__button.a, .c-gamepad-root__button.d {
    height: 0.61in;
}
.c-gamepad-root__button:active {
    background-color: rgba(0, 0, 255, .05);
}
.c-gamepad-root__button.space {
    border-radius: 50%;
    width: 0.5in;
    height: 0.5in;
}
`;


type VirtualKeys = 'a' | 'w' | 's' | 'd' | 'space';
type KeyStateObject = { [key in VirtualKeys]: boolean };

export const vKeys: VirtualKeys[] = [ 'a', 'w', 's', 'd', 'space' ];

export class VirtualGamepad {
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

                /**
                 * @todo João, avaliar o que pode ser feito para não ficar estranho no PC, pois só passar o mouse
                 * por cima do botão e acionar o 'buttonPressed' não é intuitivo. Mas no mobile ficou legal.
                 */
                button.addEventListener('touchenter', () => {
                    this.keyState[vKey] = true;
                    this.eventTarget.dispatchEvent(new Event(`keydown.${vKey}`));
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