import { makeDefaultPlayer } from './entity.js';
import { makeShipBackwardsFigure, makeShipForwardFigure, makeShipStandingFigure } from './figure.js';
import { isMobileBrowser } from './utils.js';
export const resolutionScaleNonFullscreen = isMobileBrowser() ? 1 : 0.96;
export var GameState;
(function (GameState) {
    GameState[GameState["RUNNING"] = 0] = "RUNNING";
    GameState[GameState["PAUSED"] = 1] = "PAUSED";
    GameState[GameState["GAME_OVER"] = 2] = "GAME_OVER";
})(GameState || (GameState = {}));
export class GameContext {
    constructor() {
        this.playerAcceleration = { x: 0, y: 0.45 };
        this.entityPlayer = makeDefaultPlayer();
        this.isPlayerMoving = false;
        this.isPlayerMovingForward = false;
        this.lastShootEmmited = 0;
        this.shipStandingFigure = makeShipStandingFigure();
        this.shipForwardFigure = makeShipForwardFigure();
        this.shipBackwardsFigure = makeShipBackwardsFigure();
        this.entities = [this.entityPlayer];
        this.asteroidsDestroyedCounter = 0;
        this.waveIndex = 0;
        this.state = GameState.RUNNING;
    }
}
