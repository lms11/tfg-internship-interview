var Game = {};
var i, j, data, data2;

Game.fps = 30;
Game.numberOfTracks = 4;
Game.trackWidth = 160; // width of each track
Game.bikeVerticalSpeed = 15.0;

Game.initialize = function() {
  // Mapeia o contexto do canvas
  this.context = document.getElementById("canvas").getContext("2d");

  // Seta o tamanho do canvas = tamanho da janela
  this.context.canvas.width  = this.width  = window.innerWidth;
  this.context.canvas.height = this.height = window.innerHeight;
  this.playableArea = { 
    'from': new Point((this.width - Game.numberOfTracks * Game.trackWidth) / 2, 0),
    'to': new Point((this.width + Game.numberOfTracks * Game.trackWidth) / 2, this.height)
  };

  // Instancia o player (jogador principal)
  this.player = new Car((this.width - 90) / 2, this.height - 300*0.6 - 15, 
                        90, 180, true, "assets/car-uber.png");

  // Instancia o fundo
  this.backgroundSprite = document.createElement('img');
  this.backgroundSprite.src = "assets/background.jpg";

  // Instancia a lateral
  this.sidewalkSprite = document.createElement('img');
  this.sidewalkSprite.src = "assets/sidewalk.jpg";

  // Instancia a praia :D
  this.beachSprite = document.createElement('img');
  this.beachSprite.src = "assets/beach.jpg"; 

  // Inicia as entities. O vetor entities será, na verdade, uma matrix. Cada linha representa uma pista e cada coluna um carro.
  this.entities = [ ];
  this.bikeEntities = [ ];

  // Inicializa o vetor trackMinDistanceY que serve de auxilio. Com ele sabemos o carro com menor Y de cada pista
  this.trackMinDistanceY = [ ];
  this.trackMinDistanceYBike = [ 1000, 0 ];

  // Seta os valores iniciais das entidades e do vetor trackMinDistanceY
  for (i = 0; i < Game.numberOfTracks; i++) {
    this.entities.push([ ]);
    this.trackMinDistanceY.push(1000);
  }

  // Instancia o número de obstaculos
  this.numberOfObstacules = 0;
  this.numberOfBikes = 0;
  this.obstaculesGone = 0;

  // Inicia a Ciroc
  this.isCirocOnScreen = false;
  this.ciroc = null;
  this.cirocHitTime = new Date();
  this.cirocHit = false;
  this.cirocGeneratedTime = new Date();

  // Insere as linhas básicas das margins laterais
  this.cenarioLines = [
    {
      "from": new Point(this.playableArea.from.x, 0.0),
      "to": new Point(this.playableArea.from.x, this.height),
      "lineWidth": 7,
      "lineColor": '#181818',
      "dashed": false
    },
    {
      "from": new Point(this.playableArea.to.x, 0.0),
      "to": new Point(this.playableArea.to.x, this.height),
      "lineWidth": 7,
      "lineColor": '#181818',
      "dashed": false
    },
    // Limitante da ciclofaixa
    {
      "from": new Point(this.playableArea.to.x + 160, 0.0),
      "to": new Point(this.playableArea.to.x + 160, this.height),
      "lineWidth": 7,
      "lineColor": '#181818',
      "dashed": false
    },
    // Divisão da ciclofaixa
    {
      "from": new Point(this.playableArea.to.x + 80, 0.0),
      "to": new Point(this.playableArea.to.x + 80, this.height),
      "lineWidth": 3.5,
      "lineColor": '#FFFFFF',
      "dashed": true,
      "dashSize": 30,
      "dashSpace": 20
    }
  ];

  // Insere as linhas internas da pista
  for (i = 1; i < Game.numberOfTracks; i++) {
    this.cenarioLines.push({
      "from": new Point((this.width + Game.trackWidth * (2*i - Game.numberOfTracks)) / 2, 0.0),
      "to": new Point((this.width + Game.trackWidth * (2*i - Game.numberOfTracks)) / 2, this.height),
      "lineWidth": 6,
      "lineColor": '#FFFF00',
      "dashed": true,
      "dashSize": 80,
      "dashSpace": 25
    });
  }

  // Instancia a pontuacao
  this.score = 0;
};


Game.draw = function() {
  this.context.clearRect(0, 0, this.width, this.height);

  // Desenha o fundo
  var pattern = this.context.createPattern(this.backgroundSprite, "repeat");
  this.context.beginPath();
  this.context.moveTo(this.playableArea.from.x, this.playableArea.from.y);
  this.context.lineTo(this.playableArea.from.x, this.playableArea.to.y);
  this.context.lineTo(this.playableArea.to.x, this.playableArea.to.y);
  this.context.lineTo(this.playableArea.to.x, this.playableArea.from.y);
  this.context.closePath();
  this.context.fillStyle = pattern;
  this.context.fill();

  // Desenha as calçadas
  pattern = this.context.createPattern(this.sidewalkSprite, "repeat");
  this.context.beginPath();
  this.context.moveTo(0, this.playableArea.from.y);
  this.context.lineTo(0, this.playableArea.to.y);
  this.context.lineTo(this.playableArea.from.x, this.playableArea.to.y);
  this.context.lineTo(this.playableArea.from.x, this.playableArea.from.y);
  this.context.closePath();
  this.context.fillStyle = pattern;
  this.context.fill();

  this.context.beginPath();
  this.context.moveTo(this.playableArea.to.x + 160, this.playableArea.from.y);
  this.context.lineTo(this.playableArea.to.x + 160, this.playableArea.to.y);
  this.context.lineTo(this.width, this.playableArea.to.y);
  this.context.lineTo(this.width, this.playableArea.from.y);
  this.context.closePath();
  this.context.fillStyle = pattern;
  this.context.fill();

  // Desenhar a ciclofaixa
  this.context.beginPath();
  this.context.moveTo(this.playableArea.to.x, this.playableArea.from.y);
  this.context.lineTo(this.playableArea.to.x, this.playableArea.to.y);
  this.context.lineTo(this.playableArea.to.x + 160, this.playableArea.to.y);
  this.context.lineTo(this.playableArea.to.x + 160, this.playableArea.from.y);
  this.context.closePath();
  this.context.fillStyle = '#F00000';
  this.context.fill();


  // Desenha as linhas auxiliares
  for (i = 0; i < this.cenarioLines.length; i++) {
    data = this.cenarioLines[i];

    this.context.beginPath();

    if (data.dashed == false) {
      this.context.moveTo(data.from.x, data.from.y);
      this.context.lineTo(data.to.x, data.to.y);

    } else {
      var y = data.from.y + data.dashSpace / 2;

      while (y + data.dashSize <= this.height + 50) { // 50 = epsilon
        this.context.moveTo(data.from.x, y);
        this.context.lineTo(data.to.x, y + data.dashSize);

        y += data.dashSize + data.dashSpace;
      }
    }

    this.context.lineWidth = data.lineWidth;
    this.context.strokeStyle = data.lineColor;
    this.context.stroke();
    this.context.closePath();
  }

  // Desenha o player na pista
  this.context.drawImage(this.player.domElement, this.player.x, this.player.y, this.player.width, this.player.height);

  // Desenha a Ciroc na pista
  if (this.ciroc)
    this.context.drawImage(this.ciroc.domElement, this.ciroc.x, this.ciroc.y, this.ciroc.width, this.ciroc.height);

  // Desenha os carros/obstaculos na pista
  for (i = 0; i < this.entities.length; i++) {
    for (j = 0; j < this.entities[i].length; j++) {
      data = this.entities[i][j];
      this.context.drawImage(data.domElement, data.x, data.y, data.width, data.height);
    }
  }

  // Desenha as bicicletas na pista
  for (i = 0; i < this.bikeEntities.length; i++) {
    data = this.bikeEntities[i];
    this.context.drawImage(data.domElement, data.x, data.y, data.width, data.height);
  }

  // Escreve os placares
  if (playing) {
    var end = new Date(), segs = (end.getTime() - this.startTime.getTime()) / 1000;
    statusTime.textContent = Math.floor(segs/60) + 'min e ' + Math.floor(segs % 60) + 's';
    statusObstacles.textContent = this.obstaculesGone;
    statusVelocity.textContent = (Math.floor(this.verticalSpeed() * (36 / 4.5) * 10) / 10) + 'km/h';
    statusScore.textContent = Math.floor(this.score);
  }
};

Game.update = function() {
  if (!playing) return;

  if (isKeyPressed(CONST_LEFT_ARROW))
    this.player.x = Math.max(this.player.x - this.player.horizontalSpeed, this.playableArea.from.x);

  else if (isKeyPressed(CONST_RIGHT_ARROW))
    this.player.x = Math.min(this.player.x + this.player.horizontalSpeed, this.playableArea.to.x + 160.0 - this.player.width);

  var speed = this.verticalSpeed();

  if (this.isCirocOnScreen) {
    this.ciroc.y += speed;

    if (this.ciroc.isColliding(this.player)) {
      this.cirocHitTime = new Date();
      this.cirocHit = true;
      this.ciroc = null;
      this.isCirocOnScreen = false;

    } else if (this.ciroc.y >= this.playableArea.to.y) {
      this.cirocHit = false;
      this.ciroc = null;
      this.isCirocOnScreen = false;
    
    }
  }

  // Atualizamos os menores Y
  for (i = 0; i < Game.numberOfTracks; i++)
    this.trackMinDistanceY[i] += speed;

  // Pista da esquerda desce e a da direita sobe
  this.trackMinDistanceYBike[0] += this.bikeVerticalSpeed;
  this.trackMinDistanceYBike[1] -= this.bikeVerticalSpeed;

  for (i = 0; i < this.entities.length; i++) {
    for (j = 0; j < this.entities[i].length; j++) {
      data = this.entities[i][j];

      // Incrementamos a velocidade
      data.y += speed;

      // Checamos colisão
      if (data.isColliding(this.player))
        this.over();
      
      // Se o carro saiu de cena, então removemos ele das entidades
      if (data.y >= this.playableArea.to.y) {
        this.entities[i].splice(j, 1);
        this.numberOfObstacules--;
        this.obstaculesGone++;
      }
    }
  }

  for (i = 0; i < this.bikeEntities.length; i++) {
    data = this.bikeEntities[i];

    if (data.track == 0)
      data.y += data.verticalSpeed;
    else
      data.y -= data.verticalSpeed;

    // Checamos colisão
    if (data.isColliding(this.player)) {
      this.score /= 2;
    }
    
    if ((data.track == 0 && data.y >= Game.playableArea.to.y) ||
        (data.track == 1 && data.y <= -data.height)) {
      this.bikeEntities.splice(i, 1);
      this.numberOfBikes--;
    }
  }

  this.score += ((new Date()).getTime() - this.scoreTime.getTime()) / 1000;
  this.scoreTime = new Date();

  // Tentamos colocar novos obstaculos
  Game.generateNewObstacles();
  Game.generateNewBikeGuys();
  Game.generateCiroc();
};

Game.verticalSpeed = function() {
  var end = new Date();
  var elapsed = (end.getTime() - this.startTime.getTime()) / 1000; // em segundos
  var elapsedCiroc = (end.getTime() - this.cirocHitTime.getTime()) / 1000; // em segundos

  if (elapsedCiroc <= 10 && this.cirocHit == true) return 10;
  else return Math.min(30, 15 + elapsed / 4.0); // aceleração de 0.25px/s com vel. maxima em 60px/s
}

Game.generateNewObstacles = function() {
  var position = Math.floor(Math.random() * Game.numberOfTracks),
      x = this.playableArea.from.x + position * this.trackWidth + 35.0,
      y = this.playableArea.from.y - 180,
      obstacle = new Car(x, y, 90, 180, false, "assets/car-taxi.png", position);

  /*
    Regras para inserção:
    1) Mínimo de 30px entre dois carros na mesma pista
    2) No máximo 5 carros na rodovia (sem incluir o player)
    3.1) ou para carros em pistas consecutivas, haver pelo menos 400px de distancia entre os Y
    3.2) ou haver uma pista livre;
  */


  if (this.trackMinDistanceY[position] > 50 && this.numberOfObstacules < 5) {
    var canInsert = false;

    // Verifica se há alguma pista livre
    for (i = 0; i < this.entities.length; i++)
      if (this.entities[i].length == 0 && position != i)
        canInsert = true;

    // Se não houver nenhuma pista livre, verifica se para carros em pistas consecutivas, haver pelo menos 400px de distancia entre os Y
    // Na pratica isso implica em: achar o primeiro carro a direita com Y maior e verificar se a distancia entre eles é >= 400.
    // Utilizaremos o vetor trackMinDistanceY novamente
    if (!canInsert) {
      canInsert = this.trackMinDistanceY[position+1] >= this.player.height + 30;
    }

    if (canInsert) {
      this.entities[position].push(obstacle);
      this.trackMinDistanceY[position] = y;
      this.numberOfObstacules++;
    }
  }
}

Game.generateNewBikeGuys = function() {
  var position = Math.floor(Math.random() * 2),
      x = this.playableArea.to.x + position * 80 + 25,
      y = (position == 0) ? (this.playableArea.from.y - 80) : (this.playableArea.to.y),
      obstacle = new Bike(x, y, position);

  /*
    Regras para inserção:
    1) Mínimo de 30px entre duas bicicletas na mesma pista
    2) No máximo 4 bicicletas na ciclovia
  */

  if (((position == 0 && (this.trackMinDistanceYBike[position] > 100)) || 
      (position == 1 && (this.trackMinDistanceYBike[position] < this.playableArea.to.y - 100))) &&
      this.numberOfBikes < 4) {

    console.log(this.numberOfBikes);

    this.bikeEntities.push(obstacle);
    this.trackMinDistanceYBike[position] = y;
    this.numberOfBikes++;
  }
}

Game.generateCiroc = function() {
  var show = Math.random(),
      x = (this.playableArea.to.x - this.playableArea.from.x) * Math.random() + this.playableArea.from.x,
      y = -100,
      obstacle = new Ciroc(x, y),
      end = new Date(),
      elapsedCiroc = (end.getTime() - this.cirocGeneratedTime.getTime()) / 1000; // em segundos

  /*
    Regras para inserção:
    1) Aparece com uma prob. de 0.1%
    2) No máximo 1 Ciroc na tela
    3) Uma Ciroc a cada 30s
  */


  if (!this.isCirocOnScreen && show <= 0.001 && elapsedCiroc >= 30) {
    this.isCirocOnScreen = true;
    this.ciroc = obstacle;
    this.cirocGeneratedTime = new Date();
  }
}

Game.over = function () {
  playing = false;
  statusTime2.textContent       = statusTime.textContent;
  statusObstacles2.textContent  = statusObstacles.textContent;
  statusVelocity2.textContent   = statusVelocity.textContent;
  statusScore2.textContent      = statusScore.textContent;

  var end = new Date(), segs = (end.getTime() - this.startTime.getTime()) / 1000;

  if (localStorage.maxTime != undefined && localStorage.maxTime != null)
    localStorage.maxTime = Math.max(localStorage.maxTime, (end.getTime() - this.startTime.getTime()) / 1000);
  else
    localStorage.maxTime = (end.getTime() - this.startTime.getTime()) / 1000;

  if (localStorage.maxObstacles != undefined && localStorage.maxObstacles != null)
    localStorage.maxObstacles = Math.max(localStorage.maxObstacles, this.obstaculesGone);
  else
    localStorage.maxObstacles = this.obstaculesGone;

  if (localStorage.maxScore != undefined && localStorage.maxScore != null)
    localStorage.maxScore = Math.max(localStorage.maxScore, Math.floor(this.score));
  else
    localStorage.maxScore = Math.floor(this.score);

  updateRecorde();

  var gameoverModal = document.getElementById("gameover");
  gameoverModal.style.display = 'block';
}
