import { VirtualGamepad, vKeys } from './virtual-gamepad.js';

const square = document.getElementById('square');
const gamepad = new VirtualGamepad(document.body);

if (!square) throw 'Adicionar o div ao HTML';

gamepad.addGamepadToPage(true);

for (const vKey of vKeys) {
    gamepad.addListener(`keydown.${vKey}`, (event) => {
        console.log(`keydown.${vKey}`, event);
    });
    
    gamepad.addListener(`keyup.${vKey}`, (event) => {
        console.log(`keyup.${vKey}`, event);
    });
};

requestAnimationFrame(function updatePosition(time) {

    if (gamepad.isKeyPressed('KeyA')) {
        square.style.left = parseInt(getComputedStyle(square).left) - 1 + 'px';
    }

    if (gamepad.isKeyPressed('KeyD')) {
        square.style.left = parseInt(getComputedStyle(square).left) + 1 + 'px';
    }

    if (gamepad.isKeyPressed('KeyW')) {
        square.style.top = parseInt(getComputedStyle(square).top) - 1 + 'px';
    }

    if (gamepad.isKeyPressed('KeyS')) {
        square.style.top = parseInt(getComputedStyle(square).top) + 1 + 'px';
    }

    requestAnimationFrame(updatePosition);
});

