type EventHandler = (...args: any[]) => void;
type EventMap = Record<string, EventHandler[]>;

const createEventSystem = () => {
    let events: EventMap = {};

      const on = (eventName: string, handler: EventHandler): (() => void) => {
        events[eventName] = events[eventName] || [];

        events[eventName].push(handler);

        return () => off(eventName, handler);
    };

    const off = (eventName: string, handler: EventHandler): void => {
        if (!events[eventName]) return;

        events[eventName] = events[eventName].filter(h => h !== handler);

        if (events[eventName].length === 0) {
            delete events[eventName];
        }
    };

    const emit = (eventName: string, ...args: any[]): void => {
        if (!events[eventName]) return;

        const handlers = [...events[eventName]];

        handlers.forEach(handler => {
            try {
                handler(...args);
            } catch (error) {
                console.error(`Error in event handler for ${eventName}:`, error);
            }
        });
    };

    const once = (eventName: string, handler: EventHandler): (() => void) => {
        const wrappedHandler = (...args: any[]) => {
            off(eventName, wrappedHandler);
            handler(...args);
        };

        return on(eventName, wrappedHandler);
    };

    const clear = (eventName?: string): void => {
        if (eventName) {
            delete events[eventName];
        } else {
            events = {};
        }
    };

    return {
        on,
        off,
        emit,
        once,
        clear
    };
};

export const EventBus = createEventSystem();