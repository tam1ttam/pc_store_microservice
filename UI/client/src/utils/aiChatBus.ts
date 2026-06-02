class EventEmitter {
    private events: { [key: string]: Function[] } = {};

    on(event: string, listener: Function) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(listener);
    }

    off(event: string, listener: Function) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listener);
    }

    emit(event: string, ...args: any[]) {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(...args));
    }
}

export const aiChatBus = new EventEmitter();

export const AI_EVENTS = {
    OPEN_AND_SEND: 'OPEN_AND_SEND',
    OPEN_AND_SEND_PRODUCT: 'OPEN_AND_SEND_PRODUCT',
};
