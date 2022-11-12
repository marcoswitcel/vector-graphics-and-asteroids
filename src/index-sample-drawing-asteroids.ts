import { distance, drawCircle, drawLine, drawPoint, drawPolygon, makePolygonWithAbsolutePosition, rotatePoint, rotatePolygon, scalePolygon, Vector2 } from "./draw.js";
import { Entity, fragmentationAllowed, hittedMark } from "./entity.js";
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
    const entity = new Entity({ x, y }, { x: -0.02 * Math.random(), y: -0.02 * Math.random() }, { x: 0, y: 0 }, Math.random(), 'asteroids', 0.33, 0.3);
    entity.components[fragmentationAllowed] = 4;
    return entity;
});

const eventLoop = new EventLoop();

function fragmentAsteroid(entity: Entity, numberOfFragments = 4): Entity[] {
    const fragments: Entity[] = [];

    for (let i = 0; i < numberOfFragments; i++) {
        const scale = entity.scale / numberOfFragments;
        const fragmentAngle = entity.angle + (i * Math.PI / 2);
        const radius = rotatePoint({ x: 0, y: entity.scale }, fragmentAngle);
        const position = {
            x: entity.position.x + radius.x,
            y: entity.position.y + radius.y,
        };
        const velocity = rotatePoint({ x: entity.velocity.x * 0.85, y: entity.velocity.y * 0.85 }, (i * Math.PI / 8));
        const hitRadius = entity.hitRadius / numberOfFragments;
        const fragment = new Entity(position, velocity, { x: 0, y: 0 }, entity.angle, entity.type, hitRadius, scale);
        if (numberOfFragments / 2 > 1) {
            fragment.components[fragmentationAllowed] = numberOfFragments / 2;
        }
        fragments.push(fragment);
    }

    return fragments;
}


eventLoop.add((time: number) => {

    // Removendo marca antiga
    //entities = entities.filter(entity => entity.type !== 'mark');    

    // Adicionando marca se houver
    // if (clickedPosition) {
    //     const entity = new Entity(clickedPosition, { x: 0, y: 0 }, { x: 0, y: 0 }, 0, 'mark');
    //     clickedPosition = null;
    //     entities.push(entity);
    // }

    if (clickedPosition) {
        for (const entity of entities) {
            if (distance(clickedPosition, entity.position) < entity.hitRadius) {
                entity.components[hittedMark] = true;
            }
        }
        clickedPosition = null;
    }
});

eventLoop.add((time: number) => {
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
        if (entity.type === 'mark') {
            drawPoint(ctx, entity.position);
        } else {
            drawPolygon(ctx, makePolygonWithAbsolutePosition(entity.position, rotatePolygon(scalePolygon(makeAsteroid(), entity.scale), entity.angle)));
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

eventLoop.start();
