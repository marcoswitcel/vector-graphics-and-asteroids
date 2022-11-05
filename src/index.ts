import { drawLine, drawPolygon, makePolygonWithAbsolutePosition, rotatePoint, rotatePolygon, scalePolygon, Vector2 } from "./draw.js";
import { Entity } from "./entity.js";
import { EventLoop } from "./event-loop.js";
import { KeyBoardInput } from "./keyboard-input.js";
import { createCanvas } from "./utils.js";

const canvas = createCanvas(500, 500, document.body);
const ctx = canvas.getContext('2d');

if (ctx === null) throw 'Contexto nulo';

// @todo João, definir o formato para trabalhar com os polígonos
const polygon: Vector2[] = [
    { x: 0, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
];
const entity = new Entity({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0.0001 }, 0);

const eventLoop = new EventLoop();
const keyBoardInput = new KeyBoardInput({ autoStart: true });
let debug = false;

keyBoardInput.addListener('keyup.1', () => {
    debug = !debug;
}); 

eventLoop.add((time: number) => {
    if (keyBoardInput.isKeyPressed('w')) {
        entity.velocity.x += entity.acceleration.x;
        entity.velocity.y += entity.acceleration.y;
    }
    if (keyBoardInput.isKeyPressed('s')) {
        entity.velocity.x -= entity.acceleration.x;
        entity.velocity.y -= entity.acceleration.y;
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
});

// Renderiza
eventLoop.add((time: number) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawPolygon(ctx, makePolygonWithAbsolutePosition(entity.position, rotatePolygon(scalePolygon(polygon, 0.05), entity.angle)));
});

// Renderiza informação visual de debug
eventLoop.add((time: number) => {
    if (!debug) return;
    
    const endPosition = {
        x: entity.position.x + entity.acceleration.x * 2000,
        y: entity.position.y + entity.acceleration.y * 2000,
    };
    drawLine(ctx, entity.position, endPosition);
});

eventLoop.start();
