
export interface KeyBoardInputInterface {

    stopListening(): void;
    isKeyPressed(key: string): boolean;
    areBothKeysPressed(key1: string,  key2: string): boolean;
    addListener(eventTypeName: string, callback: () => void): void;
}
