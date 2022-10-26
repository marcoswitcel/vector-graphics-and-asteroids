
export type Vector2 = {
    x: number,
    y: number
};

export function makePolygonWithAbsolutePosition(position: Vector2, polygon: readonly Vector2[]): Vector2[] {
    return polygon.map(point => ({
        x: position.x + point.x,
        y: position.y + point.y
    }));
}

export function drawPolygon(ctx: CanvasRenderingContext2D, polygon: readonly Vector2[]) {
    let point: Vector2 = polygon[0];
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    for (let i = 1; i < polygon.length; i++) {
        point = polygon[i];
        ctx.lineTo(point.x, point.y);
    }
    point = polygon[0];
    ctx.lineTo(point.x, point.y);
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
}
