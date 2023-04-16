import { distance, drawCircle, drawComplexShape, drawLine, drawPolygon, makePolygonWithAbsolutePosition, rotatePoint, rotatePolygon, scalePolygon, Vector2 } from "./draw.js";
import { Entity, createdAtTimestamp, hittedMark, fragmentationAllowed } from "./entity.js";
import { EventLoop } from "./event-loop.js";
import { makeAsteroid, makeShipBackwardsFigure, makeShipForwardFigure, makeShipStandingFigure } from "./figure.js";
import { KeyBoardInput } from "./keyboard-input.js";
import { mainSimulation } from "./main-simulation.js";
import { createCanvas, fragmentAsteroid, computeResolution, renderFigureInside } from "./utils.js";

const GAME_RESOLUTION = computeResolution(0.9);
const canvas = createCanvas(GAME_RESOLUTION, GAME_RESOLUTION, document.body);

/**
 * @todo João, acredito que seria interessante explicar na tela que clicando
 * duas vezes o jogo entrará em modo fullscreen e clicando novamente ele sairá.
 */
canvas.addEventListener('dblclick', () => {
    const isFullScreen = (window.innerWidth == screen.width && window.innerHeight == screen.height);
    if (isFullScreen) {
        window.document.exitFullscreen();
    } else {
        canvas.requestFullscreen();
    }
});

const eventLoop = mainSimulation(canvas);

eventLoop.start();
