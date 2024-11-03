import { SoundResourceManager } from './sound-resource-manager.js';
import { between } from './utils.js';
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
    constructor(audioElement, currentMixer, loop = false, volume = 1, state = SoundHandleState.NOT_STARTED, cleanUpWhenIsDoneOrError = false) {
        this.volume = 1;
        this.state = SoundHandleState.NOT_STARTED;
        this.loop = false;
        this.cleanUpWhenIsDoneOrError = false;
        this.audioElement = audioElement;
        this.currentMixer = currentMixer;
        this.cleanUpWhenIsDoneOrError = cleanUpWhenIsDoneOrError;
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
    get canCleanUp() {
        return this.cleanUpWhenIsDoneOrError;
    }
    /**
     * @note João, reavaliar mas acho que agora pode ser usado de forma segura
     * @todo João, testar usar sons gerenciados manualmente
     * @note Melhorado esse processo de descarte dos handlers para incluir o processo de descarte de `HTMLAudioElements`
     * como sugerido nesse link: https://stackoverflow.com/questions/8864617/how-do-i-remove-properly-html5-audio-without-appending-to-dom
     */
    releaseResources() {
        const audioElement = this.audioElement;
        audioElement.srcObject = null;
        this.state = SoundHandleState.RELEASED;
    }
    /**
     * @todo João, terminar de implementar uma forma de busca o nome e o resourceLocation
     * @returns
     */
    getDescription() {
        return (this.audioElement.getAttribute('src') || '[Sem nome]') + ` - ${(this.currentTime / this.duration * 100).toFixed(2)}%`;
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
     * Função que inicia a execução de um som
     * @param name nome do sons a ser tocado
     * @param loop som deve ser tocado em loop
     * @param volume volume do áudio a ser tocado (padrão 1)
     * @param autoremove marca se o som deve ser removido automaticamente quando acabar ou der erro (padrão true)
     */
    play(name, loop = false, volume = 1, autoremove = true) {
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
                const soundHandle = new SoundHandle(audioElement, this, loop, 1, SoundHandleState.NOT_STARTED, autoremove);
                soundHandle.setVolume(volume);
                soundHandle.play();
                this.playingSounds.add(soundHandle);
                return soundHandle;
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
        return null;
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
    getTotalSounds() {
        return this.playingSounds.size;
    }
    /**
     * Método chamado para fazer o release dos sons finalizados
     */
    clear() {
        const allSounds = new Set();
        for (const it of this.playingSounds) {
            if (it.status === SoundHandleState.RELEASED)
                continue;
            if (it.canCleanUp && (it.status === SoundHandleState.ENDED || it.status === SoundHandleState.BLOCKED)) {
                it.releaseResources();
            }
            else {
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
    countSoundsInState(state) {
        let i = 0;
        for (const sound of this.playingSounds.values()) {
            if (sound.status == state)
                i++;
        }
        return i;
    }
}
