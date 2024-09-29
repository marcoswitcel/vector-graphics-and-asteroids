import { Entity } from './entity.js';
import { makeShipBackwardsFigure, makeShipForwardFigure, makeShipStandingFigure } from './figure.js';

/**
 * @todo João, avaliar o que o mais mover para dentro dessa classe
 */
export class GameContext {
    playerAcceleration = { x: 0, y: 0.45 };
    entityPlayer = new Entity({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, 0, 'player', 0.07, 0.08);
    isPlayerMoving = false;
    isPlayerMovingForward = false;
    shootWaitingToBeEmmited = false;
    
    shipStandingFigure = makeShipStandingFigure();
    shipForwardFigure = makeShipForwardFigure();
    shipBackwardsFigure = makeShipBackwardsFigure();
    
    entities = [ this.entityPlayer ];
    asteroidsDestroyedCounter = 0;
    waveIndex = 0;

    isPaused = false;
}
