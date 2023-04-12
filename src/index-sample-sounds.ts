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
 * @todo implementar um sistema capaz de rodar múltiplos sons simultâneamentes 
 * e multiplas vezes e simultâneamentes o mesmo som                                     -- OK
 * @todo atingir o objetivo de ser de fácil implementação no sistema de entidades
 * rodando na simulação principal.
 * @todo implementar um controle de volume que funcione por instância de som e
 * talvez um volume global (isso é um mixer que faz?)                                   -- OK
 * @todo caso necessário lidar com assets de som, analisar implementar um gestor
 * de recursos.                                                                         -- OK
 * 
 * Coisas que descartei inicialmente: son espacial (2d), 
 */

/**
 * Função que criar uma promise para trabalhar com o áudio carregado com
 * `HTMLAudioElement`
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

const assertNotNull = (value: any, name?: string):  void | never => {
    if (value === null) {
        if (name) {
            throw new TypeError(`A variável ${name} não pode receber null`);
        }
        throw new TypeError('Null não permitido');
    }
}

enum SoundHandleState {
    NOT_STARTED,
    PLAYING,
    STOPED,
    ENDED,
    RELEASED,
}

class SoundHandle {

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

class SoundMixer {

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
     */
    public play(name: string, loop: boolean = false) {
        if (this.soundResourceManager.entries.has(name)) {
            const soundResEntry = this.soundResourceManager.entries.get(name) as SoundResourceEntry;
            if (soundResEntry.readyToPlay) {
                /**
                 * @note Talvez clonar seja uma operação muito pesada devo trocar
                 * para um pool de `HTMLAudioElement`, mas não farei isso ainda.
                 */
                const audioElement = soundResEntry.data?.cloneNode(true) as HTMLAudioElement;
                const soundHandle = new SoundHandle(audioElement, this, loop, 1);
                soundHandle.play();

                this.playingSounds.add(soundHandle);
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

const soundResourceManager = new SoundResourceManager;

soundResourceManager.add('cartoon', './resource/audio/Cartoon Metal Thunk.mp3');
soundResourceManager.add('wooden', './resource/audio/Wooden Train Whistle.mp3');
soundResourceManager.add('penClicking', './resource/audio/Pen Clicking.mp3');

soundResourceManager.loadAll();

const soundMixer = new SoundMixer(soundResourceManager);

/**
 * @todo João, acredito que implementar uma forma de traquear os sons executando a partir de quem requisita o som seria legal
 * Reposta: Talvez o SoundHandle possar atender esse papel, mas acredito que para isso
 * seria necessário revisar os métodos e deixá-lo mais seguro para uso externo do SoundMixer
 */

const playCartoonButtonElement = document.getElementById('cartoonMetalThunk');
const playWoodenButtonElement = document.getElementById('woodenTrainWhistle');
const playPenClickingElement = document.getElementById('penClicking');
const globalVolumeRangeElement = document.getElementById('globalVolume');
const displayVolumeRangeElement = document.getElementById('displayVolume');
const playingSoundsListElement = document.getElementById('playingSoundsList');


if (!playCartoonButtonElement || !playWoodenButtonElement || !globalVolumeRangeElement || !displayVolumeRangeElement || !playingSoundsListElement || !playPenClickingElement) throw "Elemento faltando no HTML";

const updateDisplayVolume = () => {
    if (globalVolumeRangeElement instanceof HTMLInputElement) {
        displayVolumeRangeElement.innerText = Number(+globalVolumeRangeElement.value * 100).toFixed(2);
    }
}

playCartoonButtonElement.addEventListener('click', () => {
    soundMixer.play('cartoon');
});

playWoodenButtonElement.addEventListener('click', () => {
    soundMixer.play('wooden');
});

playPenClickingElement.addEventListener('click', () => {
    soundMixer.play('penClicking');
});

globalVolumeRangeElement.addEventListener('input', () => {
    if (globalVolumeRangeElement instanceof HTMLInputElement) {
        updateDisplayVolume();
        soundMixer.setVolume(+globalVolumeRangeElement.value);
    }
});

updateDisplayVolume();

/**
 * @todo João, código bem mal organizado e acredito que ineficiente, reorganizar e otimizar
 */
const map: Map<SoundHandle, ListItemComponent> = new Map();
const updateList = () => {
    for (const soundHandle of soundMixer.getPlayingSoundsIter()) {
        const listItemComponent = map.get(soundHandle);

        if (soundHandle.status === SoundHandleState.ENDED) {
            if (listItemComponent) {
                map.delete(soundHandle);
                playingSoundsListElement.removeChild(listItemComponent.rootElement);
            }
            continue;
        }

        if (listItemComponent) {
            listItemComponent.updateElements();
        } else {
            const listItemComponent = new ListItemComponent(soundHandle);
            map.set(soundHandle, listItemComponent);
            playingSoundsListElement.appendChild(listItemComponent.rootElement);
        }
    }

    soundMixer.clear();
};

class RangeInputComponent {
    
    public rootElement: HTMLElement;

    private spanLabelElement!: HTMLElement;
    private inputElement!: HTMLInputElement;
    private label: string;
    private name: string;
    private defaulValue: number;
    private min: number;
    private max: number;
    private step: number;
    private callbackonChange?: (value: number) => void;

    constructor(label: string, name: string, defaulValue = 0, min: number, max: number, step: number, callbackonChange?: (value: number) => void) {
        this.label = label;
        this.name = name;
        this.defaulValue = defaulValue;
        this.min = min;
        this.max = max;
        this.step = step;
        this.callbackonChange = callbackonChange;
        this.rootElement = this.buildElements();
        this.updateElements();
    }

    private buildElements(): HTMLElement {
        const rootLabelElement = document.createElement('label');

        this.spanLabelElement = document.createElement('span');
        this.inputElement = document.createElement('input');

        this.inputElement.setAttribute('min', this.min.toString());
        this.inputElement.setAttribute('max', this.max.toString());
        this.inputElement.setAttribute('step', this.step.toString());
        this.inputElement.setAttribute('name', this.name);
        this.inputElement.setAttribute('value', this.defaulValue.toString());
        this.inputElement.setAttribute('type', 'range');

        if (this.callbackonChange) {
            this.inputElement.addEventListener('input', (event) => {
                if (this.callbackonChange) {
                    this.callbackonChange(parseFloat(this.inputElement.value));
                }
            });
        }

        rootLabelElement.appendChild(this.spanLabelElement);
        rootLabelElement.appendChild(this.inputElement);

        return rootLabelElement;
    }

    public updateElements() {
        this.spanLabelElement.innerText = `${this.label}: ${this.inputElement.value}`;
    } 
}

class ListItemComponent {

    public rootElement: HTMLElement;

    private spanNameElement!: HTMLElement;
    private spanTimeElement!: HTMLElement;
    private progressTimeElement!: HTMLElement;
    private volumeInputComponent!: RangeInputComponent;
    private playButtonElement!: HTMLButtonElement;
    private iconButtonElement!: HTMLElement;
    private soundHandle: SoundHandle;

    constructor(soundHandle: SoundHandle) {
        this.soundHandle = soundHandle;
        this.rootElement = this.buildElements();
        this.updateElements();
    }

    private buildElements(): HTMLElement {
        const rootLiElement = document.createElement('li');
        rootLiElement.classList.add('list-item-component');

        this.spanNameElement = document.createElement('span');
        this.spanTimeElement = document.createElement('span');
        this.progressTimeElement = document.createElement('div');
        this.playButtonElement = document.createElement('button');
        this.iconButtonElement = document.createElement('i');
        this.volumeInputComponent = new RangeInputComponent('Volume', 'volume', 100, 0, 100, 1, (value: number) => {
            this.soundHandle.setVolume(value / 100);
        });

        this.progressTimeElement.classList.add('progress');
        this.playButtonElement.setAttribute('type', 'button');
        this.playButtonElement.addEventListener('click', () => {
            switch (this.soundHandle.status) {
                case SoundHandleState.PLAYING: this.soundHandle.stop(); break;
                case SoundHandleState.STOPED: this.soundHandle.play(); break;
                default: console.warn(`O listener do botão de play foi acionado com um SoundHandle.status inválido: ${SoundHandleState[this.soundHandle.status]}`)
            }
        });
        this.iconButtonElement.classList.add('material-icons');

        rootLiElement.appendChild(this.spanNameElement);
        rootLiElement.appendChild(this.spanTimeElement);
        this.playButtonElement.appendChild(this.iconButtonElement);
        rootLiElement.appendChild(this.playButtonElement);
        rootLiElement.appendChild(this.volumeInputComponent.rootElement);
        rootLiElement.appendChild(this.progressTimeElement);

        return rootLiElement;
    }

    public updateElements() {
        const url = new URL(this.soundHandle.src);
        let filename = url.pathname;
        try {
            filename = decodeURI(filename);
            filename = filename.split('/').filter(part => part.includes('.mp3')).join('');
        } catch (error) {}

        this.spanNameElement.innerText = `Tocando: ${filename}`;
        const percentage = (this.soundHandle.currentTime / this.soundHandle.duration * 100);
        this.spanTimeElement.innerText = `${this.soundHandle.currentTime.toFixed(2)} / ${this.soundHandle.duration.toFixed(2)} (${percentage.toFixed(2)}%)`;
        this.progressTimeElement.style.width = percentage + '%';
        this.volumeInputComponent.updateElements();
        this.iconButtonElement.innerText = (this.soundHandle.status === SoundHandleState.PLAYING) ? 'pause' : 'play_arrow';
    } 
}

setInterval(updateList, 60);

// @todo João, testando mudanças no som ao longo da execução, notei alguns artefactos mudando pelo range,
// podem ser em decorrência de múltiplos eventos em sequencia
// let index = 0;
// requestAnimationFrame(function updateSound(time) {
//     console.log(time % 1000 / 1000);
//     soundMixer.setVolume(time % 2000 / 2000);
//     requestAnimationFrame(updateSound);
// })
