
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

class VirtualGamepad {
    private keyState = { a: false, w: false, s: false, d: false, space: false, };
    private target: HTMLElement;

    constructor(target: HTMLElement) {
        this.target = target;
    }

    addGamepadToPage() {
        const html = document.createElement('html');
        const style = document.createElement('style');

        style.innerHTML = cssStyle;
        style.dataset.gamepad = '';

        document.head.appendChild(style);
        
        html.innerHTML = htmlMarkup;
        const gamepadRoot = html.querySelector('.c-gamepad-root');

        
        if (gamepadRoot) {
            this.setupKeyListeners(gamepadRoot);
            gamepadRoot.setAttribute('data-gamepad', '');
            gamepadRoot.remove();
            this.target.appendChild(gamepadRoot);
        }
    }

    setupKeyListeners(gamepadRoot: Element) {
        for (const element of gamepadRoot.querySelectorAll('.c-gamepad-root__button.a')) {
            element.addEventListener('pointerdown', () => {
                this.keyState.a = true;
            });
            element.addEventListener('pointerup', () => {
                this.keyState.a = false;
            });
        }
    }

    startListening() {
        // @todo João, implementar
        throw "Não implementado";
    }

    addListener(name: string, handler: any) {
        // @todo João, implementar
    }
}

const gamepad = new VirtualGamepad(document.body);

gamepad.addGamepadToPage();
