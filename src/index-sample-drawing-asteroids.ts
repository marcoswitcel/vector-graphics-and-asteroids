import { distance, drawCircle, drawPolygon, makePolygonWithAbsolutePosition, rotatePolygon, scalePolygon, Vector2 } from './draw.js';
import { Entity, fragmentationAllowed, hittedMark } from './entity.js';
import { EventLoop } from './event-loop.js';
import { makeAsteroid } from './figure.js';
import { GameContext } from './game-context.js';
import { KeyBoardInput } from './keyboard-input.js';
import { createCanvas, fragmentAsteroid } from './utils.js';


const keyBoardInput = new KeyBoardInput({ autoStart: true });
const canvas = createCanvas(500, 500, document.body);
const ctx = canvas.getContext('2d');
let debugHitRadius = false;
let clickedPosition: Vector2 | null = null;

keyBoardInput.addListener('keyup.2', () => {
    debugHitRadius = !debugHitRadius;
});

canvas.addEventListener('click', event => {
    clickedPosition = {
        x: event.offsetX / canvas.width * 2 - 1,
        y: (canvas.height - event.offsetY) / canvas.height * 2 - 1,
    }
});

if (ctx === null) throw 'Contexto nulo';

let entities = Array(15).fill(0).map(() => {
    const x = 1.5 - Math.random() * 3.5;
    const y = 1.5 - Math.random() * 3.5;
    const scale = 0.20 + Math.random() * 0.15;
    const hitRadius = scale * 1.33;
    const entity = new Entity({ x, y }, { x: -0.02 * Math.random(), y: -0.02 * Math.random() }, { x: 0, y: 0 }, Math.random(), 'asteroids', hitRadius, scale, -0.03);
    entity.components[fragmentationAllowed] = 4;
    return entity;
});

const eventLoop = new EventLoop(new GameContext);

eventLoop.add((context: GameContext, time: number) => {
    // Se presente o valor será processado uma vez e `clickedPosition` receberá null
    if (clickedPosition) {
        for (const entity of entities) {
            if (distance(clickedPosition, entity.position) < entity.hitRadius) {
                entity.components[hittedMark] = true;
            }
        }
        clickedPosition = null;
    }
});

eventLoop.add((context: GameContext, time: number) => {
    const hittedEntities = entities.filter(entity => entity.components[hittedMark]);
    if (hittedEntities.length === 0) return;

    const allFragments: Entity[] = [];

    for (const hittedEntity of hittedEntities) {
        const numberOfFragmentation = hittedEntity.components[fragmentationAllowed];
        if (numberOfFragmentation) {
            const fragments = fragmentAsteroid(hittedEntity, numberOfFragmentation);
            allFragments.push(...fragments);
        } 
    }

    entities = entities.filter(entity => !entity.components[hittedMark]);
    entities.push(...allFragments);
});

eventLoop.add((context: GameContext, time: number) => {
    for (const entity of entities) {
        entity.position.x += entity.velocity.x;
        entity.position.y += entity.velocity.y;

        entity.angle += entity.angularVelocity;

        if (entity.position.x < -1.5) {
            entity.position.x = 1.5;
            entity.position.y = 1.5;
        }
    }
});

// Renderiza
eventLoop.add((context: GameContext, time: number) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const entity of entities) {
        drawPolygon(ctx, makePolygonWithAbsolutePosition(entity.position, rotatePolygon(scalePolygon(makeAsteroid(), entity.scale), entity.angle)));
    }
});

// Renderiza informação visual da área de hit
eventLoop.add((context: GameContext, time: number) => {
    if (!debugHitRadius) return;
    
    for (const entity of entities) {
        if (entity.hitRadius) {
            const color = entity.components[hittedMark] ? '#00FF00' : '#FF0000';
            drawCircle(ctx, entity.position, entity.hitRadius, color);
        }
    }
});

eventLoop.start();
