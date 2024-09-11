import { createMainSimulation } from './main-simulation.js';
import { createCanvas, computeResolution, isFullScreen } from './utils.js';

const GAME_RESOLUTION = computeResolution(0.9);
const canvas = createCanvas(GAME_RESOLUTION, GAME_RESOLUTION, document.body);

/**
 * @todo João, acredito que seria interessante explicar na tela que clicando
 * duas vezes o jogo entrará em modo fullscreen e clicando novamente ele sairá.
 */
canvas.addEventListener('dblclick', () => {
    if (isFullScreen()) {
        window.document.exitFullscreen();
    } else {
        canvas.requestFullscreen();
    }
});

/**
 * @todo João, validar melhor essa funcionalidade, não certeza de que escutando o evento
 * 'resize' é suficiente para saber a nova resolução da 'window'
 */
window.addEventListener('resize', () => {
    const newResolution = isFullScreen() ? computeResolution(1) : computeResolution(0.9);
    
    canvas.width = newResolution;
    canvas.height = newResolution;
})

const eventLoop = createMainSimulation(canvas);

eventLoop.start();
