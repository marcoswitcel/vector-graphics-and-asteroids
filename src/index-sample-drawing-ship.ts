import { ComplexShape, drawComplexShape, DrawInfo, drawLine, drawPolygon, makePolygonWithAbsolutePosition, rotatePoint, rotatePolygon, scalePolygon, Shape, Vector2 } from "./draw.js";
import { Entity } from "./entity.js";
import { EventLoop } from "./event-loop.js";
import { KeyBoardInput } from "./keyboard-input.js";
import { createCanvas } from "./utils.js";

const canvas = createCanvas(500, 500, document.body);
const ctx = canvas.getContext('2d');

if (ctx === null) throw 'Contexto nulo';

// @todo João, adicionar animação do propulsor
const polygon: Vector2[] = [
    { x: 0, y: 0.8 },
    { x: 0.8, y: -0.6 },
    { x: 0.4, y: -0.4 },
    { x: -0.4, y: -0.4 },
    { x: -0.8, y: -0.6 },
];
const triangulo: Vector2[] = [
    { x: 0, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
];
const entity = new Entity({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0.0001 }, 0);
const shipStandingFigure = new ComplexShape([
    new Shape(polygon),
], [
    new DrawInfo({ x: 0, y:0 }, 1, 0),
]);
const shipForwardFigure = new ComplexShape([
    new Shape(polygon),
    new Shape(triangulo),
    new Shape(triangulo),
], [
    new DrawInfo({ x: 0, y:0 }, 1, 0),
    new DrawInfo({ x: -0.25, y: -0.55 }, 0.15, 3.14),
    new DrawInfo({ x: 0.25, y: -0.55 }, 0.15, 3.14),
]);
const shipBackwardsFigure = new ComplexShape([
    new Shape(polygon),
    new Shape(triangulo),
    new Shape(triangulo),
], [
    new DrawInfo({ x: 0, y:0 }, 1, 0),
    new DrawInfo({ x: -0.25, y: -0.55 }, 0.15, 0),
    new DrawInfo({ x: 0.25, y: -0.55 }, 0.15, 0),
]);

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
});

// Renderiza
eventLoop.add((time: number) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (moving) {
        drawComplexShape(ctx, ((forward) ? shipForwardFigure : shipBackwardsFigure), entity.position, 0.2, entity.angle);
    } else {
        drawComplexShape(ctx, shipStandingFigure, entity.position, 0.2, entity.angle);
    }
});

eventLoop.start();
