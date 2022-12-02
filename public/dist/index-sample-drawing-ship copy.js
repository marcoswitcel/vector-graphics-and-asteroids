import { drawPolygon, makePolygonWithAbsolutePosition, scalePolygon } from "./draw.js";
import { Entity } from "./entity.js";
import { EventLoop } from "./event-loop.js";
import { KeyBoardInput } from "./keyboard-input.js";
import { createCanvas } from "./utils.js";
const canvas = createCanvas(500, 500, document.body);
const ctx = canvas.getContext('2d');
if (ctx === null)
    throw 'Contexto nulo';
// @todo João, adicionar animação do propulsor
const polygon = [
    { x: 0, y: 0.8 },
    { x: 0.8, y: -0.6 },
    { x: 0.4, y: -0.4 },
    { x: -0.4, y: -0.4 },
    { x: -0.8, y: -0.6 },
];
const entity = new Entity({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0.0001 }, 0);
const eventLoop = new EventLoop();
const keyBoardInput = new KeyBoardInput({ autoStart: true });
// Renderiza
eventLoop.add((time) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPolygon(ctx, makePolygonWithAbsolutePosition(entity.position, scalePolygon(polygon, 1)));
});
eventLoop.start();
