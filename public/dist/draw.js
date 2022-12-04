export function distance(a, b) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}
export function scalePolygon(polygon, xScaleFactor, yScaleFactor = xScaleFactor) {
    return polygon.map(point => ({
        x: point.x * xScaleFactor,
        y: point.y * yScaleFactor,
    }));
}
export function rotatePolygon(polygon, angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    return polygon.map(point => {
        return {
            x: point.x * cos - point.y * sin,
            y: point.x * sin + point.y * cos
        };
    });
}
export function rotatePoint(point, angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    return {
        x: point.x * cos - point.y * sin,
        y: point.x * sin + point.y * cos
    };
}
export function makePolygonWithAbsolutePosition(position, polygon) {
    return polygon.map(point => ({
        x: position.x + point.x,
        y: position.y + point.y
    }));
}
export function drawPolygon(ctx, polygon, strokeStyle = '#FFFFFF') {
    let point = polygon[0];
    const { width, height } = ctx.canvas;
    ctx.beginPath();
    ctx.moveTo((point.x + 1) / 2 * width, height - (point.y + 1) / 2 * height);
    for (let i = 1; i < polygon.length; i++) {
        point = polygon[i];
        ctx.lineTo((point.x + 1) / 2 * width, height - (point.y + 1) / 2 * height);
    }
    point = polygon[0];
    ctx.lineTo((point.x + 1) / 2 * width, height - (point.y + 1) / 2 * height);
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
}
export function drawLine(ctx, pointA, pointB, strokeStyle = '#FFFFFF') {
    const { width, height } = ctx.canvas;
    ctx.beginPath();
    ctx.moveTo((pointA.x + 1) / 2 * width, height - (pointA.y + 1) / 2 * height);
    ctx.lineTo((pointB.x + 1) / 2 * width, height - (pointB.y + 1) / 2 * height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
}
export function drawPoint(ctx, position, fillStyle = '#FFFFFF') {
    const { width, height } = ctx.canvas;
    ctx.fillStyle = fillStyle;
    ctx.fillRect((position.x + 1) / 2 * width, height - (position.y + 1) / 2 * height, 1, 1);
}
export function drawCircle(ctx, position, radius, strokeStyle = '#FFFFFF') {
    const { width, height } = ctx.canvas;
    ctx.beginPath();
    ctx.arc((position.x + 1) / 2 * width, height - (position.y + 1) / 2 * height, radius * width / 2, 0, 2 * Math.PI);
    ctx.lineWidth = 1;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
}
export class Shape {
    constructor(polygon) {
        this.polygon = polygon;
    }
}
export class DrawInfo {
    constructor(position, scale, angle) {
        this.position = position;
        this.scale = scale;
        this.angle = angle;
    }
}
export class ComplexShape {
    constructor(shapes, drawInfo) {
        this.shapes = shapes;
        this.drawInfo = drawInfo;
    }
}
/**
 * @todo João, testar mais
 */
export function drawComplexShape(ctx, complexShape, position, scale, angle, strokeStyle = '#FFFFFF') {
    for (let index = 0; index < complexShape.shapes.length; index++) {
        const shape = complexShape.shapes[index];
        const drawInfo = complexShape.drawInfo[index];
        let polygon = makePolygonWithAbsolutePosition(drawInfo.position, rotatePolygon(scalePolygon(shape.polygon, drawInfo.scale), drawInfo.angle));
        polygon = makePolygonWithAbsolutePosition(position, rotatePolygon(scalePolygon(polygon, scale), angle));
        drawPolygon(ctx, polygon, strokeStyle);
    }
}
