import { rotatePoint, Vector2 } from "./draw.js";
import { Entity, fragmentationAllowed } from "./entity.js";

/**
 * Cria um canvas com as dimensões especificadas e adiciona ele a algum elemnto
 * caso o parâmetro `appendTo` seja especificado
 * @param width Largura inicial do canvas
 * @param height Altura inicial do canvas
 * @param appendTo O elemento especificado através dessa propriedade
 * terá o canvas adicionado a sua lista de filhos
 * @returns Canvas recém criado
 */
export function createCanvas(width: number, height: number, appendTo?: HTMLElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    if (appendTo) {
        appendTo.appendChild(canvas);
    }

    return canvas;
}

/**
 * Função que "fragmenta" um asteroide em asteroides menores.
 * @observation Essa função pode gerar entidades com a posição fora do
 * espaço -1 à 1, então as novas entidades precisam te sua posição "revisada"
 * para seguir as regras da simulação. Isso acontecerá automaticamente se
 * as entidades forem adicionadas antes da etapa que aplica a regra de
 * "virada" de um lado para o outro da tela.
 * @param entity Entidade que será fragmentada, por hora apenas serve para
 * asteroides, apesar de já ser parcealmente aplicável a outras entidades.
 * @param numberOfFragments Número de fragmentos a serem criados
 * @returns A lista com as entidades criadas a partir da entidade original
 */
export function fragmentAsteroid(entity: Entity, numberOfFragments = 4): Entity[] {
    const fragments: Entity[] = [];
    const fragmentScaleFactor = 1.5;

    for (let i = 0; i < numberOfFragments; i++) {
        const scale = entity.scale / numberOfFragments * fragmentScaleFactor;
        const fragmentAngle = entity.angle + (i * Math.PI / 2);
        const radius = rotatePoint({ x: 0, y: entity.scale }, fragmentAngle);
        const position = {
            x: entity.position.x + radius.x,
            y: entity.position.y + radius.y,
        };
        const velocity = rotatePoint({ x: entity.velocity.x * 0.85, y: entity.velocity.y * 0.85 }, (i * Math.PI / 8));
        const hitRadius = entity.hitRadius / numberOfFragments * fragmentScaleFactor;
        const fragment = new Entity(position, velocity, { x: 0, y: 0 }, entity.angle, entity.type, hitRadius, scale, entity.angularVelocity);
        if (numberOfFragments / 2 > 1) {
            fragment.components[fragmentationAllowed] = numberOfFragments / 2;
        }
        fragments.push(fragment);
    }

    return fragments;
}

/**
 * Função que renderiza a figura de forma espelhada em todas as posições necessárias para parecer
 * que a figura está atravessando as bordas e aparecendo do outro lado.
 * @todo João, avaliar se faz sentido fazer dessa forma. Acredito que isso agregue complexidade.
 */
export function renderFigureInside(entity: Entity, figure: Vector2[], ctx: CanvasRenderingContext2D, drawFunction: (ctx: CanvasRenderingContext2D, polygon: readonly Vector2[], position: Vector2, entity: Entity) => void) {
    const isCrossingX = Math.abs(entity.position.x) + entity.hitRadius > 1;
    const isCrossingY = Math.abs(entity.position.y) + entity.hitRadius > 1; 
    const outterX = Math.abs(entity.position.x) + entity.hitRadius - 1;
    const outterY = Math.abs(entity.position.y) + entity.hitRadius - 1;

    if (isCrossingX && isCrossingY) {
        const cornerPosition = {
            x: (entity.position.x > 0 ? -1 - entity.hitRadius + outterX : 1 + entity.hitRadius - outterX),
            y: (entity.position.y > 0 ? -1 - entity.hitRadius + outterY : 1 + entity.hitRadius - outterY),
        };
        drawFunction(ctx, figure, cornerPosition, entity);
    }
    
    if (isCrossingY) {
        const topPosition = {
            x: entity.position.x,
            y: (entity.position.y > 0 ? -1 - entity.hitRadius + outterY : 1 + entity.hitRadius - outterY),
        };
        drawFunction(ctx, figure, topPosition, entity);
    }
    
    if (isCrossingX) {
        const leftPosition = {
            x: (entity.position.x > 0 ? -1 - entity.hitRadius + outterX : 1 + entity.hitRadius - outterX),
            y: entity.position.y,
        };
        drawFunction(ctx, figure, leftPosition, entity);
    }

    drawFunction(ctx, figure, entity.position, entity);
}
