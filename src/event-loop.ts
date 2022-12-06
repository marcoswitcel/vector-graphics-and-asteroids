
type EventHandler = (timestamp: number, deltaTime: number) => void;

export class EventLoop {

    private running: boolean = false;
    private handlerId: number = 0;
    private handlers: Set<EventHandler> = new Set();
    private lastTimestamp: number = 0;

    public start() {
        if (this.running) return;

        this.running = true;

        this.handlerId = requestAnimationFrame(this.handleTick);
    }

    public stop() {
        if (this.running) {
            this.running = false;
            cancelAnimationFrame(this.handlerId);
        }
    }

    public add(handler: EventHandler) {
        this.handlers.add(handler);
    }

    private handleTick = (timestamp: number) => {
        console.assert(typeof timestamp === 'number', 'Deveria ser um número (garantindo que não é undefined)');
        
        if (this.lastTimestamp === 0) {
            this.lastTimestamp = timestamp;
            requestAnimationFrame(this.handleTick);
            return;
        }

        const deltaTime = this.lastTimestamp ? (timestamp - this.lastTimestamp) / 1000 : 0;
        this.lastTimestamp = timestamp;

        try {
            for (const handler of this.handlers) {
                handler(timestamp, deltaTime);
            }
            
            if (this.running) {
                requestAnimationFrame(this.handleTick);
            }
        } catch (error) {
            console.error(error);
        }
    }
}
