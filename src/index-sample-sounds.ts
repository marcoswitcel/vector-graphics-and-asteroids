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
    const doneEvent = fullyLoaded ? 'canplaythough' : 'canplay';
    return new Promise((resolve, reject) => {
        audio.addEventListener(doneEvent, () => resolve(audio));
        audio.addEventListener('error', () => reject(audio));
    });
}

class SoundResourceEntry {
    resourceLocation: string;
    readyToPlay: boolean = false;
    data: HTMLAudioElement | null = null;

    constructor(resourceLocation: string, autoStart: boolean = false) {
        this.resourceLocation = resourceLocation;
        if (autoStart) {
            this.startLoading();
        }
    }

    public async startLoading(): Promise<{ name: string, success: boolean }> {
        this.data = new Audio(this.resourceLocation);
        try {
            await isPlayable(this.data)
            this.readyToPlay = true;
            return { name: this.resourceLocation, success: true };
        } catch (error) {
            this.readyToPlay = false;
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
            entry.startLoading()
        });
    }
}

const soundResourceManager = new SoundResourceManager;

soundResourceManager.add('cartoon', './resource/audio/Cartoon Metal Thunk.mp3');
soundResourceManager.add('wooden', './resource/audio/Wooden Train Whistle.mp3');

soundResourceManager.loadAll();

window.addEventListener('load', () => {
    window.addEventListener('mousedown', () => {
        console.log('playing')
        soundResourceManager.entries.get('cartoon')?.data?.play()
        // const newAudio = audio.cloneNode(true) as HTMLAudioElement;
        // setTimeout(() => newAudio.play(), 500);
        // const newAudioManual = new Audio('./resource/audio/Cartoon Metal Thunk.mp3');
        // setTimeout(() => newAudioManual.play(), 500);
    })
})
