let database = {};
const contentDiv = document.getElementById('rankingContent');
const btns = document.querySelectorAll('.nes-btn');
const btnVerMas = document.getElementById('btnVerMas');
const root = document.documentElement;

// Cargar JSON
fetch("./data.json")
    .then(res => res.json())
    .then(data => {
        database = data;
        loadGame("uno"); // Juego por defecto
    });

// --- FUNCIÓN PRINCIPAL ---
function loadGame(gameKey) {

    // Reset estado de botones
    btns.forEach(b => b.classList.remove('active'));
    document.querySelector(`.btn-${gameKey}`).classList.add('active');

    const game = database[gameKey];

    // Ordenamos por score (descendente)
    const players = [...game.players].sort((a, b) => b.score - a.score);

    // Cambiar color del tema
    root.style.setProperty('--theme-color', game.color);

    let html = "";

    // -------------------------
    //      PODIO 1, 2, 3
    // -------------------------
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

    // -------------------------
    //      LISTA 4 → N
    // -------------------------
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

    // Reset del botón Ver Más
    btnVerMas.style.display = "block";
    btnVerMas.innerText = "▼ VIEW MORE ▼";
}

// -------------------------
//   BOTÓN VER MÁS
// -------------------------
btnVerMas.addEventListener("click", () => {
    const hiddenItems = document.querySelectorAll(".hidden-item");
    hiddenItems.forEach(i => i.classList.remove("hidden-item"));
    btnVerMas.style.display = "none";
});
