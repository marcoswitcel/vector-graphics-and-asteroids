import { ComplexShape, DrawInfo, Shape } from "./draw.js";
export const makeAsteroid = () => [
    { x: -1, y: 0.2 },
    { x: -0.4, y: 1 },
    { x: -0.2, y: 1 },
    { x: 0.10, y: 0.75 },
    { x: 0.40, y: 0.78 },
    { x: 0.75, y: 1 },
    { x: 1, y: 0.6 },
    { x: 0.75, y: 0.2 },
    { x: 1, y: 0 },
    { x: 1, y: -0.55 },
    { x: 0.6, y: -1 },
    { x: -0.30, y: -1 },
    { x: -0.45, y: -0.8 },
    { x: -0.20, y: -0.4 },
    { x: -0.70, y: -0.6 },
    { x: -1, y: -0.4 },
];
export const makeTriangle = () => [
    { x: 0, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
];
export const makeSpaceShip = () => [
    { x: 0, y: 0.8 },
    { x: 0.8, y: -0.6 },
    { x: 0.4, y: -0.4 },
    { x: -0.4, y: -0.4 },
    { x: -0.8, y: -0.6 },
];
export const makeShipStandingFigure = () => new ComplexShape([
    new Shape(makeSpaceShip()),
], [
    new DrawInfo({ x: 0, y: 0 }, 1, 0),
]);
export const makeShipForwardFigure = () => new ComplexShape([
    new Shape(makeSpaceShip()),
    new Shape(makeTriangle()),
    new Shape(makeTriangle()),
], [
    new DrawInfo({ x: 0, y: 0 }, 1, 0),
    new DrawInfo({ x: -0.25, y: -0.55 }, 0.15, 3.14),
    new DrawInfo({ x: 0.25, y: -0.55 }, 0.15, 3.14),
]);
export const makeShipBackwardsFigure = () => new ComplexShape([
    new Shape(makeSpaceShip()),
    new Shape(makeTriangle()),
    new Shape(makeTriangle()),
], [
    new DrawInfo({ x: 0, y: 0 }, 1, 0),
    new DrawInfo({ x: -0.25, y: -0.55 }, 0.15, 0),
    new DrawInfo({ x: 0.25, y: -0.55 }, 0.15, 0),
]);
