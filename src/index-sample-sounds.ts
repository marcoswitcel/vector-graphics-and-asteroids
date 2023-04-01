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

const audio = new Audio('./resource/audio/Cartoon Metal Thunk.mp3');

window.addEventListener('load', () => {
    window.addEventListener('mousedown', () => {
        audio.play()
    })
})

