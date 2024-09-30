import { drawComplexShape, rotatePoint } from './draw.js';
import { Entity } from './entity.js';
import { EventLoop } from './event-loop.js';
import { makeShipBackwardsFigure, makeShipForwardFigure, makeShipStandingFigure } from './figure.js';
import { GameContext } from './game-context.js';
import { KeyBoardInput } from './keyboard-input.js';
import { createCanvas } from './utils.js';
const canvas = createCanvas(500, 500, document.body);
const ctx = canvas.getContext('2d');
if (ctx === null)
    throw 'Contexto nulo';
const playerAcceleration = { x: 0, y: 0.45 };
const entity = new Entity({ x: 0, y: 0 }, { x: 0, y: 0 }, playerAcceleration, 0, 'player', 0.3, 0.2);
const shipStandingFigure = makeShipStandingFigure();
const shipForwardFigure = makeShipForwardFigure();
const shipBackwardsFigure = makeShipBackwardsFigure();
const eventLoop = new EventLoop(new GameContext);
const keyBoardInput = new KeyBoardInput({ autoStart: true });
let moving = false;
let forward = false;
eventLoop.add((context, time, deltaTime) => {
    if (keyBoardInput.areBothKeysPressed('w', 's')) {
        moving = false;
    }
    else if (keyBoardInput.isKeyPressed('w')) {
        entity.velocity.x += entity.acceleration.x * deltaTime;
        entity.velocity.y += entity.acceleration.y * deltaTime;
        moving = true;
        forward = true;
    }
    else if (keyBoardInput.isKeyPressed('s')) {
        entity.velocity.x -= entity.acceleration.x * deltaTime;
        entity.velocity.y -= entity.acceleration.y * deltaTime;
        moving = true;
        forward = false;
    }
    else {
        moving = false;
    }
    const angularVelocitySpaceShipTurn = 2.4;
    if (keyBoardInput.isKeyPressed('d')) {
        entity.angle += -(angularVelocitySpaceShipTurn * deltaTime);
        entity.acceleration = rotatePoint(playerAcceleration, entity.angle);
    }
    if (keyBoardInput.isKeyPressed('a')) {
        entity.angle += (angularVelocitySpaceShipTurn * deltaTime);
        entity.acceleration = rotatePoint(playerAcceleration, entity.angle);
    }
    entity.position.x += entity.velocity.x * deltaTime;
    entity.position.y += entity.velocity.y * deltaTime;
    // limitando o espaço e fazendo o efeito de "sair do outro lado da tela"
    const xAbs = Math.abs(entity.position.x);
    if (xAbs > 1) {
        const diff = xAbs - 1;
        entity.position.x = (xAbs - 2 * diff) * (entity.position.x / xAbs * -1);
    }
    const yAbs = Math.abs(entity.position.y);
    if (yAbs > 1) {
        const diff = yAbs - 1;
        entity.position.y = (yAbs - 2 * diff) * (entity.position.y / yAbs * -1);
    }
});
// Renderiza
eventLoop.add((context, time) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const figure = moving
        ? (forward ? shipForwardFigure : shipBackwardsFigure)
        : shipStandingFigure;
    const isCrossingX = Math.abs(entity.position.x) + entity.hitRadius > 1;
    const isCrossingY = Math.abs(entity.position.y) + entity.hitRadius > 1;
    const outterX = Math.abs(entity.position.x) + entity.hitRadius - 1;
    const outterY = Math.abs(entity.position.y) + entity.hitRadius - 1;
    if (isCrossingX && isCrossingY) {
        const cornerPosition = {
            x: (entity.position.x > 0 ? -1 - entity.hitRadius + outterX : 1 + entity.hitRadius - outterX),
            y: (entity.position.y > 0 ? -1 - entity.hitRadius + outterY : 1 + entity.hitRadius - outterY),
        };
        drawComplexShape(ctx, figure, cornerPosition, entity.scale, entity.angle);
    }
    if (isCrossingY) {
        const topPosition = {
            x: entity.position.x,
            y: (entity.position.y > 0 ? -1 - entity.hitRadius + outterY : 1 + entity.hitRadius - outterY),
        };
        drawComplexShape(ctx, figure, topPosition, entity.scale, entity.angle);
    }
    if (isCrossingX) {
        const leftPosition = {
            x: (entity.position.x > 0 ? -1 - entity.hitRadius + outterX : 1 + entity.hitRadius - outterX),
            y: entity.position.y,
        };
        drawComplexShape(ctx, figure, leftPosition, entity.scale, entity.angle);
    }
    drawComplexShape(ctx, figure, entity.position, entity.scale, entity.angle);
});
eventLoop.start();
