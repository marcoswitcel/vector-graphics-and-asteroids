import { drawCircle, drawLine, drawPolygon, makePolygonWithAbsolutePosition, rotatePoint, rotatePolygon, scalePolygon, Vector2 } from "./draw.js";
import { Entity, hittedMark } from "./entity.js";
import { EventLoop } from "./event-loop.js";
import { makeAsteroid } from "./figure.js";
import { KeyBoardInput } from "./keyboard-input.js";
import { createCanvas } from "./utils.js";

// @todo João, analisar e implementar um mecanismo organizado como lidar com
// cliques no canvas sem quebrar nenhum ordem de execução. Isso para inserir
// e armazenar o local do clique para processamento no momento apropriado.
// @todo João, após armazer o local do clique implementar a lógica que detecta
// o "clique" no asteroide marca o mesmo para "fragmentação", garantir que
// o clique só dure um ciclo e que no próximo ciclo o asteroide de fragmente
// em mais asteroides menores se não estiver já muito pequeno.

const keyBoardInput = new KeyBoardInput({ autoStart: true });
const canvas = createCanvas(500, 500, document.body);
const ctx = canvas.getContext('2d');
let debugHitRadius = false;

keyBoardInput.addListener('keyup.2', () => {
    debugHitRadius = !debugHitRadius;
});

if (ctx === null) throw 'Contexto nulo';

const entities = Array(15).fill(0).map(() => {
    const x = 1.5 - Math.random() * 3.5;
    const y = 1.5 - Math.random() * 3.5;
    return new Entity({ x, y }, { x: -0.02 * Math.random(), y: -0.02 * Math.random() }, { x: 0, y: 0 }, Math.random(), 'asteroids', 0.5);
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

// Renderiza informação visual da área de hit
eventLoop.add((time: number) => {
    if (!debugHitRadius) return;
    
    for (const entity of entities) {
        if (entity.hitRadius) {
            const color = entity.components[hittedMark] ? '#00FF00' : '#FF0000';
            drawCircle(ctx, entity.position, entity.hitRadius, color);
        }
    }
});

eventLoop.start();
