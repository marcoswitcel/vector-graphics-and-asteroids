import { makeDefaultPlayer } from './entity.js';
import { makeShipBackwardsFigure, makeShipForwardFigure, makeShipStandingFigure } from './figure.js';
import { isMobileBrowser } from './utils.js';
export const resolutionScaleNonFullscreen = isMobileBrowser() ? 1 : 0.96;
/**
 * @todo João, avaliar o que o mais mover para dentro dessa classe
 */
export class GameContext {
    constructor() {
        this.playerAcceleration = { x: 0, y: 0.45 };
        this.entityPlayer = makeDefaultPlayer();
        this.isPlayerMoving = false;
        this.isPlayerMovingForward = false;
        this.shootWaitingToBeEmmited = false;
        this.shipStandingFigure = makeShipStandingFigure();
        this.shipForwardFigure = makeShipForwardFigure();
        this.shipBackwardsFigure = makeShipBackwardsFigure();
        this.entities = [this.entityPlayer];
        this.asteroidsDestroyedCounter = 0;
        this.waveIndex = 0;
        // @todo João, considerar converter esses estados em um enum
        this.isPaused = false;
        this.isGameOver = false;
    }
}
