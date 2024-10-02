import { makeDefaultPlayer } from './entity.js';
import { makeShipBackwardsFigure, makeShipForwardFigure, makeShipStandingFigure } from './figure.js';
import { isMobileBrowser } from './utils.js';

export const resolutionScaleNonFullscreen = isMobileBrowser() ? 1 : 0.96;

/**
 * @todo João, avaliar o que o mais mover para dentro dessa classe
 */
export class GameContext {
    playerAcceleration = { x: 0, y: 0.45 };
    entityPlayer = makeDefaultPlayer();
    isPlayerMoving = false;
    isPlayerMovingForward = false;
    shootWaitingToBeEmmited = false;
    
    shipStandingFigure = makeShipStandingFigure();
    shipForwardFigure = makeShipForwardFigure();
    shipBackwardsFigure = makeShipBackwardsFigure();
    
    entities = [ this.entityPlayer ];
    asteroidsDestroyedCounter = 0;
    waveIndex = 0;

    // @todo João, considerar converter esses estados em um enum
    isPaused = false;
    isGameOver = false;
}
