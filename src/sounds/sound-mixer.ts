import { SoundResourceEntry, SoundResourceManager } from "./sound-resource-manager.js";

export enum SoundHandleState {
    NOT_STARTED,
    PLAYING,
    STOPED,
    ENDED,
    RELEASED,
}

export class SoundHandle {

    private audioElement: HTMLAudioElement;
    private volume: number = 1;
    private state: SoundHandleState = SoundHandleState.NOT_STARTED;
    private currentMixer: SoundMixer;
    private loop: boolean = false;

    constructor(audioElement: HTMLAudioElement, currentMixer: SoundMixer, loop: boolean = false, volume: number = 1, state: SoundHandleState = SoundHandleState.NOT_STARTED) {
        this.audioElement = audioElement;
        this.currentMixer = currentMixer;
        this.setVolume(volume);
        this.state = state;
        this.loop = loop;

        this.updateAudioElementAttributes();
        this.setupListeners();
    }

    private updateAudioElementAttributes() {
        this.audioElement.loop = this.loop;
        this.audioElement.controls = false;
        this.audioElement.volume = this.currentMixer.getVolume() * this.volume;
    }

    private setupListeners() {
        if (!this.loop) {
            this.audioElement.addEventListener('ended', () => {
                this.state = SoundHandleState.ENDED;
            });
        }
    }

    public play() {
        this.state = SoundHandleState.PLAYING;
        this.audioElement.play();
    }

    public stop() {
        this.state = SoundHandleState.STOPED;
        this.audioElement.pause();
    }

    public getVolume(): number {
        return this.volume;
    }

    public setVolume(volume: number): void {
        this.volume = between(volume, 0, 1);

        this.audioElement.volume = this.currentMixer.getVolume() * this.volume;
    }

    public globalVolumeChanged() {
        this.audioElement.volume = this.currentMixer.getVolume() * this.volume;
    }

    public get duration(): number {
        return this.audioElement.duration;
    }

    public get currentTime(): number {
        return this.audioElement.currentTime;
    }

    public get status(): SoundHandleState {
        switch (this.state) {
            case SoundHandleState.NOT_STARTED: return SoundHandleState.NOT_STARTED;
            case SoundHandleState.PLAYING: return SoundHandleState.PLAYING;
            case SoundHandleState.ENDED: return SoundHandleState.ENDED;
            case SoundHandleState.STOPED: return SoundHandleState.STOPED;
            case SoundHandleState.RELEASED: return SoundHandleState.RELEASED;
        }
        console.warn('Estado inválido, retornando ENDED');
        return SoundHandleState.ENDED;
    }

    /**
     * Caminho do recurso gerenciado por esse handler
     * @readonly
     */
    public get src(): string {
        return this.audioElement.src;
    }

    public releaseResources() {
        const audioElement = this.audioElement;
        audioElement.srcObject = null;
        this.state = SoundHandleState.RELEASED;
    }
}

export class SoundMixer {

    private globalVolume: number = 1;
    private soundResourceManager: SoundResourceManager;
    private playingSounds: Set<SoundHandle> = new Set;
    
    constructor(soundResourceManager?: SoundResourceManager) {
        if (soundResourceManager) {
            this.soundResourceManager = soundResourceManager;
        } else {
            this.soundResourceManager = new SoundResourceManager;
        }
    }

    /**
     * Função que inicia a execução do som
     * @todo João, talvez deva expandir para receber um pedido mais específico,
     * tipo receber o volume e a posição do áudio e também deveria retornar um identificador para acompanhar
     * os status do som
     * @param name nome do sons a ser tocado
     * @param loop som deve ser tocado em loop
     * @param volume volume do áudio a ser tocado (padrão 1)
     */
    public play(name: string, loop: boolean = false, volume: number = 1) {
        if (this.soundResourceManager.entries.has(name)) {
            const soundResEntry = this.soundResourceManager.entries.get(name) as SoundResourceEntry;
            if (soundResEntry.readyToPlay) {
                /**
                 * @note Talvez clonar seja uma operação muito pesada devo trocar
                 * para um pool de `HTMLAudioElement`, mas não farei isso ainda.
                 */
                const audioElement = soundResEntry.data?.cloneNode(true) as HTMLAudioElement;
                const soundHandle = new SoundHandle(audioElement, this, loop, 1);
                soundHandle.setVolume(volume);
                soundHandle.play();

                this.playingSounds.add(soundHandle);
            } else if (soundResEntry.errorLoading) {
                console.warn(`[[ SoundMixer.play ]] O som registrado para o nome: '${name}' não carregou corretamente, essa requisição será ignorada`);
            } else {
                console.warn(`[[ SoundMixer.play ]] O som registrado para o nome: '${name}' não está pronto para ser tocado, essa requisição será ignorada`);    
            }
        } else {
            console.warn(`[[ SoundMixer.play ]] Não há som registrado para o nome: '${name}'`);
        }
    }

    /**
     * Método que seta o volume global e aplica em todos os áudios tocando
     * @param volume valor entre 0 e 1
     */
    public setVolume(volume: number) {
        this.globalVolume = between(volume, 0, 1);

        this.playingSounds.forEach((soundHandle) => {
            soundHandle.globalVolumeChanged();
        });
    }

    public getVolume() {
        return this.globalVolume;
    }

    public getPlayingSoundsIter(): IterableIterator<SoundHandle> {
        return this.playingSounds[Symbol.iterator]();
    }

    /**
     * @todo João, melhorar esse processo de descarte dos handlers para incluir o processo de descarte de `HTMLAudioElements`
     * como sugerido nesse link: https://stackoverflow.com/questions/8864617/how-do-i-remove-properly-html5-audio-without-appending-to-dom -- OK
     * @todo João, ainda sinto que esse processo não está claro ou seguro, não sem bem qual o problema, reanalsiar
     */
    public clear(): void {
        const playingSounds: Set<SoundHandle> = new Set();
        for (const it of this.playingSounds) {
            if (it.status !== SoundHandleState.ENDED) {
                playingSounds.add(it);
            } else {
                it.releaseResources();
            }
        }
        this.playingSounds = playingSounds;
    }
}

function between(value: number, min: number, max: number) {
    return Math.max(Math.min(value, max), min)
}
