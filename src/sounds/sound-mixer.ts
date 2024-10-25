import { SoundResourceEntry, SoundResourceManager } from './sound-resource-manager.js';
import { between } from './utils.js';

export enum SoundHandleState {
    NOT_STARTED,
    PLAYING,
    STOPED,
    ENDED,
    RELEASED,
    BLOCKED,
}

export class SoundHandle {

    private audioElement: HTMLAudioElement;
    private volume: number = 1;
    private state: SoundHandleState = SoundHandleState.NOT_STARTED;
    private currentMixer: SoundMixer;
    private loop: boolean = false;
    private cleanUpWhenIsDoneOrError: boolean = false;

    constructor(audioElement: HTMLAudioElement, currentMixer: SoundMixer, loop: boolean = false, volume: number = 1, state: SoundHandleState = SoundHandleState.NOT_STARTED, cleanUpWhenIsDoneOrError: boolean = false) {
        this.audioElement = audioElement;
        this.currentMixer = currentMixer;
        this.cleanUpWhenIsDoneOrError = cleanUpWhenIsDoneOrError;
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
        this.audioElement.play()
            .catch(() => this.state = SoundHandleState.BLOCKED);
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
            case SoundHandleState.BLOCKED: return SoundHandleState.BLOCKED;
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
    
    public get canCleanUp(): boolean {
        return this.cleanUpWhenIsDoneOrError;
    }

    /**
     * @todo João, esse é o único método que precisa ser trabalhado para poder
     * retornar o SoundHandle nas requisições ao método SoundMixer.play()
     * @note João, reavaliar mas acho que agora pode ser usado de forma segura
     * @todo João, testar usar sons gerenciados manualmente
     * @note Melhorado esse processo de descarte dos handlers para incluir o processo de descarte de `HTMLAudioElements`
     * como sugerido nesse link: https://stackoverflow.com/questions/8864617/how-do-i-remove-properly-html5-audio-without-appending-to-dom 
     */
    public releaseResources() {
        const audioElement = this.audioElement;
        audioElement.srcObject = null;
        this.state = SoundHandleState.RELEASED;
    }

    /**
     * @todo João, terminar de implementar uma forma de busca o nome e o resourceLocation
     * @returns 
     */
    public getDescription(): string {
        return (this.audioElement.getAttribute('src') || '[Sem nome]') + ` - ${(this.currentTime / this.duration * 100).toFixed(2)}%`;
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
     * Função que inicia a execução de um som
     * @param name nome do sons a ser tocado
     * @param loop som deve ser tocado em loop
     * @param volume volume do áudio a ser tocado (padrão 1)
     * @param autoremove marca se o som deve ser removido automaticamente quando acabar ou der erro (padrão true)
     */
    public play(name: string, loop: boolean = false, volume: number = 1, autoremove = true): SoundHandle | null {
        if (this.soundResourceManager.entries.has(name)) {
            const soundResEntry = this.soundResourceManager.entries.get(name) as SoundResourceEntry;
            if (soundResEntry.readyToPlay) {
                /**
                 * @note Talvez clonar seja uma operação muito pesada devo trocar
                 * para um pool de `HTMLAudioElement`, mas não farei isso ainda.
                 */
                const audioElement = soundResEntry.data?.cloneNode(true) as HTMLAudioElement;
                /**
                 * @todo João, avaliar se não seria mais flexível adicionar um listener para executar
                 * quando o som finalizasse e não estivesse em loop, aí ele poderia se remover sozinho.
                 */
                const soundHandle = new SoundHandle(audioElement, this, loop, 1, SoundHandleState.NOT_STARTED, autoremove);
                soundHandle.setVolume(volume);
                soundHandle.play();

                this.playingSounds.add(soundHandle);
                
                return soundHandle;
            } else if (soundResEntry.errorLoading) {
                console.warn(`[[ SoundMixer.play ]] O som registrado para o nome: '${name}' não carregou corretamente, essa requisição será ignorada`);
            } else {
                console.warn(`[[ SoundMixer.play ]] O som registrado para o nome: '${name}' não está pronto para ser tocado, essa requisição será ignorada`);    
            }
        } else {
            console.warn(`[[ SoundMixer.play ]] Não há som registrado para o nome: '${name}'`);
        }

        return null;
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

    public getTotalSounds(): number {
        return this.playingSounds.size;
    }

    /**
     * @todo João, ainda sinto que esse processo não está claro ou seguro, não sei bem qual o problema, reanalisar
     */
    public clear(): void {
        const allSounds: Set<SoundHandle> = new Set();
        for (const it of this.playingSounds) {
            if (it.status === SoundHandleState.RELEASED) continue;
            
            if (it.canCleanUp && (it.status === SoundHandleState.ENDED || it.status === SoundHandleState.BLOCKED)) {
                it.releaseResources();
            } else {
                allSounds.add(it);
            }
        }
        this.playingSounds = allSounds;
    }

    /**
     * @note Talvez daria pra otimizar essa função, porém fazer o controle manual do 'status'
     * do som é mais trabalho e propenso a erros. Então sem a necessidade de otimizar é melhor não fazer.
     * @param state 
     * @returns 
     */
    public countSoundsInState(state: SoundHandleState) {
        let i = 0;
        
        for (const sound of this.playingSounds.values()) {
            if (sound.status == state) i++;
        }

        return i;
    }
}

