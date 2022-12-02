export class EventLoop {
    constructor() {
        this.running = false;
        this.handlerId = 0;
        this.handlers = new Set();
        this.handleTick = (time) => {
            console.assert(typeof time === 'number');
            try {
                for (const handler of this.handlers) {
                    handler(time);
                }
                if (this.running) {
                    requestAnimationFrame(this.handleTick);
                }
            }
            catch (error) {
                console.error(error);
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
        }
    }
    add(handler) {
        this.handlers.add(handler);
    }
}
