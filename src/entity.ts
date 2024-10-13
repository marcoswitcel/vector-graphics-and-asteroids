import { Vector2 } from './draw.js';

export const createdAtTimestamp = Symbol('createdAtTimestamp');
export const liveTimeInMilliseconds = Symbol('liveTimeInMilliseconds');
export const hittedMark = Symbol('hittedMark');
export const fragmentationAllowed = Symbol('fragmentationAllowed');
export const lineFigure = Symbol('lineFigure');

export type EntityType = 'player' | 'shoot' | 'asteroids' | 'fragments' | 'entity';

/**
 * @note João, considerar criar um atributo para indicar que a entidade deve ser
 * removida ao final do frame e começar a usar este mesmo atributo para evitar
 * tantas criações de listas filtros e iterações desncessárias para criar estas
 * listas. Talvez um outra estrutura de dados fosse útil também, mas isso é
 * outra história.
 */
export class Entity {
    public type: EntityType;
    public position: Vector2;
    public velocity: Vector2;
    public acceleration: Vector2;
    public angle: number;
    public hitRadius: number;
    public scale: number;
    public angularVelocity: number;
    public angularAcceleration: number;
    public toBeRemoved: boolean;
    public components: { [createdAtTimestamp]?: number, [liveTimeInMilliseconds]?: number, [hittedMark]?: boolean, [fragmentationAllowed]?: number, [lineFigure]?: Vector2[] };

    constructor(position: Vector2, velocity: Vector2, acceleration: Vector2, angle: number, type: EntityType = 'entity', hitRadius = 0, scale = 0.01, angularVelocity = 0, angularAcceleration = 0) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.angle = angle;
        this.type = type;
        this.hitRadius = hitRadius;
        this.scale = scale;
        this.angularVelocity = angularVelocity;
        this.angularAcceleration = angularAcceleration;
        this.toBeRemoved = false;
        this.components = {};
    }
}

export function makeDefaultPlayer(): Entity {
    return new Entity({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, 0, 'player', 0.07, 0.08); 
}
