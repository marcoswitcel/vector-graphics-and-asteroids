import { rotatePoint } from "./draw.js";
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
        const fragment = new Entity(position, velocity, { x: 0, y: 0 }, entity.angle, entity.type, hitRadius, scale);
        if (numberOfFragments / 2 > 1) {
            fragment.components[fragmentationAllowed] = numberOfFragments / 2;
        }
        fragments.push(fragment);
    }

    return fragments;
}
