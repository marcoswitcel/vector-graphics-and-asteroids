import { centralizePoint, distance, drawCircle, drawComplexShape, drawLine, drawPolygon, drawText, makePointAbsolute, makePolygonWithAbsolutePosition, rotatePoint, rotatePolygon, scalePoint, scalePolygon, Vector2 } from './draw.js';
import { Entity, liveTimeInMilliseconds, hittedMark, fragmentationAllowed, lineFigure, makeDefaultPlayer } from './entity.js';
import { EventLoop } from './event-loop.js';
import { makeAsteroid } from './figure.js';
import { GameContext, resolutionScaleNonFullscreen } from './game-context.js';
import { KeyBoardInputInterface } from './keyboard-input-interface.js';
import { KeyBoardInput } from './keyboard-input.js';
import { SoundHandleState, SoundMixer } from './sounds/sound-mixer.js';
import { SoundResourceManager } from './sounds/sound-resource-manager.js';
import { computeResolution, countEntitiesByType, fragmentAsteroid, isFullScreen, renderFigureInside, TextElement, updateWebPageTitleQueued } from './utils.js';
import { VirtualGamepad } from './virtual-gamepad.js';

const primaryWhite = '#FFFFFF';
const secondaryWhite = 'rgba(255,255,255,0.7)';
const backgroundColor = '#000';
const shootEmmitionWindow = 333;

const updateWebPageTitle = (state?: string) => {
    let title = '';
    
    if (state) title += state + ' - ';

    title += 'Gráficos vetoriais e asteroides';

    updateWebPageTitleQueued(title);
};

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
    /**
     * @note João, adicionei mais variedade visual variando o ângulo e
     * a velocidade angular.
     */
    const angle = Math.random() * 180;
    const angularVelocity = -0.6 * (Math.random() > 0.5 ? -1 : 1);

    const entity = new Entity({ x, y }, defaultVelocity, { x: 0, y: 0 }, angle, 'asteroids', hitRadius, scale, angularVelocity);
    entity.components[fragmentationAllowed] = 4;
    return entity;
});

const emmitShoot = (context: GameContext, soundMixer: SoundMixer) => {
    const radius = rotatePoint({ x: 0, y: 0.03 }, context.entityPlayer.angle);
    const position = { x: context.entityPlayer.position.x + radius.x, y: context.entityPlayer.position.y + radius.y };
    const velocity = rotatePoint({ x: 0, y: 1.2 }, context.entityPlayer.angle);
    const shootEntity = new Entity(position, velocity, { x: 0, y: 0 }, context.entityPlayer.angle, 'shoot');
    shootEntity.components[liveTimeInMilliseconds] = 1500;
    context.entities.push(shootEntity);

    // iniciando o som junto com a entidade que representa o 'disparo'
    soundMixer.play('shoot', false, .05);
}

/**
 * Função que monta o estado e a sequência de execução da simulação.
 * 
 * @param canvas elemento canvas aonde deve ser renderizada a cena
 * @returns o `EventLoop` configurado com a lógica da simulação
 */
export function createMainSimulation(canvas: HTMLCanvasElement, virtualGamepad: VirtualGamepad | null): EventLoop<GameContext> {

    const ctx = canvas.getContext('2d');
    if (ctx === null) throw 'Contexto nulo';

    const soundResourceManager = new SoundResourceManager();
    
    soundResourceManager.add('shoot', './resource/audio/fx/alienshoot1.ogg');
    soundResourceManager.add('asteroid-explosion', './resource/audio/fx/explosion.wav');
    soundResourceManager.add('ship-explosion', './resource/audio/fx/NenadSimic - Muffled Distant Explosion.wav');

    soundResourceManager.loadAll();

    const soundMixer = new SoundMixer(soundResourceManager);

    /**
     * @todo João, seria interessante organizar essas variáveis em algum tipo de GameObject
     * para que as variáveis de estado do jogo não fiquem espalhadas pelo arquivo e mal 
     * documentadas de certo modo, pois no final do dia é só uma variável global que pode
     * referir a qualquer parte do processo de execução do jogo. Outro motivo interessante 
     * é que se tivermos algum tipo de classe aí sim poderemos ter múltiplas instâncias do
     * jogo rodando em uma mesma página.
     */
    let textToDrawn: TextElement[] = [];
    const isMobileUi = virtualGamepad != null;
    // @todo João, eventualmente posso precisar saber quando a fonte carregou
    const fontName = '"Courier Prime", monospace';

    const context = new GameContext();
    const eventLoop = new EventLoop(context);

    
    /**
     * @todo João, criar uma interface para o 'keyBoard' para poder unificar o keyboard virtual
     * e o teclado físico, porém considerar habilitar os dois simultaneamente.
     */
    const keyBoardInput: KeyBoardInputInterface = virtualGamepad != null ? virtualGamepad : new KeyBoardInput({ autoStart: true });
    let debug = false;
    let debugHitRadius = false;
    let debugSound = false;


    const setInitialState = () => {
        /**
         * @note seria interessante formalizar o estado interno da 'partida',
         * porém por hora ainda tem alguns pontos em aberto sobre a evolução da
         * estrutura de 'ondas/fases'.
         */
    
        if (!context.isGameOver) return;

        context.isGameOver = false;
        context.asteroidsDestroyedCounter = 0;
        context.waveIndex = 0;
        context.entities.length = 0;

        // limpando textos
        textToDrawn.length = 0;

        context.entityPlayer = makeDefaultPlayer();
        context.entities.push(context.entityPlayer);

        // atualiza title
        updateWebPageTitle();
    };

    keyBoardInput.addListener('keyup.Digit1', () => {
        debug = !debug;
    });
    keyBoardInput.addListener('keyup.Digit2', () => {
        debugHitRadius = !debugHitRadius;
    });

    keyBoardInput.addListener('keyup.Digit3', () => {
        debugSound = !debugSound;
    });

    keyBoardInput.addListener('keyup.Space', () => {
        if (!context.entityPlayer.components[hittedMark]) {
            context.shootWaitingToBeEmmited = true;
        }
    });

    /**
     * @todo João, terminar de normalizar os nomes das teclas
     */
    if (virtualGamepad) {
        virtualGamepad.addListener('keyup.Space', () => {
            if (!context.entityPlayer.components[hittedMark]) {
                context.shootWaitingToBeEmmited = true;
            }
        });

        virtualGamepad.addListener('keyup.vStart', setInitialState);
    }

    const pauseGame = () => {
        if (context.isGameOver) return;

        eventLoop.stop();
        // pausa todos os sons se houver algum executando
        for (const soundHandler of soundMixer.getPlayingSoundsIter()) {
            soundHandler.stop();
        }
        
        context.isPaused = true;
        drawText(ctx, 'pausado', { x: 0, y: 0 }, 0.06, '#FFFFFF', fontName, 'center');

        updateWebPageTitle('pausado');
    };

    /**
     * @note Implementar a funcionalidade de pausa fez com que diversas questões
     * surgissem, como por exemplo, até então estava usando o timestamp provido pelo eventLoop
     * para gerenciar a duração de algumas entidades e textos usados no jogo, porém agora considerando
     * a forma como a funcionalidade de pausa foi implementada, essas entidade somem imediatamente após
     * despausar, isso porque o EventLoop busca o tempo a partir do timestamp do frame sendo desenhado,
     * acredito que o melhor seria criar mais um 'timestamp' para representar o tempo decorrido na simualação.
     */
    const switchPausedState = () => {
        if (context.isGameOver) return;

        if (context.isPaused) {
            eventLoop.start();
            // executa sons pausados se houver algum
            for (const soundHandler of soundMixer.getPlayingSoundsIter()) {
                soundHandler.play();
            }

            updateWebPageTitle();
            context.isPaused = false;
        } else {
            pauseGame();
        }
    }

    keyBoardInput.addListener('keyup.KeyP', switchPausedState);
    
    keyBoardInput.addListener('keyup.KeyR', setInitialState);

    keyBoardInput.addListener('keyup.KeyK', () => {
        const highestScore = parseInt(localStorage.getItem('highestScore') || '0', 10);
        const text = new TextElement('Maior pontuação até o momento: ' + highestScore, { x: 0, y: 0.65, }, 'white', 0.03, fontName, 'center');
        text.setVisibleUntil(2000);
        
        textToDrawn.push(text);
    });

    // @todo João, avaliar se não causa mais problemas do que vantagens tanto em desenvolvimento
    // como para o usuário final...
    window.addEventListener('blur', pauseGame);

    /**
     * @todo João, validar melhor essa funcionalidade, não tenho certeza de que escutar o evento
     * 'resize' é suficiente para saber se a nova resolução da 'window'
     */
    window.addEventListener('resize', () => {
        // @todo João, se a aplicação estiver pausada o canvas é limpo e fica "transparente",
        // por este motivo, caso o jogo esteja pausado, quando ocorre o evento de 'resize'
        // repinto o fundo e escrevo 'pausado' novamente.
        const newResolution = isFullScreen() ? computeResolution(1) : computeResolution(resolutionScaleNonFullscreen);
        
        canvas.width = newResolution;
        canvas.height = newResolution;

        if (context.isPaused) {
            // pintando o fundo
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
    
            drawText(ctx, 'pausado', { x: 0, y: 0 }, 0.06, '#FFFFFF', fontName, 'center');
        }
    });

    /**
     * Função responsável pelo processamento de input
     * Primeira etapa do processo, entrada de input e aplicação das lógicas
     * definidas.
     */
    eventLoop.add((context: GameContext, timestamp: number, deltaTime: number) => {
        const angularVelocitySpaceShipTurn = 3.5;
        if (keyBoardInput.isKeyPressed('KeyD')) {
            context.entityPlayer.angle += -angularVelocitySpaceShipTurn * deltaTime;
        }
        if (keyBoardInput.isKeyPressed('KeyA')) {
            context.entityPlayer.angle += angularVelocitySpaceShipTurn * deltaTime;
        }
        
        if (keyBoardInput.areBothKeysPressed('KeyW', 'KeyS')) {
            context.entityPlayer.acceleration.x = 0;
            context.entityPlayer.acceleration.y = 0;
            context.isPlayerMoving = false;
        } else  if (keyBoardInput.isKeyPressed('KeyW')) {
            context.entityPlayer.acceleration = rotatePoint(context.playerAcceleration, context.entityPlayer.angle);
            context.isPlayerMoving = true;
            context.isPlayerMovingForward = true;
        } else if (keyBoardInput.isKeyPressed('KeyS')) {
            context.entityPlayer.acceleration = rotatePoint(context.playerAcceleration, context.entityPlayer.angle);
            context.entityPlayer.acceleration.x *= -1;
            context.entityPlayer.acceleration.y *= -1;
            context.isPlayerMoving = true;
            context.isPlayerMovingForward = false;
        } else {
            context.entityPlayer.acceleration.x = 0;
            context.entityPlayer.acceleration.y = 0;
            context.isPlayerMoving = false;
        }

        /**
         * @todo João, talvez seria uma boa ideia unificar a lógica de emissão de disparos
         * e usar apenas a propriedade 'lastShootEmmited' para controlar quando atirar. Seria possível
         * remover o listener do evento 'keydown'
         */
        if (context.shootWaitingToBeEmmited && !context.entityPlayer.components[hittedMark]) {
            emmitShoot(context, soundMixer);
            context.lastShootEmmited = timestamp;
            context.shootWaitingToBeEmmited = false;
        }

        /**
         * @todo João, ajustar para funcionar no mobile também, é necessário ajustar 
         * o identificar da 'key'
         */
        if (!context.entityPlayer.components[hittedMark] && keyBoardInput.isKeyPressed('Space')) {
            // @note João, o timestamp é afetado pela 'pausa' então seria legal ajustar para decrementar 
            // conforme o jogo executa e aí disparar ao final
            const elapsedTime = timestamp - context.lastShootEmmited;
            if (elapsedTime > shootEmmitionWindow) {
                context.lastShootEmmited = timestamp;
                emmitShoot(context, soundMixer);
            } 
        }

        /**
         * @todo João, achar um lugar melhora para esse funcionalidade a seguir
         */
        if (countEntitiesByType(context.entities, 'asteroids') === 0) {
            context.entities.push(...createAsteroidsWave());
            context.waveIndex++;
            
            const text = new TextElement('Onda ' + context.waveIndex, { x: 0, y: 0.5, }, 'white', 0.06, fontName, 'center');
            text.setVisibleUntil(2000);
            textToDrawn.push(text);
        }
    });

    /**
     * Função responsável pela detecção de colisões
     * Aqui é feito a detecção da colisão e registrado para o posterior processamento
     */
    eventLoop.add((context: GameContext, time: number, deltaTime: number) => {
        /**
         * @note Remove as entidades com "liveTimeInMilliseconds" zerado,
         * embora não seja essa a única utilidade desse componente, por hora só é usado para isso
         */
        context.entities = context.entities.filter(entity => {
            if (entity.components[liveTimeInMilliseconds] == undefined) return true;

            // @note Não deveria fazer isso no filter, mas... por hora fica assim
            entity.components[liveTimeInMilliseconds] -= 1000 * deltaTime;

            return entity.components[liveTimeInMilliseconds] > 0;
        });

        const shootEntities = context.entities.filter(entity => entity.type === 'shoot');

        for (const entity of context.entities) {
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
            if (distance(entity.position, context.entityPlayer.position) < (entity.hitRadius + context.entityPlayer.hitRadius)) {
                context.entityPlayer.components[hittedMark] = true;
            }
        }
    });

    /**
     * Função responsável por fragmentar os asteróides onde `hittedMark === true`
     */
    eventLoop.add((context: GameContext, time: number) => {
        const hittedAsteroids = context.entities.filter(entity => entity.components[hittedMark] && entity.type === 'asteroids');
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
            context.asteroidsDestroyedCounter++;

            /**
             * @note sempre que um asteroide é destruído um som é emitido, por hora
             * gero dentro do loop, em raros casos há mais de um asteroide eliminado
             * por ciclo, porém, cada asteroide emite um som num volume diferente
             */
            const volumeScale = (numberOfFragmentation || 1);
            soundMixer.play('asteroid-explosion', false, 0.01 * volumeScale);
        }

        context.entities = context.entities.filter(entity => !entity.components[hittedMark] || entity.type === 'player');
        context.entities.push(...allFragments);
    });

    /**
     * Função responsável por fragmentar o player caso ele esteja marcado com `hittedMark === true`
     */
    eventLoop.add((context: GameContext, time: number) => {
        if (!context.entityPlayer.components[hittedMark] || context.entityPlayer.toBeRemoved) return;

        context.entityPlayer.toBeRemoved = true;
        context.entities = context.entities.filter(entity => entity !== context.entityPlayer);
        
        // Por hora é aí que está a figura da nave sem as chamas do propulsor
        const shape = context.shipStandingFigure.shapes[0];
        const drawInfo = context.shipStandingFigure.drawInfo[0];
        const polygon = makePolygonWithAbsolutePosition(drawInfo.position, rotatePolygon(scalePolygon(shape.polygon, drawInfo.scale), drawInfo.angle));

        for (let i = 0; polygon.length > 1 && i < polygon.length; i++) {
            let p0 = polygon[i];
            const nextIndex = i + 1 === polygon.length ? 0 : i + 1;
            let p1 = polygon[nextIndex];

            let aP0 = makePointAbsolute(context.entityPlayer.position, scalePoint(p0, context.entityPlayer.scale));
            let aP1 = makePointAbsolute(context.entityPlayer.position, scalePoint(p1, context.entityPlayer.scale));
            const position = {
                ...context.entityPlayer.position
            };

            position.x = (aP0.x - aP1.x) / 2 + aP1.x;
            position.y = (aP0.y - aP1.y) / 2 + aP1.y;

            const newCenter = {
                x: (p0.x - p1.x) / 2 + p1.x,
                y: (p0.y - p1.y) / 2 + p1.y,
            }

            p0 = centralizePoint(rotatePoint(p0, context.entityPlayer.angle), newCenter);
            p1 = centralizePoint(rotatePoint(p1, context.entityPlayer.angle), newCenter);

            const velocity = rotatePoint({ ...context.entityPlayer.velocity  }, (i * Math.PI / 8));
            const entity = new Entity(position, velocity, { x: 0, y: 0 }, context.entityPlayer.angle, 'fragments', 0.09, 0.08, -1.6 - 0.8 * i / polygon.length);
            entity.components[lineFigure] = [p0, p1];

            context.entities.push(entity);
        }

        // som emitido quando nave explode
        soundMixer.play('ship-explosion', false, 0.3);

        // game over screen
        context.isGameOver = true;

        const textGameOver = new TextElement('Fim de jogo', { x: 0, y: 0, }, 'white', 0.06, fontName, 'center');
        const restartKey = isMobileUi ? "start" : "r";
        const textReplayExplanation = new TextElement(`Aperte "${restartKey}" para jogar novamente`, { x: 0, y: -0.15, }, 'white', 0.03, fontName, 'center');
        
        textToDrawn.push(textGameOver);
        textToDrawn.push(textReplayExplanation);

        // atualiza title
        updateWebPageTitle('fim de jogo');

        // salvando maior pontuação
        // @note esse código deve ser movido para uma rotina própria
        const highestScore = parseInt(localStorage.getItem('highestScore') || '0', 10);
        if (context.asteroidsDestroyedCounter > highestScore || isNaN(highestScore)) {
            localStorage.setItem('highestScore', context.asteroidsDestroyedCounter.toString());
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
    eventLoop.add((context: GameContext, timestamp: number, deltaTime: number) => {
        for (const entity of context.entities) {
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
    eventLoop.add((context: GameContext, time: number, deltaTime: number) => {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Deixando a largura da linha escalável
        const lineWidth = Math.max(1, canvas.width * 0.002); 
        const playerFigure = context.isPlayerMoving
            ? (context.isPlayerMovingForward ? context.shipForwardFigure : context.shipBackwardsFigure)
            : context.shipStandingFigure;

        for (const entity of context.entities) {
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
        drawText(ctx, `${context.asteroidsDestroyedCounter}`, { x: -0.97, y: 0.91 }, 0.06, '#FFFFFF', fontName, 'left');

        /**
         * @todo João, implementar um contador de 'ondas' e um mecanismo para adicionar textos flutuantes
         * que somem sozinho, possivelmente com 'fade-in' e 'fade-out'
         */
        for (const text of textToDrawn) {
            // atualiza tempo de vida dos elementos textuais
            if (typeof text.visibleUntil === 'number') {
                text.visibleUntil -= 1000 * deltaTime;

                if (text.visibleUntil <= 0) continue;
            }

            drawText(ctx, text.text, text.position, text.fontSize, text.color, text.fontFamily, text.align);
        }

        // limpando
        textToDrawn = textToDrawn.filter(text => text.visibleUntil === undefined || text.visibleUntil > 0);
        
        // acionando cleanup do soundMixer
        soundMixer.clear();
    });

    /**
     * Renderiza informação visual da área de hit
     * Quando apertado 2 no teclado esse recurso é ativado ou desativado
     */
    eventLoop.add((context: GameContext, time: number) => {
        if (!debugHitRadius) return;

        // Deixando a largura da linha escalável
        const lineWidth = Math.max(1, canvas.width * 0.002);
        
        for (const entity of context.entities) {
            if (entity.hitRadius) {
                const color = entity.components[hittedMark] ? '#00FF00' : '#FF0000';
                // @todo João, ajustar manipulação 'global' do estilo da linha
                ctx.setLineDash([lineWidth * 2, lineWidth * 2]);
                
                // @todo João, avaliar aqui se faz sentido fazer dessa forma
                renderFigureInside(entity, [], ctx, (ctx: CanvasRenderingContext2D, polygon: readonly Vector2[], position: Vector2, entity: Entity) => {
                    drawCircle(ctx, position, entity.hitRadius, color,lineWidth);
                });

                // @todo João, ajustar manipulação 'global' do estilo da linha
                ctx.setLineDash([]);
            }
        }
    });

    // Renderiza informação visual de debug
    eventLoop.add((context: GameContext, time: number) => {
        if (!debug) return;

        // Deixando a largura da linha escalável
        const lineWidth = Math.max(1, canvas.width * 0.002);
        
        for (const entity of context.entities) {
            if (entity.type != 'player' && entity.type != 'asteroids') continue;

            const endPositionForAcceleration = {
                x: entity.position.x + entity.acceleration.x,
                y: entity.position.y + entity.acceleration.y,
            };
            const endPositionForVelocity = {
                x: entity.position.x + entity.velocity.x,
                y: entity.position.y + entity.velocity.y,
            };
            // @todo João, ajustar manipulação 'global' do estilo da linha
            ctx.setLineDash([lineWidth * 2, lineWidth * 4]);

            drawLine(ctx, entity.position, endPositionForVelocity, '#00FF00', lineWidth);
            drawLine(ctx, entity.position, endPositionForAcceleration, undefined, lineWidth);

            // @todo João, ajustar manipulação 'global' do estilo da linha
            ctx.setLineDash([]);
        }
    });

    eventLoop.add((context: GameContext, time: number) => {
        if (!debugSound) return;

        // Deixando a largura da linha escalável
        const color = '#00FF00';
        const fontSize = 0.02;
        const lineHeight = 1.6;
        const textYOffset = 0.82;
        
        {
            const title = `Total: ${soundMixer.getTotalSounds()}`;
            const text = new TextElement(title, { x: -0.95, y: textYOffset + (fontSize * lineHeight * 1), }, color, fontSize, fontName, 'start');
            drawText(ctx, text.text, text.position, text.fontSize, text.color, text.fontFamily, text.align);
        }

        let i = 0;
        for (const soundHandle of soundMixer.getPlayingSoundsIter()) {
            const text = new TextElement(soundHandle.getDescription(), { x: -0.95, y: textYOffset - (fontSize * lineHeight * i), }, color, fontSize, fontName, 'start');
            drawText(ctx, text.text, text.position, text.fontSize, text.color, text.fontFamily, text.align);
            i++;
        }
    });

    /**
     * @note deixarei um sistema para fazer asserts
     */
    eventLoop.add((context: GameContext, time: number) => {
        // no máximo uma entidade player na arena
        console.assert(context.entities.filter(e => e.type === 'player').length <= 1);
        // exclusivos
        console.assert(!context.isGameOver || !context.isPaused);
    });
    
    return eventLoop;
}
