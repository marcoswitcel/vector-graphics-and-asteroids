import { isPlayable } from './utils.js';

export class SoundResourceEntry {
    resourceLocation: string;
    readyToPlay: boolean = false;
    errorLoading: boolean = false;
    data: HTMLAudioElement | null = null;

    constructor(resourceLocation: string, autoStart: boolean = false) {
        this.resourceLocation = resourceLocation;
        if (autoStart) {
            this.startLoading();
        }
    }

    /**
     * Função que inicia monta o `HTMLAudioElement` e inicia o download caso ele não
     * tenha sido iniciado ainda. Essa função também oferece visibilidade do status
     * do carregamento.
     * @returns Um objeto com o nome e o status do carregamento, sucesso ou não
     */
    public async startLoading(): Promise<{ name: string, success: boolean }> {
        if (!this.data) {
            this.data = new Audio(this.resourceLocation);
        }

        if (this.readyToPlay) {
            return { name: this.resourceLocation, success: true };
        }

        if (this.errorLoading) {
            return { name: this.resourceLocation, success: false };
        }

        try {
            await isPlayable(this.data)
            this.readyToPlay = true;
            this.errorLoading = false;
            return { name: this.resourceLocation, success: true };
        } catch (error) {
            this.readyToPlay = false;
            this.errorLoading = true;
            return { name: this.resourceLocation, success: false };
        }
    }
}

export class SoundResourceManager {
    public autoStartDownload: boolean = false;

    public entries: Map<string, SoundResourceEntry> = new Map;

    public add(resourceName: string, resourceLocation: string) {
        if (!this.entries.has(resourceName)) {
            const soundResourceEntry = new SoundResourceEntry(resourceLocation, this.autoStartDownload);
            this.entries.set(resourceName, soundResourceEntry);
        }
    }

    public loadAll() {
        this.entries.forEach((entry) => {
            entry.startLoading();
        });
    }
}
