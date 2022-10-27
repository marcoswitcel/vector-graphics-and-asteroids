
export class EventLoop {

    private running: boolean = false;
    private handlerId: number = 0;
    private handlers: Set<(time: number) => void> = new Set();

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

    public add(handler: (time: number) => void) {
        this.handlers.add(handler);
    }

    private handleTick = (time: number) => {
        console.assert(typeof time === 'number');

        try {
            for (const handler of this.handlers) {
                handler(time);
            }
            
            if (this.running) {
                requestAnimationFrame(this.handleTick);
            }
        } catch (error) {
            console.error(error);
        }
    }
}
