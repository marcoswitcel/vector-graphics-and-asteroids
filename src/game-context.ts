import { makeDefaultPlayer } from './entity.js';
import { makeShipBackwardsFigure, makeShipForwardFigure, makeShipStandingFigure } from './figure.js';
import { isMobileBrowser } from './utils.js';

export const resolutionScaleNonFullscreen = isMobileBrowser() ? 1 : 0.96;

export enum GameState {
    RUNNING,
    PAUSED,
    GAME_OVER,
}

/**
 * @todo João, avaliar o que o mais mover para dentro dessa classe
 */
export class GameContext {
    playerAcceleration = { x: 0, y: 0.45 };
    entityPlayer = makeDefaultPlayer();
    isPlayerMoving = false;
    isPlayerMovingForward = false;
    shootWaitingToBeEmmited = false;
    lastShootEmmited = 0;
    
    shipStandingFigure = makeShipStandingFigure();
    shipForwardFigure = makeShipForwardFigure();
    shipBackwardsFigure = makeShipBackwardsFigure();
    
    entities = [ this.entityPlayer ];
    asteroidsDestroyedCounter = 0;
    waveIndex = 0;

    state = GameState.RUNNING;
}
