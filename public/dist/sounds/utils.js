/**
 * Função que criar uma promise para trabalhar com o áudio carregado com
 * `HTMLAudioElement`
 * @param audio elemento contendo o áudio fonte
 * @param fullyLoaded
 * @returns
 */
export function isPlayable(audio, fullyLoaded = true) {
    const doneEvent = fullyLoaded ? 'canplaythrough' : 'canplay';
    return new Promise((resolve, reject) => {
        audio.addEventListener(doneEvent, () => resolve(audio));
        audio.addEventListener('error', () => reject(audio));
    });
}
export function between(value, min, max) {
    return Math.max(Math.min(value, max), min);
}
