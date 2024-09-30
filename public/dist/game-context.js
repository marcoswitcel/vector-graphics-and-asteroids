import { Entity } from './entity.js';
import { makeShipBackwardsFigure, makeShipForwardFigure, makeShipStandingFigure } from './figure.js';
import { isMobileBrowser } from './utils.js';
export const resolutionScaleNonFullscreen = isMobileBrowser() ? 1 : 0.96;
/**
 * @todo João, avaliar o que o mais mover para dentro dessa classe
 */
export class GameContext {
    constructor() {
        this.playerAcceleration = { x: 0, y: 0.45 };
        this.entityPlayer = new Entity({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, 0, 'player', 0.07, 0.08);
        this.isPlayerMoving = false;
        this.isPlayerMovingForward = false;
        this.shootWaitingToBeEmmited = false;
        this.shipStandingFigure = makeShipStandingFigure();
        this.shipForwardFigure = makeShipForwardFigure();
        this.shipBackwardsFigure = makeShipBackwardsFigure();
        this.entities = [this.entityPlayer];
        this.asteroidsDestroyedCounter = 0;
        this.waveIndex = 0;
        this.isPaused = false;
    }
}
