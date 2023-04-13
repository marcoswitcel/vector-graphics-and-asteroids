import { SoundHandle, SoundHandleState, SoundMixer } from './sounds/sound-mixer.js';
import { SoundResourceManager } from './sounds/sound-resource-manager.js';

/**
 * estudar e implentar um sistema de som que funcione junto com a simulação,
 * entender o que é necessário e integrá-lo ao sistema de entidades, implementar
 * algum tipo de catálogo de áudios.
 * @todo Atingir os objetivos acima
 * @todo Uma vez pronta a implementação, aplicar também na simulação principal
 */

/**
 * Específicos
 * @todo encontrar áudios para os tiros e explosões (encontrei áudios para testar 
 * o mixer, e achei um som para executar no momento da emissão do projétil)
 * @todo implementar um sistema capaz de rodar múltiplos sons simultâneamentes 
 * e multiplas vezes e simultâneamentes o mesmo som                                     -- OK
 * @todo atingir o objetivo de ser de fácil implementação no sistema de entidades
 * rodando na simulação principal.
 * @todo implementar um controle de volume que funcione por instância de som e
 * talvez um volume global (isso é um mixer que faz?)                                   -- OK
 * @todo caso necessário lidar com assets de som, analisar implementar um gestor
 * de recursos.                                                                         -- OK
 * @todo reorganizar os arquivos das classes em um módulo separado para poder
 * importar na demonstração da nave com os asteróides                                   -- OK
 * @todo com o código separado em módulos, agora posso tentar implementar na
 * demonstração da navinha e ajustar/adicionar possíveis recursos faltantes
 * 
 * Coisas que descartei inicialmente: son espacial (2d), 
 */

const assertNotNull = (value: any, name?: string):  void | never => {
    if (value === null) {
        if (name) {
            throw new TypeError(`A variável ${name} não pode receber null`);
        }
        throw new TypeError('Null não permitido');
    }
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
