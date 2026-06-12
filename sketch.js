function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}// =======================
// CONFIGURAÇÕES E TIPOS
// =======================
const MODOS = { JOGANDO: 0, MERCADO: 1 };
let modoAtual = MODOS.JOGANDO;

const TIPOS_SEMENTES = {
  ALFACE: { nome: "Alface", custo: 5, venda: 12, tempo: 0.005, cor: "#90EE90" },
  MILHO:  { nome: "Milho",  custo: 15, venda: 35, tempo: 0.002, cor: "#FFD700" },
  TOMATE: { nome: "Tomate", custo: 30, venda: 80, tempo: 0.001, cor: "#FF6347" }
};

// =======================
// ESTADO GLOBAL
// =======================
let tempo = 0;
let dinero = 100; 
let estoqueSementes = { ALFACE: 2, MILHO: 0, TOMATE: 0 };
let fertilizantes = 1;
let produtosColhidos = []; // Agora é uma lista para guardar cada tipo de planta!
let mensagem = "Dica: Use 1, 2, 3 para escolher sementes";
let sementeSelecionada = "ALFACE";
let plantacoes = [];

// OBJETOS
const lojaArea = { x: 750, y: 150, w: 150, h: 100 };
let caminhao = { x: -200, y: 50, ativo: false, parado: false, carga: 0, esperando: true };
let player = { x: 400, y: 300, w: 25, h: 35, vel: 4 };

// =======================
// CLASSE PLANTA
// =======================
class Planta {
  constructor(x, y, tipo) {
    this.x = x; this.y = y;
    this.tipo = tipo;
    this.info = TIPOS_SEMENTES[tipo];
    this.crescimento = 0;
    this.pronta = false;
    this.fertilizada = false;
  }
  
  atualizar() {
    if (!this.pronta) {
      let mult = this.fertilizada ? 2 : 1;
      this.crescimento += deltaTime * this.info.tempo * mult;
      if (this.crescimento >= 100) { 
        this.crescimento = 100; 
        this.pronta = true; 
      }
    }
  }
  
  desenhar() {
    push();
    translate(this.x, this.y);
    noStroke();
    fill(this.info.cor);
    let tam = map(this.crescimento, 0, 100, 5, 25);
    if (this.tipo === "MILHO") {
      rect(-tam/2, -tam, tam, tam);
    } else {
      ellipse(0, -tam/2, tam, tam);
    }
    if (this.fertilizada) { 
      fill(255); 
      circle(0, -tam-5, 5); 
    }
    if (this.pronta) { 
      stroke(255); 
      strokeWeight(2); 
      noFill(); 
      circle(0, -tam/2, tam+4); 
    }
    pop();
  }
}

// =======================
// SETUP & DRAW
// =======================
function setup() {
  createCanvas(1000, 600);
}

function draw() {
  if (modoAtual === MODOS.JOGANDO) {
    executarJogo();
  } else {
    desenharMenuMercado();
  }
}

// =======================
// LÓGICA DO JOGO
// =======================
function executarJogo() {
  atualizarTempo();
  desenharCenario();
  
  // Caminhão
  atualizarCaminhao();
  desenharCaminhao();
  
  // Plantações
  for (let p of plantacoes) { 
    p.atualizar(); 
    p.desenhar(); 
  }
  
  // Player
  atualizarPlayer();
  desenharPlayer();
  
  // Interface de fundo (HUD)
  desenharHUD();
  
  // Texto de aviso do Mercado
  if (colisaoPlayer(lojaArea)) {
    push();
    fill(0);
    textSize(16);
    textAlign(CENTER, BOTTOM);
    text("Aperte 'M' para abrir o MERCADO", lojaArea.x + lojaArea.w / 2, lojaArea.y - 10);
    pop();
  }
}

function atualizarTempo() {
  tempo += deltaTime / 1000;
  if (tempo > 480) tempo = 0;
}

function atualizarPlayer() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) player.x -= player.vel;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) player.x += player.vel;
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) player.y -= player.vel;
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) player.y += player.vel;
  player.x = constrain(player.x, 0, width);
  player.y = constrain(player.y, 110, height);
}

// =======================
// SISTEMA DE CAMINHÃO
// =======================
function atualizarCaminhao() {
  if (tempo > 100 && !caminhao.ativo) {
    caminhao.ativo = true;
    caminhao.x = -200;
    caminhao.parado = false;
    caminhao.esperando = true;
  }

  if (caminhao.ativo) {
    if (!caminhao.parado) {
      caminhao.x += 3;
      if (caminhao.x > 200 && caminhao.esperando) {
        caminhao.parado = true;
        mensagem = "O caminhão chegou! Leve os produtos e aperte 'L'";
      }
    }
    
    if (caminhao.x > width + 200) {
      caminhao.ativo = false;
    }
  }
}

function desenharCaminhao() {
  if (!caminhao.ativo) return;
  push();
  translate(caminhao.x, caminhao.y);
  fill(50); rect(0, 0, 120, 50);
  fill(100, 0, 0); rect(120, 20, 40, 30);
  fill(0); circle(30, 55, 20); circle(130, 55, 20);
  fill(255); textSize(12); text("CARGA: " + caminhao.carga, 10, 30);
  pop();
}

// =======================
// CENÁRIO & UI
// =======================
function desenharCenario() {
  background(135, 206, 235);
  fill(80); noStroke(); rect(0, 40, width, 60);
  fill(255, 200, 0); for(let i=0; i<width; i+=60) rect(i, 68, 30, 4);
  fill(100, 200, 100); rect(0, 100, width, height);
  fill(139, 69, 19); rect(50, 150, 600, 400);
  fill(150, 75, 0); rect(lojaArea.x, lojaArea.y, lojaArea.w, lojaArea.h);
  fill(255); text("MERCADO LOCAL", 775, 180);
}

function desenharHUD() {
  fill(0, 150); rect(0, height-80, width, 80);
  fill(255); textAlign(LEFT); textSize(16);
  text(`💰 $${dinero}`, 20, height-50);
  text(`📦 Produtos no bolso: ${produtosColhidos.length}`, 20, height-25);
  text(`🧪 Fertilizantes: ${fertilizantes}`, 250, height-50);
  text(`🌱 Selecionado: ${sementeSelecionada} (${estoqueSementes[sementeSelecionada]})`, 250, height-25);
  text(mensagem, 550, height-35);
}

// =======================
// MENU DO MERCADO
// =======================
function desenharMenuMercado() {
  background(0, 150);
  fill(250);
  rect(200, 90, 600, 430, 20);
  
  fill(0); textSize(24); textAlign(CENTER);
  text("MERCADO DE SEMENTES", 500, 130);
  
  textSize(18); 
  fill(0, 130, 0); 
  text(`Seu Dinheiro: $${dinero}`, 500, 160);
  
  let i = 0;
  for (let s in TIPOS_SEMENTES) {
    let sInfo = TIPOS_SEMENTES[s];
    fill(230); rect(250, 180 + (i * 70), 500, 60, 10);
    
    fill(0); textAlign(LEFT); textSize(16);
    text(`${sInfo.nome} - Custo: $${sInfo.custo} (Venda: $${sInfo.venda})`, 270, 215 + (i * 70));
    
    fill(100, 200, 100); rect(650, 190 + (i * 70), 80, 40, 5);
    fill(255); text("COMPRAR", 655, 215 + (i * 70));
    i++;
  }
  
  fill(230); rect(250, 400, 500, 60, 10);
  fill(0); textAlign(LEFT);
  text("Fertilizante Especial - Custo: $20", 270, 435);
  fill(100, 100, 255); rect(650, 410, 80, 40, 5);
  fill(255); text("COMPRAR", 655, 435);

  fill(200, 50, 50); rect(450, 480, 100, 30, 5);
  fill(255); textAlign(CENTER); text("SAIR (ESC)", 500, 500);
}

// =======================
// CONTROLES
// =======================
function keyPressed() {
  if (key === '1') sementeSelecionada = "ALFACE";
  if (key === '2') sementeSelecionada = "MILHO";
  if (key === '3') sementeSelecionada = "TOMATE";

  if (key === 'm' || key === 'M') {
    if (colisaoPlayer(lojaArea)) modoAtual = MODOS.MERCADO;
  }
  if (keyCode === ESCAPE) modoAtual = MODOS.JOGANDO;

  // Plantar
  if (key === ' ' && modoAtual === MODOS.JOGANDO) {
    if (estoqueSementes[sementeSelecionada] > 0 && player.x > 50 && player.x < 650 && player.y > 150) {
      plantacoes.push(new Planta(player.x, player.y, sementeSelecionada));
      estoqueSementes[sementeSelecionada]--;
    }
  }

  // Colher (Guarda o tipo exato da planta colhida)
  if (key === 'e' || key === 'E') {
    for (let i = plantacoes.length - 1; i >= 0; i--) {
      let p = plantacoes[i];
      if (p.pronta && dist(player.x, player.y, p.x, p.y) < 40) {
        produtosColhidos.push(p.tipo); // Adiciona o tipo específico à lista
        plantacoes.splice(i, 1);
        mensagem = "Colheu " + p.tipo;
      }
    }
  }

  // Fertilizar
  if (key === 'f' || key === 'F') {
    if (fertilizantes > 0) {
      for (let p of plantacoes) {
        if (!p.pronta && !p.fertilizada && dist(player.x, player.y, p.x, p.y) < 40) {
          p.fertilizada = true;
          fertilizantes--;
          mensagem = "Planta fertilizada! Crescendo 2x mais rápido.";
          break;
        }
      }
    }
  }

  // Carregar Caminhão (Calcula o valor somando o preço individual de cada item)
  if (key === 'l' || key === 'L') {
    if (caminhao.parado && dist(player.x, player.y, caminhao.x + 60, caminhao.y + 25) < 100) {
      if (produtosColhidos.length > 0) {
        let lucroTotal = 0;
        
        // Passa por cada produto guardado e soma o valor de venda correto dele
        for (let tipo of produtosColhidos) {
          lucroTotal += TIPOS_SEMENTES[tipo].venda;
        }
        
        caminhao.carga += produtosColhidos.length;
        dinero += lucroTotal; // Adiciona o lucro real ao dinheiro
        produtosColhidos = []; // Esvazia o bolso
        
        caminhao.esperando = false; 
        caminhao.parado = false; 
        mensagem = `Caminhão carregado! Lucro de: +$${lucroTotal}`;
      } else {
        mensagem = "Você não tem produtos no bolso para carregar!";
      }
    }
  }
}

function mousePressed() {
  if (modoAtual === MODOS.MERCADO) {
    if (mouseX > 650 && mouseX < 730) {
      if (mouseY > 190 && mouseY < 230) comprarSemente("ALFACE");
      if (mouseY > 260 && mouseY < 300) comprarSemente("MILHO");
      if (mouseY > 330 && mouseY < 370) comprarSemente("TOMATE");
      if (mouseY > 410 && mouseY < 450) comprarFertilizante();
    }
    if (mouseX > 450 && mouseX < 550 && mouseY > 480 && mouseY < 510) modoAtual = MODOS.JOGANDO;
  }
}

function comprarSemente(tipo) {
  let custo = TIPOS_SEMENTES[tipo].custo;
  if (dinero >= custo) {
    dinero -= custo;
    estoqueSementes[tipo]++;
    mensagem = "Comprou semente de " + tipo;
  } else {
    mensagem = "Dinheiro insuficiente!";
  }
}

function comprarFertilizante() {
  if (dinero >= 20) {
    dinero -= 20;
    fertilizantes++;
    mensagem = "Comprou Fertilizante";
  } else {
    mensagem = "Dinheiro insuficiente!";
  }
}

function desenharPlayer() {
  fill(255, 200, 150);
  rect(player.x - player.w/2, player.y - player.h, player.w, player.h, 5);
  fill(0, 0, 100);
  rect(player.x - player.w/2, player.y - 15, player.w, 15, 2);
}

function colisaoPlayer(obj) {
  return player.x > obj.x && player.x < obj.x + obj.w && 
         player.y > obj.y && player.y < obj.y + obj.h;
}
