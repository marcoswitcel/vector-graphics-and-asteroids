import { KeyBoardInputInterface } from './keyboard-input-interface.js';


const htmlMarkup = `
<div class="c-gamepad-root">
    <div class="c-gamepad-directionals">
        <button class="c-gamepad-root__button KeyA" type="button">a</button>
        <button class="c-gamepad-root__button KeyS" type="button">s</button>
        <button class="c-gamepad-root__button KeyW" type="button">w</button>
        <button class="c-gamepad-root__button KeyD" type="button">d</button>
    </div>
    <button class="c-gamepad-root__button vStart" type="button">start</button>
    <button class="c-gamepad-root__button Space" type="button">space</button>
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
.c-gamepad-root__button.KeyA, .c-gamepad-root__button.KeyD {
    height: 0.61in;
    width: 0.45in;
    transform: translateY(-50%);
}
.c-gamepad-root__button.active  {
    background-color: rgba(212, 212, 212, .5);
    box-shadow: inset 0 0 17px rgba(0, 0, 0, 0.1);
}
.c-gamepad-root__button.Space {
    border-radius: 50%;
    width: 0.75in;
    height: 0.75in;
    align-self: center;
}
.c-gamepad-root__button.Space.active {
    transform: scale(0.97); 
}
.c-gamepad-root__button.vStart {
    align-self: center;
    height: 0.31in;
}
`;


type VirtualKeys = 'KeyA' | 'KeyW' | 'KeyS' | 'KeyD' | 'Space' | 'vStart';
type KeyStateObject = { [key in VirtualKeys]: boolean };

export const vKeys: VirtualKeys[] = [ 'KeyA', 'KeyW', 'KeyS', 'KeyD', 'Space', 'vStart' ];

/**
 * Essa classe representa o gamepad virtual projetado na tela no caso de detectar o dispositivo como
 * 'mobile'. Poderia ser adaptada para outro layouts de controles ou até mesmo deixada mais configurável,
 * mas tal trabalho ainda não foi feito. 
 */
export class VirtualGamepad implements KeyBoardInputInterface {
    private keyState: KeyStateObject = { KeyA: false, KeyW: false, KeyS: false, KeyD: false, Space: false, vStart: false, };
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
                this.startListening();
            }
            this.gamepadRoot.setAttribute('data-gamepad', '');
            this.gamepadRoot.remove();
            this.target.appendChild(this.gamepadRoot);
        }
    }

    /**
     * 
     * @param gamepadRoot 
     */
    startListening() {
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

    addListener(name: string, handler: (event: Event) => void) {
        // @todo João, checar se faz sentido deixar esse warn aqui
        const vKey = name.replace(/(keydown\.|keyup\.)/i, '');
        if (!(vKeys as string[]).includes(vKey)) console.warn(`[virtual-gamepad] Key '${vKey}' não reconhecida. Evento: ${name}`);

        this.eventTarget.addEventListener(name, handler);
    }

    isKeyPressed(vKey: VirtualKeys) {
        return this.keyState[vKey];
    }

    stopListening() {
        throw new Error('Não implementado')
    }

    removeListener(name: string, handler: (event: Event) => void): void {
        // @note João, não testado
        this.eventTarget.removeEventListener(name, handler)
    }

    areBothKeysPressed(vKey1: VirtualKeys, vKey2: VirtualKeys): boolean {
        return this.keyState[vKey1] && this.keyState[vKey2];
    }
}