/**
 * estudar e implentar um sistema de som que funcione junto com a simulação,
 * entender o que é necessário e integrá-lo ao sistema de entidades, implementar
 * algum tipo de catálogo de áudios.
 * @todo Atingir os objetivos acima
 * @todo Uma vez pronta a implementação, aplicar também na simulação principal
 */

/**
 * Específicos
 * @todo encontrar áudios para os tiros e explosões
 * @todo implementar um sistema capaz de rodar múltiplos sons simultâneamentes e multiplas vezes e simulaneamente o mesmo som, que atinja
 * o objetivo de ser de fácil implementação no sistema de entidades rodando na simulação
 * principal.
 * @todo implementar um controle de volume que funcione por instância de som e talvez um volume global (isso é um mixer que faz?)
 * @todo caso necessário lidar com assets de som, analisar implementar um gestor de recursos.
 * 
 * Coisas que descartei inicialmente: son espacial (2d), 
 */

console.log('pronto para começar!!!');

/**
 * Função que criar uma promise para trabalhar com o áudio carregado com `HTMLAudioElement`
 * @param audio elemento contendo o áudio fonte
 * @param fullyLoaded 
 * @returns 
 */
function isPlayable(audio : HTMLAudioElement, fullyLoaded = true) : Promise<HTMLAudioElement> {
    const doneEvent = fullyLoaded ? 'canplaythrough' : 'canplay';
    return new Promise((resolve, reject) => {
        audio.addEventListener(doneEvent, () => resolve(audio));
        audio.addEventListener('error', () => reject(audio));
    });
}

class SoundResourceEntry {
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
     * tenha sido iniciado ainda. Essa função também oferece visibilidade do status do carregamento.
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

class SoundResourceManager {
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

class SoundMixer {

    private globalVolume: number = 1;
    private soundResourceManager: SoundResourceManager;
    /**
     * @todo João, inicialmente essa propriedade é um set, porém, acredito que precise de um tipo dedicado
     * para armazenar coisas como volume individual dos sons sendo tocados e estados
     */
    private playingSounds: Set<HTMLAudioElement> = new Set;
    
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
     */
    public play(name: string, loop: boolean = false) {
        if (this.soundResourceManager.entries.has(name)) {
            const soundResEntry = this.soundResourceManager.entries.get(name) as SoundResourceEntry;
            if (soundResEntry.readyToPlay) {
                const audioElement = soundResEntry.data?.cloneNode(true) as HTMLAudioElement;
                audioElement.loop = loop;
                audioElement.volume = this.globalVolume;
                audioElement.play();

                this.playingSounds.add(audioElement);
            } else {
                console.warn(`O som registrado para o nome: ${name} não está pronto para ser tocado, essa requisição será ignorada`);    
            }
        } else {
            console.warn(`Não há som registrado para o nome: ${name}`);
        }
    }

    /**
     * Método que seta o volume global e aplica em todos os áudios tocando
     * @param volume valor entre 0 e 1
     */
    public setVolume(volume: number) {
        this.globalVolume = between(volume, 0, 1);

        this.playingSounds.forEach((audioElement) => {
            audioElement.volume = this.globalVolume;
        });
    }
}

function between(value: number, min: number, max: number) {
    return Math.max(Math.min(value, max), min)
}

const soundResourceManager = new SoundResourceManager;

soundResourceManager.add('cartoon', './resource/audio/Cartoon Metal Thunk.mp3');
soundResourceManager.add('wooden', './resource/audio/Wooden Train Whistle.mp3');

soundResourceManager.loadAll();

const soundMixer = new SoundMixer(soundResourceManager);

/**
 * @todo João, acredito que por um botão iniciar e um controlador de volume em formato de
 * input seria legal.
 */
window.addEventListener('load', () => {
    window.addEventListener('mousedown', () => {
        console.log('playing')
        soundMixer.play('cartoon');
        setTimeout(() => soundMixer.play('wooden'), 500);
        // const newAudio = audio.cloneNode(true) as HTMLAudioElement;
        // setTimeout(() => newAudio.play(), 500);
        // const newAudioManual = new Audio('./resource/audio/Cartoon Metal Thunk.mp3');
        // setTimeout(() => newAudioManual.play(), 500);
    })
})
