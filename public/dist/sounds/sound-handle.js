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
    // @todo João, avaliar se não faz sentido por uma propriedade 'autoremove' para controlar se o som deve
    // ser apagado quando terminar de executar. Acredito que adicionaria uma flexibilidade extra.
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
    /**
     * @todo João, terminar de implementar uma forma de busca o nome e o resourceLocation
     * @returns
     */
    getDescription() {
        return (this.audioElement.getAttribute('src') || '[Sem nome]') + ` - ${(this.currentTime / this.duration * 100).toFixed(2)}%`;
    }
}
