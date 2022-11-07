import { drawCircle, drawLine, drawPolygon, makePolygonWithAbsolutePosition, rotatePoint, rotatePolygon, scalePolygon, Vector2 } from "./draw.js";
import { Entity } from "./entity.js";
import { EventLoop } from "./event-loop.js";
import { makeAsteroid } from "./figure.js";
import { KeyBoardInput } from "./keyboard-input.js";
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
const playerAcceleration = { x: 0, y: 0.0001 };
const entityPlayer = new Entity({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, 0, 'player', 0.08);
const asteroid = new Entity({ x: 0.75, y: 0.75 }, { x: -0.005, y: -0.009 }, { x: 0, y: 0 }, 0, 'asteroids', 0.08);
const entities = [ entityPlayer, asteroid ];
let shootWaitingToBeEmmited = false;

const eventLoop = new EventLoop();
const keyBoardInput = new KeyBoardInput({ autoStart: true });
let debug = false;
let debugHitRadius = false;

const emmitShoot = (player: Entity, entities: Entity[]) => {
    const radius = rotatePoint({ x: 0, y: 0.03 }, entityPlayer.angle);
    const position = { x: player.position.x + radius.x, y: player.position.y + radius.y };
    const velocity = rotatePoint({ x: 0, y: 0.02 }, entityPlayer.angle);
    const shootEntity = new Entity(position, velocity, { x: 0, y: 0 }, player.angle, 'shoot');
    entities.push(shootEntity);
}

keyBoardInput.addListener('keyup.1', () => {
    debug = !debug;
});
keyBoardInput.addListener('keyup.2', () => {
    debugHitRadius = !debugHitRadius;
});

keyBoardInput.addListener('keyup. ', () => {
    shootWaitingToBeEmmited = true;
}); 

eventLoop.add((time: number) => {
    if (keyBoardInput.isKeyPressed('d')) {
        entityPlayer.angle += -0.04
    }
    if (keyBoardInput.isKeyPressed('a')) {
        entityPlayer.angle += 0.04
    }
    
    if (keyBoardInput.areBothKeysPressed('w', 's')) {
        entityPlayer.acceleration.x = 0;
        entityPlayer.acceleration.y = 0;
    } else  if (keyBoardInput.isKeyPressed('w')) {
        entityPlayer.acceleration = rotatePoint(playerAcceleration, entityPlayer.angle);
    } else if (keyBoardInput.isKeyPressed('s')) {
        entityPlayer.acceleration = rotatePoint(playerAcceleration, entityPlayer.angle);
        entityPlayer.acceleration.x *= -1;
        entityPlayer.acceleration.y *= -1;
    } else {
        entityPlayer.acceleration.x = 0;
        entityPlayer.acceleration.y = 0;
    }

    if (shootWaitingToBeEmmited) {
        emmitShoot(entityPlayer, entities);
        shootWaitingToBeEmmited = false;
    }
});

eventLoop.add((time: number) => {
    for (const entity of entities) {
        // computando velocidade
        entity.velocity.x += entity.acceleration.x;
        entity.velocity.y += entity.acceleration.y;

        // computando nova posição
        entity.position.x += entity.velocity.x;
        entity.position.y += entity.velocity.y;

        // limitando o espaço e fazendo o efeito de "sair do outro lado da tela"
        const xAbs = Math.abs(entity.position.x)
        if (xAbs > 1) {
            const diff = xAbs - 1;
            entity.position.x = (xAbs - 2 * diff) * (entity.position.x / xAbs * -1);
        }
        const yAbs = Math.abs(entity.position.y)
        if (yAbs > 1) {
            const diff = yAbs - 1;
            entity.position.y = (yAbs - 2 * diff) * (entity.position.y / yAbs * -1);
        }
    }
});

// Renderiza
eventLoop.add((time: number) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const entity of entities) {
        if (entity === entityPlayer) {
            drawPolygon(ctx, makePolygonWithAbsolutePosition(entity.position, rotatePolygon(scalePolygon(polygon, 0.05), entity.angle)));
        } else if (entity.type === 'shoot') {
            const startPosition = {
                x: entity.position.x + entity.velocity.x * -0.75,
                y: entity.position.y + entity.velocity.y * -0.75,
            };
            const endPosition = {
                x: entity.position.x + entity.velocity.x * 0.75,
                y: entity.position.y + entity.velocity.y * 0.75,
            };
            drawLine(ctx, startPosition, endPosition);
        } else {
            drawPolygon(ctx, makePolygonWithAbsolutePosition(entity.position, rotatePolygon(scalePolygon(makeAsteroid(), 0.05), entity.angle)));
        }
    }
});

// Renderiza informação visual da área de hit
eventLoop.add((time: number) => {
    if (!debugHitRadius) return;
    
    for (const entity of entities) {
        if (entity.hitRadius) {
            drawCircle(ctx, entity.position, entity.hitRadius, '#FF0000');
        }
    }
});

// Renderiza informação visual de debug
eventLoop.add((time: number) => {
    if (!debug) return;
    
    for (const entity of entities) {
        const endPosition = {
            x: entity.position.x + entity.acceleration.x * 2000,
            y: entity.position.y + entity.acceleration.y * 2000,
        };
        drawLine(ctx, entity.position, endPosition);
    }
});

eventLoop.start();
