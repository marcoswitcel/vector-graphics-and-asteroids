var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class SoundResourceEntry {
    constructor(resourceLocation, autoStart = false) {
        this.readyToPlay = false;
        this.errorLoading = false;
        this.data = null;
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
    startLoading() {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield isPlayable(this.data);
                this.readyToPlay = true;
                this.errorLoading = false;
                return { name: this.resourceLocation, success: true };
            }
            catch (error) {
                this.readyToPlay = false;
                this.errorLoading = true;
                return { name: this.resourceLocation, success: false };
            }
        });
    }
}
export class SoundResourceManager {
    constructor() {
        this.autoStartDownload = false;
        this.entries = new Map;
    }
    add(resourceName, resourceLocation) {
        if (!this.entries.has(resourceName)) {
            const soundResourceEntry = new SoundResourceEntry(resourceLocation, this.autoStartDownload);
            this.entries.set(resourceName, soundResourceEntry);
        }
    }
    loadAll() {
        this.entries.forEach((entry) => {
            entry.startLoading();
        });
    }
}
/**
 * Função que criar uma promise para trabalhar com o áudio carregado com
 * `HTMLAudioElement`
 * @param audio elemento contendo o áudio fonte
 * @param fullyLoaded
 * @returns
 */
function isPlayable(audio, fullyLoaded = true) {
    const doneEvent = fullyLoaded ? 'canplaythrough' : 'canplay';
    return new Promise((resolve, reject) => {
        audio.addEventListener(doneEvent, () => resolve(audio));
        audio.addEventListener('error', () => reject(audio));
    });
}
