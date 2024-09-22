import { createMainSimulation } from './main-simulation.js';
import { createCanvas, computeResolution, isFullScreen, isMobileBrowser } from './utils.js';
import { VirtualGamepad } from './virtual-gamepad.js';

const resolutionScaleNonFullscreen = isMobileBrowser() ? 1 : 0.96;
const GAME_RESOLUTION = computeResolution(resolutionScaleNonFullscreen);
const canvas = createCanvas(GAME_RESOLUTION, GAME_RESOLUTION, document.body);

/**
 * @todo João, acredito que seria interessante explicar na tela que clicando
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

/**
 * @todo João, validar melhor essa funcionalidade, não tenho certeza de que escutar o evento
 * 'resize' é suficiente para saber se a nova resolução da 'window'
 */
window.addEventListener('resize', () => {
    // @todo João, se a aplicação estiver pausada o canvas é limpo e fica "transparente",
    // seria interessante pelo menos colorir o background e escrever pausado novamente.
    // Porém, por hora só tenho acesso ao EventLoop aqui, e nesse caso, só sei dizer se
    // o loop está parado. O que geralmente indica 'pausa'
    const newResolution = isFullScreen() ? computeResolution(1) : computeResolution(resolutionScaleNonFullscreen);
    
    canvas.width = newResolution;
    canvas.height = newResolution;
})

const virtualGamepad = isMobileBrowser() ? new VirtualGamepad(document.body): null;

if (virtualGamepad) {
    virtualGamepad.addGamepadToPage(true);
}

const eventLoop = createMainSimulation(canvas, virtualGamepad);

eventLoop.start();
