import { distance, drawCircle, drawLine, drawPolygon, makePolygonWithAbsolutePosition, rotatePoint, rotatePolygon, scalePolygon, Vector2 } from "./draw.js";
import { Entity, createdAtTimestamp, hittedMark, fragmentationAllowed } from "./entity.js";
import { EventLoop } from "./event-loop.js";
import { makeAsteroid } from "./figure.js";
import { KeyBoardInput } from "./keyboard-input.js";
import { createCanvas, fragmentAsteroid, renderFigureInside } from "./utils.js";

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
const entityPlayer = new Entity({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, 0, 'player', 0.08, 0.05);
const asteroids = Array(3).fill(0).map(() => {
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    const scale = 0.15 + Math.random() * 0.1;
    const hitRadius = scale * 1.33;
    const defaultVelocity = { x: -0.005, y: -0.009 };
    defaultVelocity.x *= Math.random() > 0.5 ? -1 : 1;
    defaultVelocity.y *= Math.random() > 0.5 ? -1 : 1;

    const entity = new Entity({ x, y }, defaultVelocity, { x: 0, y: 0 }, 0, 'asteroids', hitRadius, scale, -0.01);
    entity.components[fragmentationAllowed] = 4;
    return entity;
});
let entities = [ entityPlayer, ...asteroids ];
let shootWaitingToBeEmmited = false;
const primaryWhite = '#FFFFFF';
const secondaryWhite = 'rgba(255,255,255,0.7)';

const eventLoop = new EventLoop();
const keyBoardInput = new KeyBoardInput({ autoStart: true });
let debug = false;
let debugHitRadius = false;


const emmitShoot = (player: Entity, entities: Entity[]) => {
    const radius = rotatePoint({ x: 0, y: 0.03 }, entityPlayer.angle);
    const position = { x: player.position.x + radius.x, y: player.position.y + radius.y };
    const velocity = rotatePoint({ x: 0, y: 0.02 }, entityPlayer.angle);
    const shootEntity = new Entity(position, velocity, { x: 0, y: 0 }, player.angle, 'shoot');
    shootEntity.components[createdAtTimestamp] = Date.now();
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
    const now = Date.now();
    entities = entities.filter(entity => {
        return !(entity.components[createdAtTimestamp] && now - entity.components[createdAtTimestamp] > 1500);
    });

    const shootEntities = entities.filter(entity => entity.type === 'shoot');

    for (const entity of entities) {
        if (entity.type === 'asteroids') {
            for (const shootEntity of shootEntities) {
                if (distance(entity.position, shootEntity.position) < (entity.hitRadius + shootEntity.hitRadius)) {
                    entity.components[hittedMark] = true;
                    shootEntity.components[hittedMark] = true;
                }
            }
            if (distance(entity.position, entityPlayer.position) < (entity.hitRadius + entityPlayer.hitRadius)) {
                entityPlayer.components[hittedMark] = true;
            }
        }
    }
});

eventLoop.add((time: number) => {
    const hittedAsteroids = entities.filter(entity => entity.components[hittedMark] && entity.type === 'asteroids');
    if (hittedAsteroids.length === 0) return;

    const allFragments: Entity[] = [];

    for (const hittedAsteroid of hittedAsteroids) {
        const numberOfFragmentation = hittedAsteroid.components[fragmentationAllowed];
        if (numberOfFragmentation) {
            const fragments = fragmentAsteroid(hittedAsteroid, numberOfFragmentation);
            allFragments.push(...fragments);
        } 
    }

    entities = entities.filter(entity => !entity.components[hittedMark] || entity.type === 'player');
    entities.push(...allFragments);
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

        entity.angle += entity.angularVelocity;
    }
});

// Renderiza
eventLoop.add((time: number) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const entity of entities) {
        if (entity.type === 'player') {
            // @todo João, avaliar essa solução, visualmente está correto, porém acredito que a função `renderFigureInside` apesar de funcionar
            // trás uma complecidade desnecessária, acho que seria interessante nessa etapa apenas acumular as figuras que devem ser
            // desenhadas e em um próximo loop fazer a renderização de fato.
            // drawPolygon(ctx, makePolygonWithAbsolutePosition(entity.position, rotatePolygon(scalePolygon(polygon, entity.scale), entity.angle)), primaryWhite);
            renderFigureInside(entity, polygon, ctx, (ctx: CanvasRenderingContext2D, polygon: readonly Vector2[], position: Vector2, entity: Entity) => {
                drawPolygon(ctx, makePolygonWithAbsolutePosition(position, rotatePolygon(scalePolygon(polygon, entity.scale), entity.angle)), primaryWhite);
            });
        } else if (entity.type === 'shoot') {
            const startPosition = {
                x: entity.position.x + entity.velocity.x * -0.75,
                y: entity.position.y + entity.velocity.y * -0.75,
            };
            const endPosition = {
                x: entity.position.x + entity.velocity.x * 0.75,
                y: entity.position.y + entity.velocity.y * 0.75,
            };
            drawLine(ctx, startPosition, endPosition, primaryWhite);
        } else {
            // @todo João, avaliar essa solução, visualmente está correto, porém acredito que a função `renderFigureInside` apesar de funcionar
            // trás uma complecidade desnecessária, acho que seria interessante nessa etapa apenas acumular as figuras que devem ser
            // desenhadas e em um próximo loop fazer a renderização de fato.
            // drawPolygon(ctx, makePolygonWithAbsolutePosition(entity.position, rotatePolygon(scalePolygon(makeAsteroid(), entity.scale), entity.angle)), secondaryWhite);
            renderFigureInside(entity, makeAsteroid(), ctx, (ctx: CanvasRenderingContext2D, polygon: readonly Vector2[], position: Vector2, entity: Entity) => {
                drawPolygon(ctx, makePolygonWithAbsolutePosition(position, rotatePolygon(scalePolygon(polygon, entity.scale), entity.angle)), secondaryWhite);
            });
        }
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
