import { drawPolygon, Vector2 } from "./draw.js";

const canvas = document.createElement('canvas');

document.body.appendChild(canvas);

canvas.width = 500;
canvas.height = 500;

const ctx = canvas.getContext('2d');

if (ctx === null) throw 'Contexto nulo';

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);

const polygon: Vector2[] = [
    { x: 0, y: 10 },
    { x: 10, y: -10 },
    { x: -10, y: -10 },
];
const position = { x: 200, y: 200 };

drawPolygon(ctx, position,  polygon);
