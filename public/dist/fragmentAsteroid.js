import { rotatePoint } from "./draw.js";
import { Entity, fragmentationAllowed } from "./entity.js";
export function fragmentAsteroid(entity, numberOfFragments = 4) {
    const fragments = [];
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
