
export interface KeyBoardInputInterface {
    stopListening(): void;
    isKeyPressed(key: string): boolean;
    areBothKeysPressed(key1: string,  key2: string): boolean;
    removeListener(name: string, handler: (event: Event) => void): void;
    addListener(eventTypeName: string, handler: (event: Event) => void): void;
}
