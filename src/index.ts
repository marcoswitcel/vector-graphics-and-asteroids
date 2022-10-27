import { drawPolygon, makePolygonWithAbsolutePosition, scalePolygon, Vector2 } from "./draw.js";
import { EventLoop } from "./event-loop.js";
import { createCanvas } from "./utils.js";

const canvas = createCanvas(500, 500, document.body);
const ctx = canvas.getContext('2d');
const canvas2 = createCanvas(500, 500, document.body);
const ctx2 = canvas2.getContext('2d');

if (ctx === null || ctx2 === null) throw 'Contexto nulo';

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// @todo João, definir o formato para trabalhar com os polígonos
const polygon: Vector2[] = [
    { x: 0, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
];
const position = { x: 0, y: 0 };

drawPolygon(ctx, makePolygonWithAbsolutePosition(position, polygon));

drawPolygon(ctx, makePolygonWithAbsolutePosition({ x: -0.5, y: 0.75 }, scalePolygon(polygon, 0.1)));

drawPolygon(ctx, makePolygonWithAbsolutePosition({ x: -0.5, y: -0.5 }, scalePolygon(polygon, 0.5)));

const eventLoop = new EventLoop();

eventLoop.add((time: number) => {
    ctx2.fillStyle = '#000';
    ctx2.fillRect(0, 0, canvas.width, canvas.height);
    position.x += 0.001;
    drawPolygon(ctx2, makePolygonWithAbsolutePosition(position, scalePolygon(polygon, 0.5)));
});

eventLoop.start();
