
type EventHandler<Context> = (context: Context, timestamp: number, deltaTime: number) => void;

/**
 * @note João, analisar se interessante adicionar um profiler de memória
 * e tempo ao `EventLoop` para ativamente coletar e talvez exibir um um frame
 * a parte as métricas. Considerar usar perfomance.now(), pois como é um recurso de desenvolvimento,
 * posso deixar como opcional e na minha máquina vou pode ver funcionando pois sei que meu ambiente suporta.
 */
export class EventLoop<Context> {
    private context: Context;
    private running: boolean = false;
    private handlerId: number = 0;
    private handlers: Set<EventHandler<Context>> = new Set();
    private lastTimestamp: number = 0;

    constructor(context: Context) {
        this.context = context;
    }

    public start() {
        if (this.running) return;

        this.running = true;

        this.handlerId = requestAnimationFrame(this.handleTick);
    }

    public stop() {
        if (this.running) {
            this.running = false;
            cancelAnimationFrame(this.handlerId);
            this.handlerId = 0;
            /**
             * @note João, não é claro se deveria mesmo limpar o lastTimestamp, porém
             * pra forma de uso atual está sendo util.
             */
            this.lastTimestamp = 0;
        }
    }

    /**
     * @note Talvez no futuro seja interessante adicionar um parâmetro opcional
     * para armazenar um nome descritivo do handler, para poder retornar em 
     * caso de erros.
     * 
     * @param handler função com a lógica que precisa ser rodada
     */
    public add(handler: EventHandler<Context>) {
        this.handlers.add(handler);
    }

    private handleTick = (timestamp: number) => {
        console.assert(typeof timestamp === 'number', 'Deveria ser um número (garantindo que não é undefined)');

        if (!this.running) return;

        if (this.lastTimestamp === 0) {
            this.lastTimestamp = timestamp;
            requestAnimationFrame(this.handleTick);
            return;
        }

        try {
            const deltaTime = this.lastTimestamp ? (timestamp - this.lastTimestamp) / 1000 : 0;
            this.lastTimestamp = timestamp;

            for (const handler of this.handlers) {
                handler(this.context, timestamp, deltaTime);
            }
            
            if (this.running) {
                requestAnimationFrame(this.handleTick);
            }
        } catch (error) {
            console.error(error);
            this.running = false;
        }
    }
}
