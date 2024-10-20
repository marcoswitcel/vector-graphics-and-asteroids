# Pendências

## Objetivo e necessário

- [X] Analisar e escolher um sistema de coordenada para posicionar os elementos (sistema cartesiano com restrição de espaço visível entre -1 e 1 nos dois eixos, -1 para 1 da esquerda para direita e -1 para 1 de baixo para cima, o centro é descrito como o vetor (0,0) ).
- [X] Representar e desenhar polígonos.
- [X] Implementar funções de rotação, escalonamento e outras distorções para aplicar nos polígonos.
- [X] Implementar o sistema básico de física e input e testá-los em conjunto.
- [X] Implementar a funcionalidade de emissão de "projéteis" a partir da nave.
- [X] Implementar um sistema de colisão rudimentar para permitir acionar o efeito de fragmentação e ou destruição dos asteroides.
- [X] Implementar suporte a momento angular nas entidades. Assim poderei descrever a rotação de cada entidade separadamente.
- [X] Montar uma pequena cena com  asteroides de diversos tamanhos (diversas figuras de asteroides também), se possível clicável e com os asteroides se dividindo em partes menores.
- [X] Criar e implementar o efeito/algoritmo de fragmentação dos asteroides.
- [X] Ajustar o tempo do jogo para não ser influenciado pela taxa de refresh do monitor. Calcular deltatime e usá-lo na hora de computar as animações.
- [X] Projetar a nave, animar as chamas da nave. Deixar uma pequena cena com a nave pilotável
- [X] Melhorar método de renderização para suportar de forma simples e organizada a renderização das entidades que estão atravessando as bordas. Renderizar as partes da entidade em seu devidos lados da tela.
- [X] estudar e implentar um sistema de som que funcione junto com a simulação, entender o que é necessário e integrá-lo ao sistema de entidades, implementar algum tipo de catálogo de áudios.
- [X] Adicionar um contador de asteróides destruídos
- [X] Implementar um sistema simples para inserir mais asteróides conforme forem sendo destruídos, acredito que poderia trabalhar com "ondas" de e ir incrementando.
- [X] Criar e implementar as funcionalidades e efeitos envolvidos em converter a forma da nave em linhas e criar entidades para que cada linha possa sair flutuando após a fragmentação da nave, ou fragmentação do asteroide que não pode mais ser partidos.  
- [X] Adicionar botão de restart para não precisar apertar F5.
- [ ] Implementar e organizar um sistema que permita gerenciar as entidades do jogo/simulação.
- [ ] Implementar/estudar melhor forma de implementar a renderização de animações e figuras compostas de várias formas animadas.


## Coisas a melhorar / Concluir

- [X] Ajustar para que keyboards usem as mesmas teclas de referência quando possível
- [ ] Escolher sons bons para a simulação principal e adicioná-los nos momentos apropriados. Sons como: disparos, um ou mais caso seja necessário variação; som de explosão, quando acerta um asteróide e quando a nave explode.
- [ ] Melhorar a forma como os asteróides são adicionados, o sistema de "ondas" de asteróides
não possuí variedade nem progressão de dificuldade/entretenimento. (A simulação deve começar mais fácil, dando mais chance para reagir e aprender a se mover)
- [ ] Testar e alterar os valores da aceleração, velocidade angular para rotação para que o movimento, aceleração, capacidade de fazer curvas fiquem bons. Considerar diminuir a área de colisão da nave e talvez dos asteróides.
- [ ] Considerar ajustar a aceleração para ela não começar no máximo e sim ir subindo até atingir o máximo, acredito que isso melhoraria a manobrabilidade da nave.
- [ ] Adicionar suporte a mais uma configuração de controles. (adicionar controle por setinhas)
- [ ] Quando sistema de visualização de forças (aceleração e velocidade) foi implementado, não foi feito uso do recurso que renderiza as coisas dentro do espaço da simulação como se fosse contínuo, seria interessante mudar isso.
- [X] Escolher e aplicar uma fonte para garantir consistência visual e melhorar a qualidade no geral (uma fonte candidata: https://fonts.google.com/share?selection.family=Nerko+One) ou (https://fonts.google.com/specimen/Courier+Prime)

## Ideias para o futuro

- [ ] Implementar o efeito de iluminação parecido com o dos arcades para o processo de renderização dos gráficos vetoriais.
- [ ] Achar algum meio para distribuir os asteroides de forma "randômica"
- [ ] Implementar algum mecanismo que permita aplicar "efeitos" aos sons que serão adicionados

## Lista de Bugs

- [ ] Tive a impressão de presenciar uma falha no sistema de input, o que vi foi o seguinte: a nave não estava respondendo aos meus inputs no teclado de forma alguma, tenho a impressão que reiniciei a aplicação e o problema seguiu, depois de um tempo voltou a funcionar. Muito estranho e sem cenário confirmado por enquanto.
- [X] A fragmentação da nave quando é destruída não está implementada corretamente, os fragmentos nem sempre rotacionam baseado no seu centro.

## Performance

* Por algum motivo os asteróides (possivelmente tudo), estão apresentando
uma animação não suave. Eles aparentam estar saltando "pra frente e pra trás"
 * Tentei debugar esse cenário, montar um caso mais simples e entender o problema, fazendo isso
descobri que o problema não ocorre sempre, parece ter haver com a carga da CPU, talvez tenha algo
que possa ser feito no jogo para ajustar o compasso.
 * Talvez o problema tenha haver com a conversão do deltatime para ponto flutuante?
 * Talvez o método de renderização cause o artefacto visual
 * Limite de tags de áudio atingido no chrome, há um print do erro e segue o link do stackoverflow com possível solução: https://stackoverflow.com/questions/68480528/blocked-attempt-to-create-a-webmediaplayer-as-there-are-too-many-webmediaplayers
