/**
 * BIRTHDAY QUEST - FINAL STABLE VERSION
 */

let globalFlyScore = 0; 

// --- MUSIC LOGIC ---
function startQuest() {
    const music = document.getElementById('bg-music');
    
    // VOLUME CONTROL: 0.0 is silent, 1.0 is max.
    // Change 0.5 to adjust the loudness.
    music.volume = 0.5; 

    music.play().catch(err => console.log("Audio play blocked"));
    nextStage(2);
}

function toggleMute() {
    const music = document.getElementById('bg-music');
    const btn = document.getElementById('mute-btn');
    music.muted = !music.muted;
    btn.innerText = music.muted ? "🔇 OFF" : "🎵 ON";
}

// --- NAVIGATION & TRANSITION ---
function nextStage(lv) {
    document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
    
    document.querySelectorAll('.node').forEach((node, i) => {
        const nIdx = i + 1;
        node.classList.remove('active', 'done');
        if(nIdx === lv) node.classList.add('active');
        if(nIdx < lv) node.classList.add('done');
    });

    const currentStage = document.getElementById(`stage-${lv}`);
    currentStage.classList.add('active');

    if(lv === 2) initStage2();
    if(lv === 3) setupOverlay(3, () => initStage3());
    if(lv === 4) setupOverlay(4, () => initStage4());
    if(lv === 5) setupOverlay(5, () => initStage5());
    if(lv === 6) initStage6();
}

// Custom Messages for Manuraa
function showSuccessPopup(nextLv) {
    let message = "";
    switch(nextLv) {
        case 3: message = "You charged my heart perfectly Manuraa!"; break;
        case 4: message = "Great job Manuraa! You caught all my heart!"; break;
        case 5: message = "You fly so well Manuraa! Next game is waiting!"; break;
        case 6: message = "Well done Manuraa, you are my girl!"; break;
        default: message = "Congratulation Manuraa you finsihed this level as well";
    }

    const popup = document.createElement('div');
    popup.className = 'success-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <h2 class="pixel-text">✨ WOW! ✨</h2>
            <p>${message}</p>
            <button id="next-btn">TAP NEXT</button>
        </div>
    `;
    document.body.appendChild(popup);

    document.getElementById('next-btn').onclick = () => {
        popup.remove();
        nextStage(nextLv);
    };
}

// Start Overlay
function setupOverlay(stageId, callback) {
    const stage = document.getElementById(`stage-${stageId}`);
    const old = stage.querySelector('.tap-overlay-blur');
    if(old) old.remove();

    const overlay = document.createElement('div');
    overlay.className = 'tap-overlay-blur';
    overlay.innerHTML = '<div class="pixel-text bounce">TAP TO PLAY</div>';
    stage.appendChild(overlay);

    overlay.onclick = (e) => {
        e.stopPropagation();
        overlay.remove();
        callback();
    };
}

// --- STAGE 2: CHARGER ---
function initStage2() {
    let progress = 0; let timer;
    const heart = document.getElementById('charge-heart');
    const fill = document.getElementById('bar-fill');
    heart.onmousedown = heart.ontouchstart = (e) => {
        e.preventDefault();
        timer = setInterval(() => {
            progress += 2;
            fill.style.width = progress + '%';
            if(progress >= 100) { clearInterval(timer); showSuccessPopup(3); }
        }, 50);
    };
    window.onmouseup = window.ontouchend = () => clearInterval(timer);
}

// --- STAGE 3: CATCH GAME (Score Updated to 23) ---
function initStage3() {
    const canvas = document.getElementById('canvas-catch');
    const ctx = canvas.getContext('2d');
    canvas.width = 280; canvas.height = 300;
    let score = 0, basketX = 110, fallingHearts = [];

    const move = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        basketX = (x - rect.left) * (canvas.width / rect.width) - 30;
    };
    canvas.onpointermove = move;
    canvas.ontouchmove = (e) => { e.preventDefault(); move(e); };

    function loop() {
        if(!document.getElementById('stage-3').classList.contains('active')) return;
        ctx.clearRect(0, 0, 280, 300);
        ctx.fillStyle = "#ff4d6d"; 
        ctx.fillRect(basketX, 270, 60, 15);
        if(Math.random() < 0.05) fallingHearts.push({x: Math.random() * 250, y: 0});
        fallingHearts.forEach((h, i) => {
            h.y += 4;
            ctx.font = "24px Arial"; ctx.fillText("💖", h.x, h.y);
            if(h.y > 270 && h.x > basketX - 10 && h.x < basketX + 60) {
                fallingHearts.splice(i, 1); score++;
                document.getElementById('score-catch').innerText = score;
            }
        });
        if(score >= 23) showSuccessPopup(4); else requestAnimationFrame(loop);
    }
    loop();
}

// --- STAGE 4: FLAPPY HEART ---
function initStage4() {
    const c = document.getElementById('canvas-fly');
    const ctx = c.getContext('2d');
    c.width = 280; c.height = 300;
    let heartY = 150, velocity = 0, pipes = [], frame = 0, isGameOver = false;
    document.getElementById('score-fly').innerText = globalFlyScore;

    c.onpointerdown = (e) => { e.preventDefault(); velocity = -4.5; };

    function loop() {
        if(isGameOver || !document.getElementById('stage-4').classList.contains('active')) return;
        ctx.clearRect(0, 0, 280, 300);
        velocity += 0.25; heartY += velocity;
        if(frame % 90 === 0) pipes.push({x: 280, top: Math.random() * 100 + 50, passed: false});
        pipes.forEach((p, i) => {
            p.x -= 2;
            ctx.fillStyle = "#ffafcc"; ctx.fillRect(p.x, 0, 40, p.top); ctx.fillRect(p.x, p.top + 100, 40, 300);
            if (!p.passed && p.x < 40) { p.passed = true; globalFlyScore++; document.getElementById('score-fly').innerText = globalFlyScore; }
            if (40+20 > p.x && 40 < p.x+40 && (heartY < p.top || heartY > p.top+100)) isGameOver = true;
        });
        ctx.font = "24px Arial"; ctx.fillText("💖", 40, heartY);
        if (heartY > 300 || heartY < 0) isGameOver = true;
        
        if(globalFlyScore >= 5) {
            showSuccessPopup(5);
        } else if(isGameOver) {
            // FIX: Using the success-popup style for the "Try Again" screen
            const popup = document.createElement('div');
            popup.className = 'success-popup';
            popup.innerHTML = `
                <div class="popup-content">
                    <h2 class="pixel-text" style="font-size: 1.8rem;">Opps! 💖</h2>
                    <p>it's okay baby we can always try again</p>
                    <button id="f-retry">TRY AGAIN</button>
                </div>
            `;
            document.getElementById('stage-4').appendChild(popup);
            document.getElementById('f-retry').onclick = (e) => { 
                e.stopPropagation();
                popup.remove(); 
                globalFlyScore = 0; // Reset score
                initStage4(); 
            };
        } else { frame++; requestAnimationFrame(loop); }
    }
    loop();
}

// --- STAGE 5: SNAKE ---
function initStage5() {
    const c = document.getElementById('canvas-snake');
    const ctx = c.getContext('2d');
    c.width = 240; c.height = 240;
    let snake = [{x:5, y:5}], cake = {x:2, y:2}, dir = {x:1, y:0}, cakesEaten = 0;
    document.getElementById('v-pad').style.display = 'grid';
    window.setSnakeDir = (x, y) => { if (x !== -dir.x || y !== -dir.y) dir = {x, y}; };
    function loop() {
        if(!document.getElementById('stage-5').classList.contains('active')) return;
        let head = {x: (snake[0].x + dir.x + 12)%12, y: (snake[0].y + dir.y + 12)%12};
        snake.unshift(head);
        if(head.x === cake.x && head.y === cake.y) {
            cakesEaten++; document.getElementById('score-snake').innerText = cakesEaten;
            cake = {x: Math.floor(Math.random()*12), y: Math.floor(Math.random()*12)};
        } else snake.pop();
        ctx.clearRect(0, 0, 240, 240);
        ctx.fillStyle="#ff4d6d"; snake.forEach(s => ctx.fillRect(s.x*20, s.y*20, 18, 18));
        ctx.fillText("🎂", cake.x*20, cake.y*20+18);
        if(cakesEaten >= 5) { 
            document.getElementById('v-pad').style.display = 'none'; 
            showSuccessPopup(6); 
        } else setTimeout(loop, 200);
    }
    loop();
}

// --- STAGE 6: MATCH ---
function initStage6() {
    const grid = document.getElementById('memory-grid'); grid.innerHTML = '';
    const emojis = ['💖','🎁','🧁','💖','🎁','🧁'].sort(() => 0.5 - Math.random());
    let flipped = [];
    emojis.forEach(emoji => {
        const card = document.createElement('div'); card.className = 'card'; card.dataset.val = emoji;
        card.onclick = function() {
            if(flipped.length < 2 && !this.classList.contains('open')) {
                this.classList.add('open'); this.innerText = emoji; flipped.push(this);
                if(flipped.length === 2) {
                    if(flipped[0].dataset.val === flipped[1].dataset.val) flipped = [];
                    else setTimeout(() => { flipped.forEach(c => { c.classList.remove('open'); c.innerText = ''; }); flipped = []; }, 800);
                }
                if(document.querySelectorAll('.card.open').length === 6) {
                    setTimeout(() => nextStage(7), 800);
                }
            }
        };
        grid.appendChild(card);
    });
}

// --- STAGE 7: FINAL LETTER ---
function openFinalLetter() {
    document.getElementById('final-flap').style.transform = "rotateX(180deg)";
    setTimeout(() => {
        document.getElementById('letter-modal').style.display = 'flex';
        let charIndex = 0;
        let message = "Hey baby happy birthday .. I have nothing else to gift you ... but i gift you a honesty ... I will never lie to you ... I will never leave you... I will never stop loving you ... you are the only fish in my sea ... I love you forever ..in this life and many more to come ";
        const display = document.getElementById('typewriter');
        display.innerHTML = ""; 
        function type() { if(charIndex < message.length) { display.innerHTML += message.charAt(charIndex++); setTimeout(type, 50); } }
        type();
    }, 800);
}