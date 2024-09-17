import { KeyBoardInputInterface } from './keyboard-input-interface.js';

/**
 * @todo João, aumentar tamanho dos botões, testar usar polegadas como unidade de medida -- ok
 * @todo João, ajustar para acionar o botão ao passar o dedo por cima do botão - ok
 * @todo João, ajustar para o feedback visual ocorrer ao passar o dedo em cima do botão -- ok
 * @todo João, subir os botões direcionais um pouco mais, mudar a cor, considerar adicionar um padding entre eles e alinhar o botão de espaço.
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
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    font-size: .15in;
    width: 100vw;
    max-width: 5in;
    justify-content: space-between;
    padding: 0 5vw 7vh 5vw;
    box-sizing: border-box;
    user-select: none;
    touch-action: none; /* desabilita ações touch pra lidar com pointer events */
}
.c-gamepad-directionals {
    display: flex;
    font-size: inherit;
    flex-wrap: wrap;
    flex-direction: column-reverse;
    height: 1.2in;
}
.c-gamepad-root__button {
    background-color: rgba(212, 212, 212, .76);
    border: none;
    outline: none;
    border-radius: 10%;
    font-size: inherit;
    width: 0.5in;
    height: 0.6in;
    /* color: transparent; */
    transition: all 0.1s ease-out;
    box-shadow: inset 0 0 17px rgba(255, 255, 255, 0.9);
}
.c-gamepad-root__button.a, .c-gamepad-root__button.d {
    height: 0.61in;
    width: 0.45in;
    transform: translateY(-50%);
}
.c-gamepad-root__button.active  {
    background-color: rgba(212, 212, 212, .5);
    box-shadow: inset 0 0 17px rgba(0, 0, 0, 0.1);
}
.c-gamepad-root__button.space {
    border-radius: 50%;
    width: 0.75in;
    height: 0.75in;
    align-self: center;
}
`;


type VirtualKeys = 'a' | 'w' | 's' | 'd' | 'space';
type KeyStateObject = { [key in VirtualKeys]: boolean };

export const vKeys: VirtualKeys[] = [ 'a', 'w', 's', 'd', 'space' ];

export class VirtualGamepad implements KeyBoardInputInterface {
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
            const button = this.gamepadRoot.querySelector<HTMLElement>(`.c-gamepad-root__button.${vKey}`)
        
            if (button) {
                button.addEventListener('pointerdown', (event) => {
                    this.keyState[vKey] = true;
                    // @note João, avaliar o impacto, porém parece o correto não disparar ao pressionar,
                    // usar os eventos de 'pointerenter' e 'pointerout' funcionar melhor 
                    // this.eventTarget.dispatchEvent(new Event(`keydown.${vKey}`));

                    button.classList.add('active');
                    
                    button.releasePointerCapture(event.pointerId);
                });
                
                button.addEventListener('pointerup', () => {
                    this.keyState[vKey] = false;
                    // @note João, avaliar o impacto, porém parece o correto não disparar ao pressionar,
                    // usar os eventos de 'pointerenter' e 'pointerout' funcionar melhor 
                    // this.eventTarget.dispatchEvent(new Event(`keyup.${vKey}`))

                    button.classList.remove('active');
                });

                /**
                 * @todo João, avaliar o que pode ser feito para não ficar estranho no PC, pois só passar o mouse
                 * por cima do botão e acionar o 'buttonPressed' não é intuitivo. Mas no mobile ficou legal.
                 */
                button.addEventListener('pointerenter', () => {
                    this.keyState[vKey] = true;
                    this.eventTarget.dispatchEvent(new Event(`keydown.${vKey}`));
                    
                    button.classList.add('active');
                });

                button.addEventListener('pointerout', () => {
                    this.keyState[vKey] = false;
                    this.eventTarget.dispatchEvent(new Event(`keyup.${vKey}`))
                    
                    button.classList.remove('active');
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

    stopListening(): void {
        // @todo João, implementar
        throw new Error("Não implementado");
    }

    areBothKeysPressed(vKey1: VirtualKeys, vKey2: VirtualKeys): boolean {
        return this.keyState[vKey1] && this.keyState[vKey2];
    }
}