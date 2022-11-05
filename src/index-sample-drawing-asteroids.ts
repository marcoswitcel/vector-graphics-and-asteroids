import { drawLine, drawPolygon, makePolygonWithAbsolutePosition, rotatePoint, rotatePolygon, scalePolygon, Vector2 } from "./draw.js";
import { Entity } from "./entity.js";
import { EventLoop } from "./event-loop.js";
import { makeAsteroid } from "./figure.js";
import { createCanvas } from "./utils.js";

const canvas = createCanvas(500, 500, document.body);
const ctx = canvas.getContext('2d');

if (ctx === null) throw 'Contexto nulo';

const entities = Array(15).fill(0).map(() => {
    const x = 1.5 - Math.random() * 3.5;
    const y = 1.5 - Math.random() * 3.5;
    return new Entity({ x, y }, { x: -0.02 * Math.random(), y: -0.02 * Math.random() }, { x: 0, y: 0 }, Math.random());
});

const eventLoop = new EventLoop();

eventLoop.add((time: number) => {
    for (const entity of entities) {
        entity.position.x += entity.velocity.x;
        entity.position.y += entity.velocity.y;

        entity.angle += -0.03

        if (entity.position.x < -1.5) {
            entity.position.x = 1.5;
            entity.position.y = 1.5;
        }
    }
});

// Renderiza
eventLoop.add((time: number) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const entity of entities) {
        drawPolygon(ctx, makePolygonWithAbsolutePosition(entity.position, rotatePolygon(scalePolygon(makeAsteroid(), 0.3), entity.angle)));
    }
});

eventLoop.start();
