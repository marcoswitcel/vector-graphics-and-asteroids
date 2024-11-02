import { resolutionScaleNonFullscreen } from './game-context.js';
import { createMainSimulation } from './main-simulation.js';
import { createCanvas, computeResolution, isFullScreen, isMobileBrowser } from './utils.js';
import { VirtualGamepad } from './virtual-gamepad.js';

const GAME_RESOLUTION = computeResolution(resolutionScaleNonFullscreen);
const canvas = createCanvas(GAME_RESOLUTION, GAME_RESOLUTION, document.body);

/**
 * @note João, acredito que seria interessante explicar na tela que clicando
 * duas vezes o jogo entrará em modo fullscreen e clicando novamente ele sairá.
 */
canvas.addEventListener('dblclick', () => {
    if (isFullScreen()) {
        document.body.classList.remove('fullscreen-mode');
        document.exitFullscreen();
    } else {
        document.body.classList.add('fullscreen-mode');
        document.body.requestFullscreen();
    }
});

/**
 * @note por segurança vou deixar essa adição de classe no 'dbclick' também
 */
document.addEventListener('fullscreenchange', () => {
    if (isFullScreen()) {
        document.body.classList.add('fullscreen-mode');
    } else {
        document.body.classList.remove('fullscreen-mode');
    }
});

const virtualGamepad = isMobileBrowser() ? new VirtualGamepad(document.body): null;

if (virtualGamepad) {
    virtualGamepad.addGamepadToPage(true);
}

const eventLoop = createMainSimulation(canvas, virtualGamepad);

eventLoop.start();
