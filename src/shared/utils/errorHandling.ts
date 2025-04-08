export class ButtonError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ButtonError';
    }
}