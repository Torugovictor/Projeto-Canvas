const canvas = document.getElementById('dinoGame');
const ctx = canvas.getContext('2d');

// Declaração de Variaves
let score;
let scoreText;
let highscore;
let highscoreText;
let player;
let gravidade;
let obstaculos = [];
let velocidade;
let keys = {};

// Event Listeners
document.addEventListener('keydown', function (evt) {
  keys[evt.code] = true;
});
document.addEventListener('keyup', function (evt) {
  keys[evt.code] = false;
});

class Player {
  constructor (x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = c;

    this.dy = 0;
    this.forcaPulo = 15;
    this.tamanhoOriginal = h;
    this.chao = false;
    this.tempoPulo = 0;
  }

  Animate () {
    // Pulo e abaixar
    if (keys['Space'] || keys['KeyW']) {
      this.Jump();
    } else {
      this.tempoPulo = 0;
    }

    if (keys['ShiftLeft'] || keys['KeyS']) {
      this.h = this.tamanhoOriginal / 2;
    } else {
      this.h = this.tamanhoOriginal;
    }

    this.y += this.dy;

    // gravidade
    if (this.y + this.h < canvas.height) {
      this.dy += gravidade;
      this.chao = false;
    } else {
      this.dy = 0;
      this.chao = true;
      this.y = canvas.height - this.h;
    }

    this.Draw();
  }

  Jump () {
    if (this.chao && this.tempoPulo == 0) {
      this.tempoPulo = 1;
      this.dy = -this.forcaPulo;
    } else if (this.tempoPulo > 0 && this.tempoPulo < 15) {
      this.tempoPulo++;
      this.dy = -this.forcaPulo - (this.tempoPulo / 50);
    }
  }

  Draw () {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.closePath();
  }
}

class Obstaculo {
  constructor (x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = c;

    this.dx = -velocidade;
  }

  Update () {
    this.x += this.dx;
    this.Draw();
    this.dx = -velocidade;
  }

  Draw () {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.closePath();
  }
}

class Text {
  constructor (t, x, y, a, c, s) {
    this.t = t;
    this.x = x;
    this.y = y;
    this.a = a;
    this.c = c;
    this.s = s;
  }

  Draw () {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.font = this.s + "px sans-serif";
    ctx.textAlign = this.a;
    ctx.fillText(this.t, this.x, this.y);
    ctx.closePath();
  }
}

// Funções do Jogo
function SpawObstaculo () {
  let size = RandomIntInRange(20, 70);
  let type = RandomIntInRange(0, 1);
  let obstaculo = new Obstaculo(canvas.width + size, canvas.height - size, size, size, '#000000');

  if (type == 1) {
    obstaculo.y -= player.tamanhoOriginal - 10;
  }
  obstaculos.push(obstaculo);
}


function RandomIntInRange (min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function Start () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.font = "20px sans-serif";

  velocidade = 3;
  gravidade = 1;

  score = 0;
  highscore = 0;
  if (localStorage.getItem('highscore')) {
    highscore = localStorage.getItem('highscore');
  }

  player = new Player(25, 0, 50, 50, '#FF7C00');

  scoreText = new Text("Score: " + score, 25, 25, "left", "#212121", "20");
  highscoreText = new Text("Highscore: " + highscore, canvas.width - 25, 25, "right", "#212121", "20");

  requestAnimationFrame(Update);
}

let spawInicial = 200;
let tempoSpaw = spawInicial;
function Update () {
  requestAnimationFrame(Update);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  tempoSpaw--;
  if (tempoSpaw <= 0) {
    SpawObstaculo();
    console.log(obstaculos);
    tempoSpaw = spawInicial - velocidade * 8;
    
    if (tempoSpaw < 60) {
      tempoSpaw = 60;
    }
  }

  // Spawn Obstaculos
  for (let i = 0; i < obstaculos.length; i++) {
    let o = obstaculos[i];

    if (o.x + o.w < 0) {
      obstaculos.splice(i, 1);
    }

    if (
      player.x < o.x + o.w &&
      player.x + player.w > o.x &&
      player.y < o.y + o.h &&
      player.y + player.h > o.y
    ) {
      obstaculos = [];
      score = 0;
      tempoSpaw = spawInicial;
      velocidade = 3;
      window.localStorage.setItem('highscore', highscore);
    }

    o.Update();
  }

  player.Animate();

  score++;
  scoreText.t = "Score: " + score;
  scoreText.Draw();

  if (score > highscore) {
    highscore = score;
    highscoreText.t = "Highscore: " + highscore;
  }
  
  highscoreText.Draw();

  velocidade += 0.003;
}

Start();
