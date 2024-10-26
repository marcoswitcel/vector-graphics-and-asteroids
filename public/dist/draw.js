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
export function centralizePoint(point, newCenter) {
    return {
        x: point.x - newCenter.x,
        y: point.y - newCenter.y,
    };
}
export function scalePoint(point, xScaleFactor, yScaleFactor = xScaleFactor) {
    return {
        x: point.x * xScaleFactor,
        y: point.y * yScaleFactor,
    };
}
export function makePointAbsolute(position, point) {
    return {
        x: position.x + point.x,
        y: position.y + point.y
    };
}
export function makePolygonWithAbsolutePosition(position, polygon) {
    return polygon.map(point => ({
        x: position.x + point.x,
        y: position.y + point.y
    }));
}
export function drawPolygon(ctx, polygon, strokeStyle = '#FFFFFF', lineWidth = 1) {
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
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
}
export function drawLine(ctx, pointA, pointB, strokeStyle = '#FFFFFF', lineWidth = 1) {
    const { width, height } = ctx.canvas;
    ctx.beginPath();
    ctx.moveTo((pointA.x + 1) / 2 * width, height - (pointA.y + 1) / 2 * height);
    ctx.lineTo((pointB.x + 1) / 2 * width, height - (pointB.y + 1) / 2 * height);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
}
export function drawPoint(ctx, position, fillStyle = '#FFFFFF') {
    const { width, height } = ctx.canvas;
    ctx.fillStyle = fillStyle;
    ctx.fillRect((position.x + 1) / 2 * width, height - (position.y + 1) / 2 * height, 1, 1);
}
export function drawCircle(ctx, position, radius, strokeStyle = '#FFFFFF', lineWidth = 1) {
    const { width, height } = ctx.canvas;
    ctx.beginPath();
    ctx.arc((position.x + 1) / 2 * width, height - (position.y + 1) / 2 * height, radius * width / 2, 0, 2 * Math.PI);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
}
/**
 * @note links úteis:
 * * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign}
 * * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline}
 * * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textRendering}
 *
 * @param ctx contexto atual
 * @param text texto a ser exibido
 * @param position posição do texto
 * @param size tamanho do texto de 0 a 1, será mapeado para uma fração do tamanho do canvas
 * @param fillStyle cor de preenchimento
 * @param fontFamily fonta desejada
 * @param textAlign alinhamento horizontal do texto
 * @param textBaseline alinhamento vertical do texto
 */
export function drawText(ctx, text, position, size, fillStyle = '#FFFFFF', fontFamily = 'monospace', textAlign = 'center', textBaseline = 'middle') {
    const { width, height } = ctx.canvas;
    /**
     * @note A escolha da altura como valor base do escalonamento é arbitrária, poderia ter sido
     * a largura, ou um min ou max de ambas. Só que  no presente momento, ambas os valores devem
     * ser os mesmo, então, não vou inventar complexidades desnecessárias, mas se o cenário mudar
     * preciso atualizar aqui.
     */
    console.assert(width === height, 'A altura e a largura não são iguas. Pode ser interessante atualizar a lógica contida na função `drawText`');
    const sizeInPixels = size * height;
    ctx.font = `${sizeInPixels}px ${fontFamily}`;
    ctx.fillStyle = fillStyle;
    /**
     * @note no geral os métodos de renderização estão sempre renderizando o elemento centralizado,
     * por isso por padrão o texto também estará centralizado vertical e horizontalmente
     */
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.fillText(text, (position.x + 1) / 2 * width, height - (position.y + 1) / 2 * height);
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
 * Desenha 'formas complexas'
 */
export function drawComplexShape(ctx, complexShape, position, scale, angle, strokeStyle = '#FFFFFF', lineWidth = 1) {
    for (let index = 0; index < complexShape.shapes.length; index++) {
        const shape = complexShape.shapes[index];
        const drawInfo = complexShape.drawInfo[index];
        let polygon = makePolygonWithAbsolutePosition(drawInfo.position, rotatePolygon(scalePolygon(shape.polygon, drawInfo.scale), drawInfo.angle));
        polygon = makePolygonWithAbsolutePosition(position, rotatePolygon(scalePolygon(polygon, scale), angle));
        drawPolygon(ctx, polygon, strokeStyle, lineWidth);
    }
}
