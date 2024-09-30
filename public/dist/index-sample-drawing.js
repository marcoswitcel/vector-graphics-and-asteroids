import { drawPolygon, makePolygonWithAbsolutePosition, rotatePolygon, scalePolygon } from './draw.js';
import { EventLoop } from './event-loop.js';
import { GameContext } from './game-context.js';
import { createCanvas } from './utils.js';
const canvas = createCanvas(500, 500, document.body);
const ctx = canvas.getContext('2d');
const canvas2 = createCanvas(500, 500, document.body);
const ctx2 = canvas2.getContext('2d');
if (ctx === null || ctx2 === null)
    throw 'Contexto nulo';
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
// @todo João, definir o formato para trabalhar com os polígonos
const polygon = [
    { x: 0, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
];
const position = { x: 0, y: 0 };
drawPolygon(ctx, makePolygonWithAbsolutePosition(position, polygon));
drawPolygon(ctx, makePolygonWithAbsolutePosition({ x: -0.5, y: 0.75 }, scalePolygon(polygon, 0.1)));
drawPolygon(ctx, makePolygonWithAbsolutePosition({ x: -0.5, y: -0.5 }, scalePolygon(polygon, 0.5)));
drawPolygon(ctx, makePolygonWithAbsolutePosition({ x: 0, y: 0 }, scalePolygon(polygon, 0.25, 0.45)));
const eventLoop = new EventLoop(new GameContext);
let rotation = 0;
eventLoop.add((context, time) => {
    ctx2.fillStyle = '#000';
    ctx2.fillRect(0, 0, canvas.width, canvas.height);
    position.x += 0.001;
    if (position.x > 1) {
        position.x = -1;
    }
    rotation += 0.01;
    drawPolygon(ctx2, makePolygonWithAbsolutePosition(position, rotatePolygon(scalePolygon(polygon, 0.5), rotation)));
});
eventLoop.start();
