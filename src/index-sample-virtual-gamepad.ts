
class VirtualGamepad {
    private keyState = { a: false, w: false, s: false, d: false, space: false, };
    private target: HTMLElement;

    constructor(target: HTMLElement) {
        this.target = target;
    }

    addGamepadToPage() {
        const div = document.createElement('div');
        this.target.appendChild(div);
    }

    startListening() {
        // @todo João, implementar
        throw "Não implementado";
    }
}

const gamepad = new VirtualGamepad(document.body);

gamepad.addGamepadToPage();
