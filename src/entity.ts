import { Vector2 } from "./draw";

export class Entity {
    public position: Vector2;
    public velocity: Vector2;
    public acceleration: Vector2;

    constructor(position: Vector2, velocity: Vector2, acceleration: Vector2) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
    }
}
