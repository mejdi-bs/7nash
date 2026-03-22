// Snake Game - Made by Chahine!
// This is where all the game magic happens

// Get the canvas and drawing tools
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// =====================
// SOUND EFFECTS
// =====================
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
        case 'eat':
            // Happy beep sound
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;

        case 'gameOver':
            // Sad descending sound
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(100, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
            break;

        case 'start':
            // Rising happy sound
            oscillator.frequency.setValueAtTime(262, audioContext.currentTime); // C4
            oscillator.frequency.setValueAtTime(330, audioContext.currentTime + 0.1); // E4
            oscillator.frequency.setValueAtTime(392, audioContext.currentTime + 0.2); // G4
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime + 0.3); // C5
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
            break;

        case 'move':
            // Quick soft tick
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
            break;

        case 'bomb':
            // Explosion sound
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;

        case 'pineapple':
            // Bonus sparkling sound
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1108, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1318, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
    }
}

// =====================
// GAME SETUP
// =====================

// Game settings
const gridSize = 20;      // Size of each square
const tileCount = 35;     // Number of squares (35x35 = 700px)

// Game state
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop;
let gameSpeed = 150; // Default speed

// Update high score display
document.getElementById('highScore').textContent = highScore;

// Tutorial - show only first time
const tutorialSeen = localStorage.getItem('snakeTutorialSeen');
if (!tutorialSeen) {
    document.getElementById('tutorial').classList.remove('hidden');
}

document.getElementById('startTutorial').addEventListener('click', () => {
    document.getElementById('tutorial').classList.add('hidden');
    localStorage.setItem('snakeTutorialSeen', 'true');
});

// Snake - starts in the middle
let snake = [
    { x: 10, y: 10 },  // Head
    { x: 9, y: 10 },   // Body
    { x: 8, y: 10 }    // Tail
];

// Food position
let food = { x: 15, y: 15 };

// Bomb position (hazard)
let bomb = null;
let bombTimer = 0;

// Pineapple position (bonus)
let pineapple = null;
let pineappleTimer = 0;

// Direction the snake is moving
let dx = 1;  // Moving right
let dy = 0;  // Not moving up/down

// Next direction (to prevent quick direction changes)
let nextDx = 1;
let nextDy = 0;

// =====================
// GAME FUNCTIONS
// =====================

// Draw everything on the canvas
function draw() {
    // Clear the canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines (subtle)
    ctx.strokeStyle = 'rgba(78, 204, 163, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Draw food (apple)
    drawFood();

    // Draw bomb (hazard)
    drawBomb();

    // Draw pineapple (bonus)
    drawPineapple();

    // Draw snake
    drawSnake();
}

// Draw the snake
function drawSnake() {
    snake.forEach((segment, index) => {
        // Head is different color
        if (index === 0) {
            ctx.fillStyle = '#4ecca3';
            ctx.shadowColor = '#4ecca3';
            ctx.shadowBlur = 10;
        } else {
            // Gradient from head to tail
            const greenValue = Math.max(100, 204 - (index * 5));
            ctx.fillStyle = `rgb(78, ${greenValue}, 163)`;
            ctx.shadowBlur = 0;
        }

        // Draw rounded rectangle for each segment
        const padding = 1;
        ctx.beginPath();
        ctx.roundRect(
            segment.x * gridSize + padding,
            segment.y * gridSize + padding,
            gridSize - padding * 2,
            gridSize - padding * 2,
            5
        );
        ctx.fill();

        // Draw eyes on the head
        if (index === 0) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#1a1a2e';

            // Position eyes based on direction
            let eye1X, eye1Y, eye2X, eye2Y;

            if (dx === 1) { // Moving right
                eye1X = segment.x * gridSize + 13;
                eye1Y = segment.y * gridSize + 6;
                eye2X = segment.x * gridSize + 13;
                eye2Y = segment.y * gridSize + 13;
            } else if (dx === -1) { // Moving left
                eye1X = segment.x * gridSize + 6;
                eye1Y = segment.y * gridSize + 6;
                eye2X = segment.x * gridSize + 6;
                eye2Y = segment.y * gridSize + 13;
            } else if (dy === -1) { // Moving up
                eye1X = segment.x * gridSize + 6;
                eye1Y = segment.y * gridSize + 6;
                eye2X = segment.x * gridSize + 13;
                eye2Y = segment.y * gridSize + 6;
            } else { // Moving down
                eye1X = segment.x * gridSize + 6;
                eye1Y = segment.y * gridSize + 13;
                eye2X = segment.x * gridSize + 13;
                eye2Y = segment.y * gridSize + 13;
            }

            ctx.beginPath();
            ctx.arc(eye1X, eye1Y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eye2X, eye2Y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// Draw the food (apple)
function drawFood() {
    const centerX = food.x * gridSize + gridSize / 2;
    const centerY = food.y * gridSize + gridSize / 2;

    // Glow effect
    ctx.shadowColor = '#e94560';
    ctx.shadowBlur = 15;

    // Apple body
    ctx.fillStyle = '#e94560';
    ctx.beginPath();
    ctx.arc(centerX, centerY + 2, 7, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#4ecca3';
    ctx.fillRect(centerX - 1, centerY - 8, 2, 5);

    // Leaf
    ctx.beginPath();
    ctx.ellipse(centerX + 4, centerY - 5, 3, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
}

// Draw the bomb (hazard)
function drawBomb() {
    if (!bomb) return;

    const centerX = bomb.x * gridSize + gridSize / 2;
    const centerY = bomb.y * gridSize + gridSize / 2;

    // Pulsing glow effect
    const pulse = Math.sin(Date.now() / 150) * 3 + 12;
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = pulse;

    // Bomb body (dark circle)
    ctx.fillStyle = '#2d2d2d';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.arc(centerX - 2, centerY - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Fuse
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 8);
    ctx.quadraticCurveTo(centerX + 5, centerY - 12, centerX + 3, centerY - 15);
    ctx.stroke();

    // Spark (animated)
    const sparkVisible = Math.sin(Date.now() / 100) > 0;
    if (sparkVisible) {
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(centerX + 3, centerY - 15, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw the pineapple (bonus)
function drawPineapple() {
    if (!pineapple) return;

    const centerX = pineapple.x * gridSize + gridSize / 2;
    const centerY = pineapple.y * gridSize + gridSize / 2;

    // Golden glow
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 15;

    // Pineapple body (oval)
    ctx.fillStyle = '#f4a020';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 2, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pattern on body
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#c67b00';
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            ctx.beginPath();
            ctx.arc(centerX + i * 3, centerY + 2 + j * 3, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Crown leaves
    ctx.fillStyle = '#228b22';
    for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX + i * 2, centerY - 6);
        ctx.lineTo(centerX + i * 2 + (i > 0 ? 2 : -2), centerY - 12);
        ctx.lineTo(centerX + i * 2 - (i > 0 ? 2 : -2), centerY - 12);
        ctx.closePath();
        ctx.fill();
    }
}

// Move the snake
function moveSnake() {
    // Update direction
    dx = nextDx;
    dy = nextDy;

    // Create new head position
    const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };

    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Check self collision (skip the tail since it will move)
    for (let i = 0; i < snake.length - 1; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    // Check bomb collision
    if (bomb && head.x === bomb.x && head.y === bomb.y) {
        shakeScreen();
        playSound('bomb');
        gameOver();
        return;
    }

    // Check pineapple collision (bonus points!)
    if (pineapple && head.x === pineapple.x && head.y === pineapple.y) {
        score += 5; // Bonus points
        document.getElementById('score').textContent = score;
        playSound('pineapple');
        showFloatingScore('+5', '#ffd700');
        clearTimeout(pineappleTimer);
        pineapple = null;

        // Update high score
        if (score > highScore) {
            highScore = score;
            document.getElementById('highScore').textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
    }

    // Add new head
    snake.unshift(head);

    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score += 1;
        document.getElementById('score').textContent = score;
        playSound('eat');

        // Update high score
        if (score > highScore) {
            highScore = score;
            document.getElementById('highScore').textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }

        // Add floating score
        showFloatingScore();

        // Spawn new food
        spawnFood();

        // Random chance to spawn bomb (20% chance after eating)
        if (!bomb && Math.random() < 0.2) {
            spawnBomb();
        }

        // Random chance to spawn pineapple (10% chance after eating)
        if (!pineapple && Math.random() < 0.1) {
            spawnPineapple();
        }
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

// Spawn food in random position
function spawnFood() {
    let validPosition = false;

    while (!validPosition) {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        // Make sure food doesn't spawn on snake
        validPosition = !snake.some(segment =>
            segment.x === food.x && segment.y === food.y
        );
    }
}

// Spawn bomb in random position
function spawnBomb() {
    let validPosition = false;

    while (!validPosition) {
        const newBomb = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        // Make sure bomb doesn't spawn on snake, food, or existing bomb
        const onSnake = snake.some(segment =>
            segment.x === newBomb.x && segment.y === newBomb.y
        );
        const onFood = newBomb.x === food.x && newBomb.y === food.y;

        validPosition = !onSnake && !onFood;

        if (validPosition) {
            bomb = newBomb;
            // Bomb disappears after 5-10 seconds
            bombTimer = setTimeout(() => {
                bomb = null;
            }, 5000 + Math.random() * 5000);
        }
    }
}

// Spawn pineapple in random position (bonus)
function spawnPineapple() {
    let validPosition = false;

    while (!validPosition) {
        const newPineapple = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        // Make sure pineapple doesn't spawn on snake, food, or bomb
        const onSnake = snake.some(segment =>
            segment.x === newPineapple.x && segment.y === newPineapple.y
        );
        const onFood = newPineapple.x === food.x && newPineapple.y === food.y;
        const onBomb = bomb && newPineapple.x === bomb.x && newPineapple.y === bomb.y;

        validPosition = !onSnake && !onFood && !onBomb;

        if (validPosition) {
            pineapple = newPineapple;
            // Pineapple disappears after 3-6 seconds
            pineappleTimer = setTimeout(() => {
                pineapple = null;
            }, 3000 + Math.random() * 3000);
        }
    }
}

// Main game update function
function update() {
    if (!gamePaused) {
        moveSnake();
        draw();
    }
}

// Game over
function gameOver() {
    shakeScreen();
    gameRunning = false;
    clearInterval(gameLoop);
    playSound('gameOver');

    // Create game over screen
    const overlay = document.createElement('div');
    overlay.className = 'game-over';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2><i data-lucide="frown"></i> Game Over!</h2>
            <p>Your Score: ${score}</p>
            <p>Best Score: ${highScore}</p>
            <button onclick="restartGame()"><i data-lucide="refresh-cw"></i> Play Again</button>
        </div>
    `;
    document.body.appendChild(overlay);
    lucide.createIcons();
}

// Restart the game
function restartGame() {
    // Remove game over screen
    const overlay = document.querySelector('.game-over');
    if (overlay) {
        overlay.remove();
    }

    // Reset game state
    resetGame();
    startGame();
}

// Reset the game
function resetGame() {
    // Clear bomb
    if (bombTimer) {
        clearTimeout(bombTimer);
    }
    bomb = null;

    // Clear pineapple
    if (pineappleTimer) {
        clearTimeout(pineappleTimer);
    }
    pineapple = null;

    // Reset snake to starting position
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    // Reset direction
    dx = 1;
    dy = 0;
    nextDx = 1;
    nextDy = 0;

    // Reset score
    score = 0;
    document.getElementById('score').textContent = score;

    // Spawn new food
    spawnFood();

    // Draw initial state
    draw();
}

// Start the game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        gameLoop = setInterval(update, gameSpeed); // Use dynamic game speed
        document.getElementById('startBtn').innerHTML = '<i data-lucide="gamepad-2"></i> Playing...';
        lucide.createIcons();
        playSound('start');
    }
}

// Pause/Resume the game
function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        document.getElementById('pauseBtn').innerHTML =
            gamePaused ? '<i data-lucide="play"></i> Resume' : '<i data-lucide="pause"></i> Pause';
        lucide.createIcons();
    }
}

// =====================
// CONTROLS
// =====================

// Keyboard controls (ZQSD keys)
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    // Start game on any control key if not running
    if (!gameRunning && ['z', 'q', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        startGame();
    }

    // Change direction (can't go backwards)
    // Z = Up, Q = Left, S = Down, D = Right
    switch (key) {
        case 'z':
        case 'arrowup':
            if (dy !== 1) { // Can't go up if going down
                nextDx = 0;
                nextDy = -1;
            }
            break;
        case 's':
        case 'arrowdown':
            if (dy !== -1) { // Can't go down if going up
                nextDx = 0;
                nextDy = 1;
            }
            break;
        case 'q':
        case 'arrowleft':
            if (dx !== 1) { // Can't go left if going right
                nextDx = -1;
                nextDy = 0;
            }
            break;
        case 'd':
        case 'arrowright':
            if (dx !== -1) { // Can't go right if going left
                nextDx = 1;
                nextDy = 0;
            }
            break;
        case ' ':
            e.preventDefault();
            togglePause();
            break;
    }
});

// Button controls
document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameRunning) {
        resetGame();
        startGame();
    }
});

document.getElementById('pauseBtn').addEventListener('click', togglePause);

// Mobile button controls
document.getElementById('upBtn').addEventListener('click', () => {
    if (!gameRunning) startGame();
    if (dy !== 1) { nextDx = 0; nextDy = -1; }
});

document.getElementById('downBtn').addEventListener('click', () => {
    if (!gameRunning) startGame();
    if (dy !== -1) { nextDx = 0; nextDy = 1; }
});

document.getElementById('leftBtn').addEventListener('click', () => {
    if (!gameRunning) startGame();
    if (dx !== 1) { nextDx = -1; nextDy = 0; }
});

document.getElementById('rightBtn').addEventListener('click', () => {
    if (!gameRunning) startGame();
    if (dx !== -1) { nextDx = 1; nextDy = 0; }
});

// Swipe controls for mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    if (!gameRunning) startGame();
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Detect swipe direction (need minimum 30px swipe)
    if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (diffX > 0 && dx !== -1) {
                // Swipe right
                nextDx = 1;
                nextDy = 0;
            } else if (diffX < 0 && dx !== 1) {
                // Swipe left
                nextDx = -1;
                nextDy = 0;
            }
        } else {
            // Vertical swipe
            if (diffY > 0 && dy !== -1) {
                // Swipe down
                nextDx = 0;
                nextDy = 1;
            } else if (diffY < 0 && dy !== 1) {
                // Swipe up
                nextDx = 0;
                nextDy = -1;
            }
        }
    }

    touchStartX = 0;
    touchStartY = 0;
}, { passive: true });

// Prevent scrolling when touching the game
document.body.addEventListener('touchmove', (e) => {
    if (e.target === canvas) {
        e.preventDefault();
    }
}, { passive: false });

// Difficulty Selection
document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (!gameRunning) {
            // Update active state
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Set new speed
            gameSpeed = parseInt(btn.dataset.speed);
        }
    });
});

// Screen Shake Effect
function shakeScreen() {
    const container = document.querySelector('.game-container');
    container.classList.add('shake');
    setTimeout(() => {
        container.classList.remove('shake');
    }, 500);
}

// Floating Score Effect
function showFloatingScore(text = '+1', color = '#4ecca3') {
    const scoreText = document.createElement('div');
    scoreText.className = 'floating-score';
    scoreText.textContent = text;
    scoreText.style.color = color;

    // Position it near the snake head on the canvas
    const rect = canvas.getBoundingClientRect();
    const x = rect.left + snake[0].x * gridSize + (rect.width / tileCount) / 2;
    const y = rect.top + snake[0].y * gridSize;

    scoreText.style.left = `${x}px`;
    scoreText.style.top = `${y}px`;

    document.body.appendChild(scoreText);

    // Remove after animation
    setTimeout(() => {
        scoreText.remove();
    }, 800);
}

// Draw initial state
draw();

// Log welcome message
console.log('🐍 Welcome to Chahine\'s Snake Game!');
console.log('Use arrow keys to play. Have fun!');
