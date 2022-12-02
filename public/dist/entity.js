export const createdAtTimestamp = Symbol('createdAtTimestamp');
export const hittedMark = Symbol('hittedMark');
export const fragmentationAllowed = Symbol('fragmentationAllowed');
export class Entity {
    constructor(position, velocity, acceleration, angle, type = 'entity', hitRadius = 0, scale = 0.01, angularVelocity = 0) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.angle = angle;
        this.type = type;
        this.hitRadius = hitRadius;
        this.scale = scale;
        this.angularVelocity = angularVelocity;
        this.components = {};
    }
}
