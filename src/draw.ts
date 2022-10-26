
export type Vector2 = {
    x: number,
    y: number
};

export function drawPolygon(ctx: CanvasRenderingContext2D, position: Vector2, polygon: readonly Vector2[]) {
    let point: Vector2 = polygon[0];
    ctx.beginPath();
    ctx.moveTo(position.x + point.x, position.y + point.y);
    for (let i = 1; i < polygon.length; i++) {
        point = polygon[i];
        ctx.lineTo(position.x + point.x, position.y + point.y);
    }
    point = polygon[0];
    ctx.lineTo(position.x + point.x, position.y + point.y);
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
}
