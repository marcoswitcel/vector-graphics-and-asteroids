import { Entity } from './entity.js';
import { makeShipBackwardsFigure, makeShipForwardFigure, makeShipStandingFigure } from './figure.js';

/**
 * @todo João, avaliar o que o mais mover para dentro dessa classe
 */
export class GameContext {
    isPlayerMoving = false;
    isPlayerMovingForward = false;
    asteroidsDestroyedCounter = 0;
    waveIndex = 0;
    isPaused = false;

    playerAcceleration = { x: 0, y: 0.45 };
    entityPlayer = new Entity({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, 0, 'player', 0.07, 0.08);
    shipStandingFigure = makeShipStandingFigure();
    shipForwardFigure = makeShipForwardFigure();
    shipBackwardsFigure = makeShipBackwardsFigure();

    shootWaitingToBeEmmited = false;

    entities = [ this.entityPlayer ];
}
