
export type Vector2 = {
    x: number,
    y: number
};

export function scalePolygon(polygon: readonly Vector2[], xScaleFactor: number, yScaleFactor = xScaleFactor) : Vector2[] {
    return polygon.map(point => ({
        x: point.x * xScaleFactor,
        y: point.y * yScaleFactor,
    }));
}

export function makePolygonWithAbsolutePosition(position: Vector2, polygon: readonly Vector2[]): Vector2[] {
    return polygon.map(point => ({
        x: position.x + point.x,
        y: position.y + point.y
    }));
}

export function drawPolygon(ctx: CanvasRenderingContext2D, polygon: readonly Vector2[]) {
    let point: Vector2 = polygon[0];
    const { width, height } = ctx.canvas;
    ctx.beginPath();
    ctx.moveTo((point.x+1)/2 * width, height - (point.y+1)/2 * height);
    for (let i = 1; i < polygon.length; i++) {
        point = polygon[i];
        ctx.lineTo((point.x+1)/2 * width, height - (point.y+1)/2 * height);
    }
    point = polygon[0];
    ctx.lineTo((point.x+1)/2 * width, height - (point.y+1)/2 * height);
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
}
