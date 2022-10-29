import { drawPolygon, makePolygonWithAbsolutePosition, rotatePolygon, scalePolygon, Vector2 } from "./draw.js";
import { EventLoop } from "./event-loop.js";
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
const position = { x: 0, y: 0 };

const eventLoop = new EventLoop();

eventLoop.add((time: number) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawPolygon(ctx, makePolygonWithAbsolutePosition(position, scalePolygon(polygon, 0.5)));
});

eventLoop.start();
