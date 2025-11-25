let database = {};
const contentDiv = document.getElementById('rankingContent');
const btns = document.querySelectorAll('.nes-btn');
const btnVerMas = document.getElementById('btnVerMas');
const root = document.documentElement;

// Variable para guardar el ángulo actual de la ruleta
let currentRotation = 0;

// Cargar JSON
fetch("./data.json")
    .then(res => res.json())
    .then(data => {
        database = data;
        loadGame("uno"); // Juego por defecto
    });

// --- FUNCIÓN PRINCIPAL (RANKING) ---
function loadGame(gameKey) {
    // Reset estado de botones
    btns.forEach(b => b.classList.remove('active'));
    
    // Si existe el botón específico, actívalo (la ruleta no tiene btn-gameKey específico en CSS salvo manual)
    const activeBtn = document.querySelector(`.btn-${gameKey}`);
    if(activeBtn) activeBtn.classList.add('active');

    const game = database[gameKey];

    // Ordenamos por score (descendente)
    const players = [...game.players].sort((a, b) => b.score - a.score);

    // Cambiar color del tema
    root.style.setProperty('--theme-color', game.color);

    let html = "";

    // PODIO 1, 2, 3
    html += `
        <div class="podium">
            <div class="podium-card rank-2">
                <div class="rank-badge">#2</div>
                <img src="./img/img_jugador_${players[1].img}.png" class="pixel-avatar">
                <div class="p-name">${players[1].name}</div>
                <div class="p-score">${players[1].score} PTS</div>
            </div>
            <div class="podium-card rank-1">
                <div class="game-icon">${game.icon}</div>
                <div class="rank-badge" style="background:var(--gold); color:black">#1</div>
                <img src="./img/img_jugador_${players[0].img}.png" class="pixel-avatar">
                <div class="p-name">${players[0].name}</div>
                <div class="p-score">${players[0].score} PTS</div>
            </div>
            <div class="podium-card rank-3">
                <div class="rank-badge">#3</div>
                <img src="./img/img_jugador_${players[2].img}.png" class="pixel-avatar">
                <div class="p-name">${players[2].name}</div>
                <div class="p-score">${players[2].score} PTS</div>
            </div>
        </div>
    `;

    // LISTA 4 → N
    html += `<div class="list-view">`;
    for (let i = 3; i < players.length; i++) {
        const hiddenClass = i >= 6 ? "hidden-item" : "";
        html += `
            <div class="retro-row ${hiddenClass}">
                <div class="rank-num">${i + 1}</div>
                <img src="./img/img_jugador_${players[i].img}.png" class="list-avatar">
                <div class="list-info">
                    <div class="list-name">${players[i].name}</div>
                    <div class="list-score">${players[i].score} PUNTOS</div>
                </div>
            </div>
        `;
    }
    html += `</div>`;

    contentDiv.innerHTML = html;
    btnVerMas.style.display = "block";
    btnVerMas.innerText = "▼ VIEW MORE ▼";
    
    // Quitamos listener de ruleta del botón si existiera, para evitar conflictos visuales
    btnVerMas.onclick = () => {
        const hiddenItems = document.querySelectorAll(".hidden-item");
        hiddenItems.forEach(i => i.classList.remove("hidden-item"));
        btnVerMas.style.display = "none";
    };
}

// Dentro de games.js -> function loadRoulette()

function loadRoulette() {
    // ... (el código anterior de botones y estilos se mantiene igual) ...
    btns.forEach(b => b.classList.remove('active'));
    document.querySelector('.btn-roulette').classList.add('active');
    root.style.setProperty('--theme-color', '#ffffff');
    btnVerMas.style.display = "none";

    // --- AQUÍ ESTÁ EL CAMBIO: TEXTO EN LUGAR DE ICONOS ---
    contentDiv.innerHTML = `
        <div class="roulette-stage">
            <div class="wheel-container">
                <div class="pointer"></div>
                <div class="wheel" id="wheel">
                    <!-- Usamos las clases label-1, label-2, etc. definidas en CSS -->
                    <div class="wheel-label label-1">BOMBER<br>MAN</div>
                    <div class="wheel-label label-2">SMASH</div>
                    <div class="wheel-label label-3">UNO</div>
                    <div class="wheel-label label-4">VIRUS</div>
                </div>
            </div>
            
            <div id="winnerText" class="winner-text">
                ¿A QUÉ JUGAMOS HOY?
            </div>

            <button id="spinBtn" class="insert-coin-btn" style="margin-top:10px; font-size:1.2rem; border:4px solid #fff; background:#000;">
                ¡GIRAR!
            </button>
        </div>
    `;

    // Lógica del giro (Se mantiene igual)
    document.getElementById('spinBtn').onclick = spinWheel;
}

function spinWheel() {
    const wheel = document.getElementById('wheel');
    const resultDiv = document.getElementById('winnerText');
    const btn = document.getElementById('spinBtn');

    // Desactivar botón mientras gira
    btn.disabled = true;
    btn.innerText = "...";
    resultDiv.innerHTML = "GIRANDO...";

    // Calcular giro aleatorio
    // Mínimo 5 vueltas (360 * 5) + aleatorio (0 - 360)
    const randomDeg = Math.floor(Math.random() * 360);
    const spins = 360 * 5; 
    
    // Sumamos al ángulo actual para que siempre gire hacia adelante
    currentRotation += (spins + randomDeg);

    // Aplicar rotación CSS
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    // Esperar a que termine la transición (4 segundos según CSS)
    setTimeout(() => {
        calculateWinner(currentRotation);
        btn.disabled = false;
        btn.innerText = "GIRAR DE NUEVO";
    }, 4000);
}

function calculateWinner(totalDegrees) {
    // Normalizar el ángulo a 0-360
    const actualDeg = totalDegrees % 360;
    
    // IMPORTANTE: La flecha está arriba (0 grados).
    // Si la rueda gira en sentido horario, los grados aumentan.
    // Para saber qué segmento está en el 0, invertimos la lógica:
    // (360 - grados) nos da la posición virtual de la aguja en la rueda estática.
    
    const pointerPos = (360 - actualDeg) % 360;
    
    let winnerKey = "";
    let winnerName = "";
    let color = "";

    // Definición de segmentos (deben coincidir con el conic-gradient del CSS)
    // 0-90: Bomberman (Azul)
    // 90-180: Smash (Rojo)
    // 180-270: Uno (Amarillo)
    // 270-360: Virus (Verde)

    if (pointerPos >= 0 && pointerPos < 90) {
        winnerKey = "bomberman";
        winnerName = "BOMBERMAN";
        color = "#29adff";
    } else if (pointerPos >= 90 && pointerPos < 180) {
        winnerKey = "smash";
        winnerName = "SUPER SMASH";
        color = "#ff004d";
    } else if (pointerPos >= 180 && pointerPos < 270) {
        winnerKey = "uno";
        winnerName = "UNO";
        color = "#ffcc00";
    } else {
        winnerKey = "virus";
        winnerName = "VIRUS";
        color = "#00e436";
    }

    // Mostrar resultado
    const resultDiv = document.getElementById('winnerText');
    resultDiv.innerHTML = `
        EL JUEGO ES:<br>
        <span class="winner-span" style="color:${color}">${winnerName}</span>
        <button class="nes-btn" style="margin-top:10px; font-size:0.7rem;" onclick="loadGame('${winnerKey}')">
            VER RANKING ->
        </button>
    `;
    
    // Efecto visual: cambiar borde al color ganador
    root.style.setProperty('--theme-color', color);
}