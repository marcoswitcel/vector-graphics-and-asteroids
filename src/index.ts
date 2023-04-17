import { createMainSimulation } from "./main-simulation.js";
import { createCanvas, computeResolution } from "./utils.js";

const GAME_RESOLUTION = computeResolution(0.9);
const canvas = createCanvas(GAME_RESOLUTION, GAME_RESOLUTION, document.body);

/**
 * @todo João, acredito que seria interessante explicar na tela que clicando
 * duas vezes o jogo entrará em modo fullscreen e clicando novamente ele sairá.
 */
canvas.addEventListener('dblclick', () => {
    /**
     * @note um detalhe interessante dessa implementação é que na verdade quando o usuário está com
     * zoom aplicado à página, o cheque lógico abaixo não produz o resultado correto. Por isso adicionei
     * o atributo depreciado do documento `document.fullscreen` ao cheque, quando presente ele será
     * mais confiável.
     */
    const isFullScreen = document.fullscreen || (window.innerWidth == screen.width && window.innerHeight == screen.height);
    if (isFullScreen) {
        window.document.exitFullscreen();
    } else {
        canvas.requestFullscreen();
    }
});

const eventLoop = createMainSimulation(canvas);

eventLoop.start();
