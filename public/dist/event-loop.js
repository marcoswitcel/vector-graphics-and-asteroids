/**
 * @todo João, analisar se interessante adicionar um profiler de memória
 * e tempo ao `EventLoop` para ativamente coletar e talvez exibir um um frame
 * a parte as métricas.
 */
export class EventLoop {
    constructor() {
        this.running = false;
        this.handlerId = 0;
        this.handlers = new Set();
        this.lastTimestamp = 0;
        this.handleTick = (timestamp) => {
            console.assert(typeof timestamp === 'number', 'Deveria ser um número (garantindo que não é undefined)');
            if (!this.running)
                return;
            if (this.lastTimestamp === 0) {
                this.lastTimestamp = timestamp;
                requestAnimationFrame(this.handleTick);
                return;
            }
            try {
                const deltaTime = this.lastTimestamp ? (timestamp - this.lastTimestamp) / 1000 : 0;
                this.lastTimestamp = timestamp;
                for (const handler of this.handlers) {
                    handler(timestamp, deltaTime);
                }
                if (this.running) {
                    requestAnimationFrame(this.handleTick);
                }
            }
            catch (error) {
                console.error(error);
                this.running = false;
            }
        };
    }
    start() {
        if (this.running)
            return;
        this.running = true;
        this.handlerId = requestAnimationFrame(this.handleTick);
    }
    stop() {
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
    add(handler) {
        this.handlers.add(handler);
    }
}
