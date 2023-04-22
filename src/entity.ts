import { Vector2 } from './draw.js';

export const createdAtTimestamp = Symbol('createdAtTimestamp');
export const hittedMark = Symbol('hittedMark');
export const fragmentationAllowed = Symbol('fragmentationAllowed');
export const lineFigure = Symbol('lineFigure');

/**
 * @note João, considerar criar um atributo para indicar que a entidade deve ser
 * removida ao final do frame e começar a usar este mesmo atributo para evitar
 * tantas criações de listas filtros e iterações desncessárias para criar estas
 * listas. Talvez um outra estrutura de dados fosse útil também, mas isso é
 * outra história.
 */
export class Entity {
    public type: string;
    public position: Vector2;
    public velocity: Vector2;
    public acceleration: Vector2;
    // @todo João, modelar melhor essa propriedade
    public angle: number;
    public hitRadius: number;
    public scale: number;
    public angularVelocity: number;
    public toBeRemoved: boolean;
    public components: { [createdAtTimestamp]?: number, [hittedMark]?: boolean, [fragmentationAllowed]?: number, [lineFigure]?: Vector2[] };

    constructor(position: Vector2, velocity: Vector2, acceleration: Vector2, angle: number, type = 'entity', hitRadius = 0, scale = 0.01, angularVelocity = 0) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.angle = angle;
        this.type = type;
        this.hitRadius = hitRadius;
        this.scale = scale;
        this.angularVelocity = angularVelocity;
        this.toBeRemoved = false;
        this.components = {};
    }
}
