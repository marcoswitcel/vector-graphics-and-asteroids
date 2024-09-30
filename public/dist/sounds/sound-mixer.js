import { SoundResourceManager } from './sound-resource-manager.js';
export var SoundHandleState;
(function (SoundHandleState) {
    SoundHandleState[SoundHandleState["NOT_STARTED"] = 0] = "NOT_STARTED";
    SoundHandleState[SoundHandleState["PLAYING"] = 1] = "PLAYING";
    SoundHandleState[SoundHandleState["STOPED"] = 2] = "STOPED";
    SoundHandleState[SoundHandleState["ENDED"] = 3] = "ENDED";
    SoundHandleState[SoundHandleState["RELEASED"] = 4] = "RELEASED";
    SoundHandleState[SoundHandleState["BLOCKED"] = 5] = "BLOCKED";
})(SoundHandleState || (SoundHandleState = {}));
export class SoundHandle {
    constructor(audioElement, currentMixer, loop = false, volume = 1, state = SoundHandleState.NOT_STARTED) {
        this.volume = 1;
        this.state = SoundHandleState.NOT_STARTED;
        this.loop = false;
        this.audioElement = audioElement;
        this.currentMixer = currentMixer;
        this.setVolume(volume);
        this.state = state;
        this.loop = loop;
        this.updateAudioElementAttributes();
        this.setupListeners();
    }
    updateAudioElementAttributes() {
        this.audioElement.loop = this.loop;
        this.audioElement.controls = false;
        this.audioElement.volume = this.currentMixer.getVolume() * this.volume;
    }
    setupListeners() {
        if (!this.loop) {
            this.audioElement.addEventListener('ended', () => {
                this.state = SoundHandleState.ENDED;
            });
        }
    }
    play() {
        this.state = SoundHandleState.PLAYING;
        this.audioElement.play()
            .catch(() => this.state = SoundHandleState.BLOCKED);
    }
    stop() {
        this.state = SoundHandleState.STOPED;
        this.audioElement.pause();
    }
    getVolume() {
        return this.volume;
    }
    setVolume(volume) {
        this.volume = between(volume, 0, 1);
        this.audioElement.volume = this.currentMixer.getVolume() * this.volume;
    }
    globalVolumeChanged() {
        this.audioElement.volume = this.currentMixer.getVolume() * this.volume;
    }
    get duration() {
        return this.audioElement.duration;
    }
    get currentTime() {
        return this.audioElement.currentTime;
    }
    get status() {
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
    get src() {
        return this.audioElement.src;
    }
    /**
     * @todo João, esse é o único método que precisa ser trabalhado para poder
     * retornar o SoundHandle nas requisições ao método SoundMixer.play()
     * @note Melhorado esse processo de descarte dos handlers para incluir o processo de descarte de `HTMLAudioElements`
     * como sugerido nesse link: https://stackoverflow.com/questions/8864617/how-do-i-remove-properly-html5-audio-without-appending-to-dom
     */
    releaseResources() {
        const audioElement = this.audioElement;
        audioElement.srcObject = null;
        this.state = SoundHandleState.RELEASED;
    }
}
export class SoundMixer {
    constructor(soundResourceManager) {
        this.globalVolume = 1;
        this.playingSounds = new Set;
        if (soundResourceManager) {
            this.soundResourceManager = soundResourceManager;
        }
        else {
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
    play(name, loop = false, volume = 1) {
        var _a;
        if (this.soundResourceManager.entries.has(name)) {
            const soundResEntry = this.soundResourceManager.entries.get(name);
            if (soundResEntry.readyToPlay) {
                /**
                 * @note Talvez clonar seja uma operação muito pesada devo trocar
                 * para um pool de `HTMLAudioElement`, mas não farei isso ainda.
                 */
                const audioElement = (_a = soundResEntry.data) === null || _a === void 0 ? void 0 : _a.cloneNode(true);
                /**
                 * @todo João, avaliar se não seria mais flexível adicionar um listener para executar
                 * quando o som finalizasse e não estivesse em loop, aí ele poderia se remover sozinho.
                 */
                const soundHandle = new SoundHandle(audioElement, this, loop, 1);
                soundHandle.setVolume(volume);
                soundHandle.play();
                this.playingSounds.add(soundHandle);
            }
            else if (soundResEntry.errorLoading) {
                console.warn(`[[ SoundMixer.play ]] O som registrado para o nome: '${name}' não carregou corretamente, essa requisição será ignorada`);
            }
            else {
                console.warn(`[[ SoundMixer.play ]] O som registrado para o nome: '${name}' não está pronto para ser tocado, essa requisição será ignorada`);
            }
        }
        else {
            console.warn(`[[ SoundMixer.play ]] Não há som registrado para o nome: '${name}'`);
        }
    }
    /**
     * Método que seta o volume global e aplica em todos os áudios tocando
     * @param volume valor entre 0 e 1
     */
    setVolume(volume) {
        this.globalVolume = between(volume, 0, 1);
        this.playingSounds.forEach((soundHandle) => {
            soundHandle.globalVolumeChanged();
        });
    }
    getVolume() {
        return this.globalVolume;
    }
    getPlayingSoundsIter() {
        return this.playingSounds[Symbol.iterator]();
    }
    /**
     * @todo João, ainda sinto que esse processo não está claro ou seguro, não sei bem qual o problema, reanalisar
     */
    clear() {
        const playingSounds = new Set();
        for (const it of this.playingSounds) {
            if (it.status !== SoundHandleState.ENDED && it.status !== SoundHandleState.BLOCKED) {
                playingSounds.add(it);
            }
            else {
                it.releaseResources();
            }
        }
        this.playingSounds = playingSounds;
    }
}
function between(value, min, max) {
    return Math.max(Math.min(value, max), min);
}
