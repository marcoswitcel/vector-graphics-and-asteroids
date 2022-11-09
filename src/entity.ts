import { Vector2 } from "./draw";

export const createdAtTimestamp = Symbol('createdAtTimestamp');
export const hittedMark = Symbol('hittedMark');

export class Entity {
    public type: string;
    public position: Vector2;
    public velocity: Vector2;
    public acceleration: Vector2;
    // @todo João, modelar melhor essa propriedade
    public angle: number;
    public hitRadius: number;
    public components: { [createdAtTimestamp]?: number, [hittedMark]?: boolean };

    constructor(position: Vector2, velocity: Vector2, acceleration: Vector2, angle: number, type = 'entity', hitRadius = 0) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.angle = angle;
        this.type = type;
        this.hitRadius = hitRadius;
        this.components = {};
    }
}
