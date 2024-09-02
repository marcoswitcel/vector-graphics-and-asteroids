import { centralizePoint, distance, drawCircle, drawComplexShape, drawLine, drawPolygon, drawText, makePointAbsolute, makePolygonWithAbsolutePosition, rotatePoint, rotatePolygon, scalePoint, scalePolygon, Vector2 } from './draw.js';
import { Entity, createdAtTimestamp, hittedMark, fragmentationAllowed, lineFigure } from './entity.js';
import { EventLoop } from './event-loop.js';
import { makeAsteroid, makeShipBackwardsFigure, makeShipForwardFigure, makeShipStandingFigure } from './figure.js';
import { KeyBoardInput } from './keyboard-input.js';
import { countEntitiesByType, fragmentAsteroid, renderFigureInside } from './utils.js';

/**
 * Função que monta o estado e a sequência de execução da simulação.
 * 
 * @param canvas elemento canvas aonde deve ser renderizada a cena
 * @returns o `EventLoop` configurado com a lógica da simulação
 */
export function createMainSimulation(canvas: HTMLCanvasElement): EventLoop {

    const ctx = canvas.getContext('2d');
    if (ctx === null) throw 'Contexto nulo';

    /**
     * @todo João, seria interessante organizar essas variáveis em algum tipo de GameObject
     * para que as variáveis de estado do jogo não fiquem espalhadas pelo arquivo e mal 
     * documentadas de certo modo, pois no final do dia é só uma variável global que pode
     * referir a qualquer parte do processo de execução do jogo. Outro motivo interessante 
     * é que se tivermos algum tipo de classe aí sim poderemos ter múltiplas instâncias do
     * jogo rodando em uma mesma página.
     */
    let moving = false;
    let forward = false;
    let asteroidsDestroyedCounter = 0;
    const playerAcceleration = { x: 0, y: 0.45 };
    const entityPlayer = new Entity({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, 0, 'player', 0.07, 0.08);
    const shipStandingFigure = makeShipStandingFigure();
    const shipForwardFigure = makeShipForwardFigure();
    const shipBackwardsFigure = makeShipBackwardsFigure();
    /**
     * Função que monta a onda de asteróides
     * @note João, definir os parâmetros necessários para poder customizar aspectos da
     * onda de asteróides montada. Usar número pseudo-randômicos?
     * @todo João, acho que seria legal adicionar parâmetros para controlar a velocidade
     * base, tamanho base e quantidade de elementos. Isso pode permitir implementar
     * a variedade de asteróides necessários.
     * @returns lista de asteróides criados para a nova onda
     */
    const createAsteroidsWave = () => Array(3).fill(0).map(() => {
        const isVerticalBorder = Math.random() > 0.5;
        const x = isVerticalBorder ? Math.random() * 2 - 1 : Math.round(Math.random()) * 2 - 1;
        const y = isVerticalBorder ? Math.round(Math.random()) * 2 - 1 : Math.random() * 2 - 1;
        const scale = 0.10 + Math.random() * 0.09;
        const hitRadius = scale * 1.2;
        const factor = 0.5;
        const defaultVelocity = { x: -0.3 * factor, y: -0.54 * factor };
        defaultVelocity.x *= Math.random() > 0.5 ? -1 : 1;
        defaultVelocity.y *= Math.random() > 0.5 ? -1 : 1;

        const entity = new Entity({ x, y }, defaultVelocity, { x: 0, y: 0 }, 0, 'asteroids', hitRadius, scale, -0.6);
        entity.components[fragmentationAllowed] = 4;
        return entity;
    });
    let entities = [ entityPlayer ];
    let shootWaitingToBeEmmited = false;
    const primaryWhite = '#FFFFFF';
    const secondaryWhite = 'rgba(255,255,255,0.7)';

    const eventLoop = new EventLoop();
    const keyBoardInput = new KeyBoardInput({ autoStart: true });
    let debug = false;
    let debugHitRadius = false;


    const emmitShoot = (player: Entity, entities: Entity[]) => {
        const radius = rotatePoint({ x: 0, y: 0.03 }, entityPlayer.angle);
        const position = { x: player.position.x + radius.x, y: player.position.y + radius.y };
        const velocity = rotatePoint({ x: 0, y: 1.2 }, entityPlayer.angle);
        const shootEntity = new Entity(position, velocity, { x: 0, y: 0 }, player.angle, 'shoot');
        shootEntity.components[createdAtTimestamp] = Date.now();
        entities.push(shootEntity);
    }

    keyBoardInput.addListener('keyup.1', () => {
        debug = !debug;
    });
    keyBoardInput.addListener('keyup.2', () => {
        debugHitRadius = !debugHitRadius;
    });

    keyBoardInput.addListener('keyup. ', () => {
        if (!entityPlayer.components[hittedMark]) {
            shootWaitingToBeEmmited = true;
        }
    });
    
    keyBoardInput.addListener('keyup.r', () => {
        asteroidsDestroyedCounter = 0;
        entities.length = 0;

        // @note melhorar esse processo, rotina de inicialização?
        entityPlayer.components[hittedMark] = false;
        entityPlayer.toBeRemoved = false;
        entityPlayer.position = { x: 0, y: 0 };
        entityPlayer.velocity = { x: 0, y: 0 };
        entityPlayer.position = { x: 0, y: 0 };
        entityPlayer.angle = 0;

        entities.push(entityPlayer);
    });

    /**
     * Função responsável pelo processamento de input
     * Primeira etapa do processo, entrada de input e aplicação das lógicas
     * definidas.
     */
    eventLoop.add((timestamp: number, deltaTime: number) => {
        const angularVelocitySpaceShipTurn = 3.5;
        if (keyBoardInput.isKeyPressed('d')) {
            entityPlayer.angle += -angularVelocitySpaceShipTurn * deltaTime;
        }
        if (keyBoardInput.isKeyPressed('a')) {
            entityPlayer.angle += angularVelocitySpaceShipTurn * deltaTime;
        }
        
        if (keyBoardInput.areBothKeysPressed('w', 's')) {
            entityPlayer.acceleration.x = 0;
            entityPlayer.acceleration.y = 0;
            moving = false;
        } else  if (keyBoardInput.isKeyPressed('w')) {
            entityPlayer.acceleration = rotatePoint(playerAcceleration, entityPlayer.angle);
            moving = true;
            forward = true;
        } else if (keyBoardInput.isKeyPressed('s')) {
            entityPlayer.acceleration = rotatePoint(playerAcceleration, entityPlayer.angle);
            entityPlayer.acceleration.x *= -1;
            entityPlayer.acceleration.y *= -1;
            moving = true;
            forward = false;
        } else {
            entityPlayer.acceleration.x = 0;
            entityPlayer.acceleration.y = 0;
            moving = false;
        }

        if (shootWaitingToBeEmmited && !entityPlayer.components[hittedMark]) {
            emmitShoot(entityPlayer, entities);
            shootWaitingToBeEmmited = false;
        }

        /**
         * @todo João, achar um lugar melhora para esse funcionalidade a seguir
         * @todo João, escrever um utilitário para contar e um para pegar entidades de um tipo
         */
        if (countEntitiesByType(entities, 'asteroids') === 0) {
            entities.push(...createAsteroidsWave());
        }
    });

    /**
     * Função responsável pela detecção de colisões
     * Aqui é feito a detecção da colisão e registrado para o posterior processamento
     */
    eventLoop.add((time: number) => {
        /**
         * @note Remove as entidades com "createdAtTimestamp"com mais de 1,5 segundos de vida,
         * embora não seja essa a única utilidade desse componente, por hora só é usado para isso
         */
        
        const now = Date.now();
        entities = entities.filter(entity => {
            return !(entity.components[createdAtTimestamp] && now - entity.components[createdAtTimestamp] > 1500);
        });

        const shootEntities = entities.filter(entity => entity.type === 'shoot');

        for (const entity of entities) {
            if (entity.type !== 'asteroids') continue;

            for (const shootEntity of shootEntities) {
                /**
                 * @todo João, não testei, mas por dedução imagino que esse check abaixo não
                 * é o suficiente para checar todos os tipos de colisão possíveis. Como
                 * o espaço do jogo é fechado e conectado a colisão pode acontecer entre
                 * bordas opostas. O mesmo vale para o cheque de colisão do jogador.
                 */
                if (distance(entity.position, shootEntity.position) < (entity.hitRadius + shootEntity.hitRadius)) {
                    entity.components[hittedMark] = true;
                    shootEntity.components[hittedMark] = true;
                }
            }
            /**
             * @todo João, ler nota acima
             */
            if (distance(entity.position, entityPlayer.position) < (entity.hitRadius + entityPlayer.hitRadius)) {
                entityPlayer.components[hittedMark] = true;
            }
        }
    });

    /**
     * Função responsável por fragmentar os asteróides onde `hittedMark === true`
     */
    eventLoop.add((time: number) => {
        const hittedAsteroids = entities.filter(entity => entity.components[hittedMark] && entity.type === 'asteroids');
        if (hittedAsteroids.length === 0) return;

        const allFragments: Entity[] = [];

        for (const hittedAsteroid of hittedAsteroids) {
            const numberOfFragmentation = hittedAsteroid.components[fragmentationAllowed];
            if (numberOfFragmentation) {
                const fragments = fragmentAsteroid(hittedAsteroid, numberOfFragmentation);
                allFragments.push(...fragments);
            }

            /**
             * @note implementação temporária, reavaliar se aqui é o melhor lugar para incrementar o contador
             */
            asteroidsDestroyedCounter++;
        }

        entities = entities.filter(entity => !entity.components[hittedMark] || entity.type === 'player');
        entities.push(...allFragments);
    });

    /**
     * Função responsável por fragmentar o player caso ele esteja marcado com `hittedMark === true`
     */
    eventLoop.add((time: number) => {
        if (!entityPlayer.components[hittedMark] || entityPlayer.toBeRemoved) return;

        entityPlayer.toBeRemoved = true;
        entities = entities.filter(entity => entity !== entityPlayer);
        
        // Por hora é aí que está a figura da nave sem as chamas do propulsor
        const shape = shipStandingFigure.shapes[0];
        const drawInfo = shipStandingFigure.drawInfo[0];
        const polygon = makePolygonWithAbsolutePosition(drawInfo.position, rotatePolygon(scalePolygon(shape.polygon, drawInfo.scale), drawInfo.angle));

        for (let i = 0; polygon.length > 1 && i < polygon.length; i++) {
            let p0 = polygon[i];
            const nextIndex = i + 1 === polygon.length ? 0 : i + 1;
            let p1 = polygon[nextIndex];

            let aP0 = makePointAbsolute(entityPlayer.position, scalePoint(p0, entityPlayer.scale));
            let aP1 = makePointAbsolute(entityPlayer.position, scalePoint(p1, entityPlayer.scale));
            const position = {
                ...entityPlayer.position
            };

            position.x = (aP0.x - aP1.x) / 2 + aP1.x;
            position.y = (aP0.y - aP1.y) / 2 + aP1.y;

            const newCenter = {
                x: (p0.x - p1.x) / 2 + p1.x,
                y: (p0.y - p1.y) / 2 + p1.y,
            }

            p0 = centralizePoint(rotatePoint(p0, entityPlayer.angle), newCenter);
            p1 = centralizePoint(rotatePoint(p1, entityPlayer.angle), newCenter);

            const velocity = rotatePoint({ ...entityPlayer.velocity  }, (i * Math.PI / 8));
            const entity = new Entity(position, velocity, { x: 0, y: 0 }, entityPlayer.angle, 'fragments', 0.09, 0.08, -1.6 - 0.8 * i / polygon.length);
            entity.components[lineFigure] = [p0, p1];

            entities.push(entity);
        }
    });

    /**
     * Função responsável por computar a "física" da simulação e as devidas restrições
     * O modelo físico usado é bem básico e possivelmente incorreto, então nem compararei
     * o basta dizer, é que ele leva em consideração a posição, velocidade e aceleração 
     * das entidades para posicioná-las nas suas novas coordenadas. Também é importante
     * anotar que é aqui onde a restrição do espaço a um ambiente com as laterais conectadas
     * acontece.
     */
    eventLoop.add((timestamp: number, deltaTime: number) => {
        for (const entity of entities) {
            // computando velocidade
            entity.velocity.x += entity.acceleration.x * deltaTime;
            entity.velocity.y += entity.acceleration.y * deltaTime;

            // computando nova posição
            entity.position.x += entity.velocity.x * deltaTime;
            entity.position.y += entity.velocity.y * deltaTime;

            // limitando o espaço e fazendo o efeito de "sair do outro lado da tela"
            const xAbs = Math.abs(entity.position.x)
            if (xAbs > 1) {
                const diff = xAbs - 1;
                entity.position.x = (xAbs - 2 * diff) * (entity.position.x / xAbs * -1);
            }
            const yAbs = Math.abs(entity.position.y)
            if (yAbs > 1) {
                const diff = yAbs - 1;
                entity.position.y = (yAbs - 2 * diff) * (entity.position.y / yAbs * -1);
            }

            entity.angle += entity.angularVelocity * deltaTime;
        }
    });

    /**
     * Função responsável pela renderização da cena
     * Hoje para realizar esse processo só é necessário
     * iterar pela lista das entidades e aplicar os processos de renderização
     * definidos para cada entidade. Talvez no futuro alguma etapa para emitir
     * requisições de renderização seja incluída para poder aplicar efeitos de
     * forma mais sustentável e eficiente, mas hoje é só isso que é necessário.
     */
    eventLoop.add((time: number) => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Deixando a largura da linha escalável
        const lineWidth = Math.max(1, canvas.width * 0.002); 
        const playerFigure = moving
            ? (forward ? shipForwardFigure : shipBackwardsFigure)
            : shipStandingFigure;

        for (const entity of entities) {
            if (entity.type === 'player') {
                // @todo João, avaliar essa solução, visualmente está correto, porém acredito que a função `renderFigureInside` apesar de funcionar
                // trás uma complexidade desnecessária, acho que seria interessante nessa etapa apenas acumular as figuras que devem ser
                // desenhadas e em um próximo loop fazer a renderização de fato.
                // drawPolygon(ctx, makePolygonWithAbsolutePosition(entity.position, rotatePolygon(scalePolygon(polygon, entity.scale), entity.angle)), primaryWhite);
                renderFigureInside(entity, [], ctx, (ctx: CanvasRenderingContext2D, _: readonly Vector2[], position: Vector2, entity: Entity) => {
                    drawComplexShape(ctx, playerFigure, position, entity.scale, entity.angle, primaryWhite, lineWidth);
                });
            } else if (entity.type === 'shoot') {
                const startPosition = {
                    x: entity.position.x + entity.velocity.x * -0.0075,
                    y: entity.position.y + entity.velocity.y * -0.0075,
                };
                const endPosition = {
                    x: entity.position.x + entity.velocity.x * 0.0075,
                    y: entity.position.y + entity.velocity.y * 0.0075,
                };
                drawLine(ctx, startPosition, endPosition, primaryWhite, lineWidth);
            } else if (entity.type === 'asteroids') {
                // @todo João, avaliar essa solução, visualmente está correto, porém acredito que a função `renderFigureInside` apesar de funcionar
                // trás uma complexidade desnecessária, acho que seria interessante nessa etapa apenas acumular as figuras que devem ser
                // desenhadas e em um próximo loop fazer a renderização de fato.
                // drawPolygon(ctx, makePolygonWithAbsolutePosition(entity.position, rotatePolygon(scalePolygon(makeAsteroid(), entity.scale), entity.angle)), secondaryWhite);
                renderFigureInside(entity, makeAsteroid(), ctx, (ctx: CanvasRenderingContext2D, polygon: readonly Vector2[], position: Vector2, entity: Entity) => {
                    drawPolygon(ctx, makePolygonWithAbsolutePosition(position, rotatePolygon(scalePolygon(polygon, entity.scale), entity.angle)), secondaryWhite, lineWidth);
                });
            } else if (entity.type === 'fragments') {
                // @todo João, otimizar a renderização, implementar uma função para renderizar polígonos abertos
                // por hora está renderizando com o `drawPolygon`, que está fechando a linha e desenhando uma linha
                // sobreposta
                renderFigureInside(entity, entity.components[lineFigure] as Vector2[], ctx, (ctx: CanvasRenderingContext2D, polygon: readonly Vector2[], position: Vector2, entity: Entity) => {
                    drawPolygon(ctx, makePolygonWithAbsolutePosition(position, rotatePolygon(scalePolygon(polygon, entity.scale), entity.angle)), secondaryWhite, lineWidth);
                });
            } else {
                // @note por hora todas entidades com tipos diferentes não são renderizadas
            }
        }

        /**
         * Nesse primeiro momento os textos serão desenhados separadamente,
         * mas poderiam passar pelo sistema de entidades.
         */
        drawText(ctx, `${asteroidsDestroyedCounter}`, { x: -0.97, y: 0.91 }, 0.06, '#FFFFFF', 'monospace', 'left');
    });

    /**
     * Renderiza informação visual da área de hit
     * Quando apertado 2 no teclado esse recurso é ativado ou desativado
     */
    eventLoop.add((time: number) => {
        if (!debugHitRadius) return;

        // Deixando a largura da linha escalável
        const lineWidth = Math.max(1, canvas.width * 0.002);
        
        for (const entity of entities) {
            if (entity.hitRadius) {
                const color = entity.components[hittedMark] ? '#00FF00' : '#FF0000';
                // @todo João, avaliar aqui se faz sentido fazer dessa forma
                // drawCircle(ctx, entity.position, entity.hitRadius, color);
                renderFigureInside(entity, [], ctx, (ctx: CanvasRenderingContext2D, polygon: readonly Vector2[], position: Vector2, entity: Entity) => {
                    drawCircle(ctx, position, entity.hitRadius, color,lineWidth);
                });
            }
        }
    });

    // Renderiza informação visual de debug
    eventLoop.add((time: number) => {
        if (!debug) return;

        // Deixando a largura da linha escalável
        const lineWidth = Math.max(1, canvas.width * 0.002);
        
        for (const entity of entities) {
            const endPosition = {
                x: entity.position.x + entity.acceleration.x,
                y: entity.position.y + entity.acceleration.y,
            };
            drawLine(ctx, entity.position, endPosition, undefined, lineWidth);
        }
    });
    
    return eventLoop;
}
