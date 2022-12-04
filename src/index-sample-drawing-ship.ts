import { ComplexShape, drawComplexShape, DrawInfo, drawLine, drawPolygon, makePolygonWithAbsolutePosition, rotatePoint, rotatePolygon, scalePolygon, Shape, Vector2 } from "./draw.js";
import { Entity } from "./entity.js";
import { EventLoop } from "./event-loop.js";
import { makeShipBackwardsFigure, makeShipForwardFigure, makeShipStandingFigure, makeSpaceShip, makeTriangle } from "./figure.js";
import { KeyBoardInput } from "./keyboard-input.js";
import { createCanvas } from "./utils.js";

const canvas = createCanvas(500, 500, document.body);
const ctx = canvas.getContext('2d');

if (ctx === null) throw 'Contexto nulo';

// @todo João, adicionar animação do propulsor
const entity = new Entity({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0.0001 }, 0, 'player', 0.2);
const shipStandingFigure = makeShipStandingFigure();
const shipForwardFigure = makeShipForwardFigure();
const shipBackwardsFigure = makeShipBackwardsFigure();

const eventLoop = new EventLoop();
const keyBoardInput = new KeyBoardInput({ autoStart: true });
let moving = false;
let forward = false;

eventLoop.add((time: number) => {
    if (keyBoardInput.areBothKeysPressed('w', 's')) {
        moving = false;
    } else if (keyBoardInput.isKeyPressed('w')) {
        entity.velocity.x += entity.acceleration.x;
        entity.velocity.y += entity.acceleration.y;
        moving = true;
        forward = true;
    } else if (keyBoardInput.isKeyPressed('s')) {
        entity.velocity.x -= entity.acceleration.x;
        entity.velocity.y -= entity.acceleration.y;
        moving = true;
        forward = false;
    } else {
        moving = false;
    }
    if (keyBoardInput.isKeyPressed('d')) {
        entity.acceleration = rotatePoint(entity.acceleration, -0.04);
        entity.angle += -0.04
    }
    if (keyBoardInput.isKeyPressed('a')) {
        entity.acceleration = rotatePoint(entity.acceleration, 0.04);
        entity.angle += 0.04
    }
    entity.position.x += entity.velocity.x;
    entity.position.y += entity.velocity.y;

    // limitando o espaço e fazendo o efeito de "sair do outro lado da tela"
    const xAbs = Math.abs(entity.position.x)
    if (xAbs > 1) {
        const diff = xAbs - 1;
        entity.position.x = (xAbs - 2 * diff) * (entity.position.x / xAbs * -1);
    }
    const yAbs = Math.abs(entity.position.y)
    if (yAbs > 1) {
        const diff = yAbs - 1;
        entity.position.y = (yAbs - 2 * diff) * (entity.position.y / yAbs * -1);
    }
});

// Renderiza
eventLoop.add((time: number) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const figure = moving
        ? (forward ? shipForwardFigure : shipBackwardsFigure)
        : shipStandingFigure;

    // @todo João é necessário abstrair esse conceito
    // @todo João é necessário otimizar
    const isCrossingX = Math.abs(entity.position.x) + entity.hitRadius > 1;
    const isCrossingY = Math.abs(entity.position.y) + entity.hitRadius > 1; 
    const outterX = Math.abs(entity.position.x) + entity.hitRadius - 1;
    const outterY = Math.abs(entity.position.y) + entity.hitRadius - 1;

    if (isCrossingX && isCrossingY) {
        const cornerPosition = {
            x: (entity.position.x > 0 ? -1 - entity.hitRadius + outterX : 1 + entity.hitRadius - outterX),
            y: (entity.position.y > 0 ? -1 - entity.hitRadius + outterY : 1 + entity.hitRadius - outterY),
        };
        drawComplexShape(ctx, figure, cornerPosition, 0.2, entity.angle);
    }
    
    if (isCrossingY) {
        const topPosition = {
            x: entity.position.x,
            y: (entity.position.y > 0 ? -1 - entity.hitRadius + outterY : 1 + entity.hitRadius - outterY),
        };
        drawComplexShape(ctx, figure, topPosition, 0.2, entity.angle);
    }
    
    if (isCrossingX) {
        const leftPosition = {
            x: (entity.position.x > 0 ? -1 - entity.hitRadius + outterX : 1 + entity.hitRadius - outterX),
            y: entity.position.y,
        };
        drawComplexShape(ctx, figure, leftPosition, 0.2, entity.angle);
    }

    drawComplexShape(ctx, figure, entity.position, 0.2, entity.angle);
});

eventLoop.start();
