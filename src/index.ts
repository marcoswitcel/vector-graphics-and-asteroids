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
        document.body.classList.remove('fullscreen-mode');
        document.exitFullscreen();
    } else {
        document.body.classList.add('fullscreen-mode');
        document.body.requestFullscreen();
    }
});

/**
 * @todo João, validar melhor essa funcionalidade, não certeza de que escutando o evento
 * 'resize' é suficiente para saber a nova resolução da 'window'
 */
window.addEventListener('resize', () => {
    // @todo João, se a aplicação estiver pausada o canvas é limpo e fica "transparente",
    // seria interessante pelo menos colorir o background e escrever pausado novamente.
    // Porém, por hora só tenho acesso ao EventLoop aqui, e nesse caso, só sei dizer se
    // o loop está parado. O que geralmente indica 'pausa'
    const newResolution = isFullScreen() ? computeResolution(1) : computeResolution(0.9);
    
    canvas.width = newResolution;
    canvas.height = newResolution;
})

const eventLoop = createMainSimulation(canvas);

eventLoop.start();
