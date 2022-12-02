import { drawLine, drawPolygon, makePolygonWithAbsolutePosition, rotatePoint, scalePolygon } from "./draw.js";
import { Entity } from "./entity.js";
import { EventLoop } from "./event-loop.js";
import { KeyBoardInput } from "./keyboard-input.js";
import { createCanvas } from "./utils.js";
const canvas = createCanvas(500, 500, document.body);
const ctx = canvas.getContext('2d');
if (ctx === null)
    throw 'Contexto nulo';
// @todo João, definir o formato para trabalhar com os polígonos
const polygon = [
    { x: 0, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
];
const entity = new Entity({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0.0001 });
const eventLoop = new EventLoop();
const keyBoardInput = new KeyBoardInput({ autoStart: true });
eventLoop.add((time) => {
    if (keyBoardInput.isKeyPressed('w')) {
        entity.velocity.x += entity.acceleration.x;
        entity.velocity.y += entity.acceleration.y;
    }
    if (keyBoardInput.isKeyPressed('s')) {
        entity.velocity.x -= entity.acceleration.x;
        entity.velocity.y -= entity.acceleration.y;
    }
    if (keyBoardInput.isKeyPressed('d')) {
        entity.acceleration = rotatePoint(entity.acceleration, -0.02);
    }
    if (keyBoardInput.isKeyPressed('a')) {
        entity.acceleration = rotatePoint(entity.acceleration, 0.02);
    }
    entity.position.x += entity.velocity.x;
    entity.position.y += entity.velocity.y;
});
// Renderiza
eventLoop.add((time) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPolygon(ctx, makePolygonWithAbsolutePosition(entity.position, scalePolygon(polygon, 0.05)));
    // @todo João, organizar informação visual de debug
    const endPosition = {
        x: entity.position.x + entity.acceleration.x * 2000,
        y: entity.position.y + entity.acceleration.y * 2000,
    };
    drawLine(ctx, entity.position, endPosition);
});
eventLoop.start();
