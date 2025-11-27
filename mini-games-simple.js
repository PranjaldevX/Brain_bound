/**
 * Simple Mini-Games System
 * Working mini-games for BrainBound
 * Performance Optimized
 */

const SimpleMiniGames = {
    currentGame: null,
    score: 0,
    
    // Performance optimization: Cache DOM elements
    _cache: {},
    
    // Performance optimization: Debounce function
    _debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Performance optimization: Request Animation Frame wrapper
    _raf(callback) {
        if (window.requestAnimationFrame) {
            return window.requestAnimationFrame(callback);
        }
        return setTimeout(callback, 16);
    },
    
    // Phase 3: Confetti Effect
    _createConfetti(count = 50) {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);
        
        const colors = ['#667eea', '#764ba2', '#F39C12', '#10B981', '#EF4444', '#EC4899'];
        
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(confetti);
        }
        
        setTimeout(() => container.remove(), 4000);
    },
    
    // Phase 3: Sparkle Effect
    _createSparkles(element, count = 20) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = centerX + 'px';
            sparkle.style.top = centerY + 'px';
            
            const angle = (Math.PI * 2 * i) / count;
            const distance = 50 + Math.random() * 50;
            sparkle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            sparkle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
            
            document.body.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1500);
        }
    },
    
    // Phase 3: Coin Rain Effect
    _createCoinRain(count = 30) {
        const coins = ['💰', '🪙', '💎', '⭐'];
        
        for (let i = 0; i < count; i++) {
            const coin = document.createElement('div');
            coin.className = 'coin';
            coin.textContent = coins[Math.floor(Math.random() * coins.length)];
            coin.style.left = Math.random() * 100 + '%';
            coin.style.animationDelay = Math.random() * 0.5 + 's';
            coin.style.animationDuration = (Math.random() * 1 + 1.5) + 's';
            document.body.appendChild(coin);
            
            setTimeout(() => coin.remove(), 3000);
        }
    },
    
    /**
     * Show Mini-Games Menu
     */
    showMenu() {
        // Create mini-games screen if not exists
        let miniGamesScreen = document.getElementById('miniGamesScreen');
        
        if (!miniGamesScreen) {
            miniGamesScreen = document.createElement('div');
            miniGamesScreen.id = 'miniGamesScreen';
            miniGamesScreen.className = 'screen';
            miniGamesScreen.innerHTML = `
                <button class="back-button" onclick="SimpleMiniGames.closeMenu()">← Back</button>
                <div style="padding: 40px; text-align: center;">
                    <h2 style="color: #667eea; margin-bottom: 30px;">🎮 Mini-Games</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; max-width: 1000px; margin: 0 auto;">
                        
                        <!-- Memory Match -->
                        <div class="mini-game-card" onclick="SimpleMiniGames.startMemoryMatch()">
                            <div style="font-size: 60px; margin-bottom: 15px;">🧠</div>
                            <h3>Memory Match</h3>
                            <p>Find matching pairs of cards!</p>
                        </div>
                        
                        <!-- Color Match -->
                        <div class="mini-game-card" onclick="SimpleMiniGames.startColorMatch()">
                            <div style="font-size: 60px; margin-bottom: 15px;">🎨</div>
                            <h3>Color Match</h3>
                            <p>Match the colors quickly!</p>
                        </div>
                        
                        <!-- Number Quiz -->
                        <div class="mini-game-card" onclick="window.location.href='number-quiz.html'"> Back to Number Quiz
                            <div style="font-size: 60px; margin-bottom: 15px;">🔢</div>
                            <h3>Number Quiz</h3>
                            <p>Solve simple math problems!</p>
                        </div>
                        
                        <!-- Shape Finder -->
                        <div class="mini-game-card" onclick="SimpleMiniGames.startShapeFinder()">
                            <div style="font-size: 60px; margin-bottom: 15px;">⭐</div>
                            <h3>Shape Finder</h3>
                            <p>Find the matching shapes!</p>
                        </div>
                        
                        <!-- Spin Wheel -->
                        <div class="mini-game-card" onclick="SimpleMiniGames.startSpinWheel()">
                            <div style="font-size: 60px; margin-bottom: 15px;">🎡</div>
                            <h3>Spin Wheel</h3>
                            <p>Spin to win prizes!</p>
                        </div>
                        
                        <!-- Lucky Draw -->
                        <div class="mini-game-card" onclick="SimpleMiniGames.startLuckyDraw()">
                            <div style="font-size: 60px; margin-bottom: 15px;">🎰</div>
                            <h3>Lucky Draw</h3>
                            <p>Try your luck!</p>
                        </div>
                        
                    </div>
                </div>
            `;
            document.querySelector('.game-container').appendChild(miniGamesScreen);
        }
        
        // Show screen
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        miniGamesScreen.classList.add('active');
        console.log('🎮 Mini-Games Menu opened');
    },
    
    closeMenu() {
        if (typeof showMainMenu === 'function') {
            showMainMenu();
        }
    },
    
    /**
     * Memory Match Game with 10 Levels
     */
    startMemoryMatch(level = 1) {
        // Define emoji sets for each level (increasing difficulty)
        const levelEmojis = {
            1: ['🐶', '🐱', '🐭', '🐹'],           // 4 pairs - Easy
            2: ['🐰', '🦊', '🐻', '🐼', '🐨'],    // 5 pairs
            3: ['🦁', '🐯', '🐮', '🐷', '🐸', '🐵'], // 6 pairs
            4: ['🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉'], // 7 pairs
            5: ['🦋', '🐛', '🐝', '🐞', '🦗', '🕷️', '🦂', '🐜'], // 8 pairs
            6: ['🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞'], // 9 pairs
            7: ['🐠', '🐟', '🐡', '🦈', '🐳', '🐋', '🐬', '🦭', '🦦', '🐊'], // 10 pairs
            8: ['🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌼', '🌵', '🌴', '🌲', '🌳'], // 11 pairs
            9: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍'], // 12 pairs
            10: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🥏'] // 13 pairs - Hard
        };
        
        const emojis = levelEmojis[level] || levelEmojis[1];
        const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
        const gridCols = level <= 3 ? 4 : level <= 6 ? 5 : 6;
        
        const gameHTML = `
            <div style="padding: 20px; text-align: center;">
                <button class="back-button" onclick="window.location.href='mini-games.html'">← Back to Mini-Games</button>
                <h2>🧠 Memory Match - Level ${level}/10</h2>
                <p>Find all matching pairs!</p>
                <div style="display: flex; justify-content: center; gap: 20px; margin: 20px 0;">
                    <div id="memoryScore" style="font-size: 20px;">Matches: 0/${emojis.length}</div>
                    <div style="font-size: 20px; color: #667eea;">⭐ Level ${level}</div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(${gridCols}, 100px); gap: 10px; justify-content: center; margin-top: 20px; perspective: 1000px;">
                    ${cards.map((emoji, i) => `
                        <div class="memory-card-container" data-index="${i}" data-emoji="${emoji}" onclick="SimpleMiniGames.flipCard(this)">
                            <div class="memory-card-inner">
                                <div class="memory-card-front">❓</div>
                                <div class="memory-card-back">${emoji}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.showGameScreen(gameHTML);
        this.currentGame = { type: 'memory', flipped: [], matched: 0, total: emojis.length, level: level };
    },
    
    flipCard(card) {
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
        
        const game = this.currentGame;
        if (game.flipped.length >= 2) return;
        
        // Add flip animation
        card.classList.add('flipped');
        const inner = card.querySelector('.memory-card-inner');
        inner.style.transform = 'rotateY(180deg)';
        
        game.flipped.push(card);
        
        if (game.flipped.length === 2) {
            const [card1, card2] = game.flipped;
            const emoji1 = card1.dataset.emoji;
            const emoji2 = card2.dataset.emoji;
            
            setTimeout(() => {
                if (emoji1 === emoji2) {
                    // Matched! Add success animation
                    card1.classList.add('matched');
                    card2.classList.add('matched');
                    card1.style.animation = 'matchSuccess 0.6s ease-out';
                    card2.style.animation = 'matchSuccess 0.6s ease-out';
                    
                    game.matched++;
                    document.getElementById('memoryScore').textContent = `Matches: ${game.matched}/${game.total}`;
                    
                    // Check if level complete
                    if (game.matched === game.total) {
                        setTimeout(() => {
                            const currentLevel = game.level || 1;
                            if (currentLevel < 10) {
                                // Show level complete popup
                                this.showPopup(
                                    '🎉 Level Complete!',
                                    `Amazing! You completed Level ${currentLevel}!\nReady for Level ${currentLevel + 1}?`,
                                    'success',
                                    [
                                        { text: 'Next Level →', onClick: () => { this.closePopup(); this.startMemoryMatch(currentLevel + 1); } },
                                        { text: 'Menu', onClick: () => { this.closePopup(); this.showMenu(); } }
                                    ]
                                );
                            } else {
                                // All levels complete!
                                this.showPopup(
                                    '🏆 All Levels Complete!',
                                    'Congratulations! You completed all 10 levels of Memory Match!\nYou are a Memory Master! 🧠',
                                    'success',
                                    [
                                        { text: 'Play Again', onClick: () => { this.closePopup(); this.startMemoryMatch(1); } },
                                        { text: 'Menu', onClick: () => { this.closePopup(); this.showMenu(); } }
                                    ]
                                );
                            }
                        }, 500);
                    }
                } else {
                    // Not matched - flip back
                    setTimeout(() => {
                        card1.classList.remove('flipped');
                        card2.classList.remove('flipped');
                        card1.querySelector('.memory-card-inner').style.transform = 'rotateY(0deg)';
                        card2.querySelector('.memory-card-inner').style.transform = 'rotateY(0deg)';
                    }, 400);
                }
                game.flipped = [];
            }, 800);
        }
    },
    
    /**
     * Color Match Game - Adaptive Difficulty
     */
    startColorMatch() {
        // Initialize difficulty tracking
        if (!this.colorDifficulty) {
            this.colorDifficulty = {
                level: 1, // 1=Easy, 2=Medium, 3=Hard, 4=Expert, 5=Master
                correctStreak: 0,
                wrongStreak: 0,
                score: 0,
                timeLimit: 0
            };
        }
        
        const difficulty = this.colorDifficulty;
        const allColors = [
            '🔴', '🟢', '🔵', '🟡', '🟣', '🟠',
            '🟤', '⚫', '⚪', '🔶', '🔷', '🔸',
            '🔹', '🟥', '🟩', '🟦', '🟪', '🟧',
            '🟨', '⬛', '⬜', '🔺', '🔻'
        ];
        
        let displayColors, targetColor, gridCols, timeLimit;
        
        // Difficulty-based configuration
        if (difficulty.level === 1) {
            // Easy: 6 very different colors, no time limit
            const easyColors = ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠'];
            const shuffled = [...easyColors].sort(() => Math.random() - 0.5);
            targetColor = shuffled[0];
            displayColors = shuffled;
            gridCols = 3;
            timeLimit = 0;
        } else if (difficulty.level === 2) {
            // Medium: 9 colors, 15 seconds
            const shuffled = [...allColors].sort(() => Math.random() - 0.5);
            targetColor = shuffled[0];
            displayColors = shuffled.slice(0, 9);
            gridCols = 3;
            timeLimit = 15;
        } else if (difficulty.level === 3) {
            // Hard: 12 colors with similar ones, 12 seconds
            const shuffled = [...allColors].sort(() => Math.random() - 0.5);
            targetColor = shuffled[0];
            displayColors = shuffled.slice(0, 12);
            gridCols = 4;
            timeLimit = 12;
        } else if (difficulty.level === 4) {
            // Expert: 16 colors, 10 seconds
            const shuffled = [...allColors].sort(() => Math.random() - 0.5);
            targetColor = shuffled[0];
            displayColors = shuffled.slice(0, 16);
            gridCols = 4;
            timeLimit = 10;
        } else {
            // Master: 20 colors, 8 seconds, multiple targets!
            const shuffled = [...allColors].sort(() => Math.random() - 0.5);
            targetColor = shuffled[0];
            displayColors = shuffled.slice(0, 20);
            gridCols = 5;
            timeLimit = 8;
        }
        
        const difficultyNames = ['Easy', 'Medium', 'Hard', 'Expert', 'Master'];
        const difficultyColors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        
        const gameHTML = `
            <div style="padding: 40px; text-align: center;">
                <button class="back-button" onclick="window.location.href='mini-games.html'">← Back to Mini-Games</button>
                <h2>🎨 Color Match</h2>
                <div style="display: flex; justify-content: center; gap: 20px; margin: 20px 0;">
                    <div style="font-size: 18px; color: ${difficultyColors[difficulty.level - 1]}; font-weight: 600;">
                        ${difficultyNames[difficulty.level - 1]} Mode
                    </div>
                    <div style="font-size: 18px; color: #10B981;">
                        Score: ${difficulty.score}
                    </div>
                    ${timeLimit > 0 ? `<div id="colorTimer" style="font-size: 18px; color: #EF4444; font-weight: 600;">⏱️ ${timeLimit}s</div>` : ''}
                </div>
                <p>Click the matching color${difficulty.level >= 5 ? 's' : ''}!</p>
                <div style="font-size: 80px; margin: 30px 0;">Target: ${targetColor}</div>
                <div style="display: grid; grid-template-columns: repeat(${gridCols}, 90px); gap: 12px; justify-content: center;">
                    ${displayColors.map(color => `
                        <button onclick="SimpleMiniGames.checkColorMatch('${color}', '${targetColor}')" 
                                class="color-match-btn"
                                style="font-size: 50px; padding: 15px; border: 3px solid #ddd; border-radius: 15px; background: white; cursor: pointer; transition: all 0.3s;">
                            ${color}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.showGameScreen(gameHTML);
        
        // Start timer if time limit exists
        if (timeLimit > 0) {
            this.startColorTimer(timeLimit, targetColor);
        }
    },
    
    /**
     * Timer for Color Match
     */
    startColorTimer(seconds, correctColor) {
        const timerEl = document.getElementById('colorTimer');
        if (!timerEl) return;
        
        let timeLeft = seconds;
        this.colorTimer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = `⏱️ ${timeLeft}s`;
            
            if (timeLeft <= 3) {
                timerEl.style.color = '#EF4444';
                timerEl.style.animation = 'pulse 0.5s infinite';
            }
            
            if (timeLeft <= 0) {
                clearInterval(this.colorTimer);
                this.checkColorMatch('timeout', correctColor);
            }
        }, 1000);
    },
    
    checkColorMatch(selected, target) {
        // Clear timer if exists
        if (this.colorTimer) {
            clearInterval(this.colorTimer);
        }
        
        const difficulty = this.colorDifficulty;
        
        if (selected === 'timeout') {
            // Time ran out
            difficulty.wrongStreak++;
            difficulty.correctStreak = 0;
            
            if (difficulty.wrongStreak >= 2 && difficulty.level > 1) {
                difficulty.level--;
                difficulty.wrongStreak = 0;
                this.showPopup(
                    '⏰ Time\'s Up!',
                    `Too slow! Let's try an easier level.\nDifficulty: Level ${difficulty.level}`,
                    'warning'
                );
                setTimeout(() => {
                    this.closePopup();
                    this.startColorMatch();
                }, 2000);
            } else {
                this.showPopup('⏰ Time\'s Up!', `The correct color was ${target}.\nBe faster next time!`, 'error');
                setTimeout(() => {
                    this.closePopup();
                    this.startColorMatch();
                }, 2000);
            }
            return;
        }
        
        if (selected === target) {
            // Correct!
            difficulty.correctStreak++;
            difficulty.wrongStreak = 0;
            difficulty.score += difficulty.level * 10;
            
            // Disable all buttons
            document.querySelectorAll('.color-match-btn').forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            });
            
            // Level up after 3 correct
            if (difficulty.correctStreak >= 3 && difficulty.level < 5) {
                difficulty.level++;
                difficulty.correctStreak = 0;
                this.showPopup(
                    '🎉 Level Up!',
                    `Excellent! You're mastering colors!\nDifficulty: Level ${difficulty.level}\nScore: ${difficulty.score}`,
                    'success'
                );
                setTimeout(() => {
                    this.closePopup();
                    this.startColorMatch();
                }, 2000);
            } else {
                this.showPopup('✅ Correct!', `Perfect match! +${difficulty.level * 10} points\nScore: ${difficulty.score}`, 'success');
                setTimeout(() => {
                    this.closePopup();
                    this.startColorMatch();
                }, 1500);
            }
        } else {
            // Wrong!
            difficulty.wrongStreak++;
            difficulty.correctStreak = 0;
            
            // Level down after 2 wrong
            if (difficulty.wrongStreak >= 2 && difficulty.level > 1) {
                difficulty.level--;
                difficulty.wrongStreak = 0;
                this.showPopup(
                    '💡 Difficulty Adjusted',
                    `Let's slow down a bit.\nDifficulty: Level ${difficulty.level}`,
                    'info'
                );
                setTimeout(() => {
                    this.closePopup();
                    this.startColorMatch();
                }, 2000);
            } else {
                this.showPopup('❌ Wrong Color', `The correct color was ${target}.\nTry again!`, 'error');
                setTimeout(() => {
                    this.closePopup();
                    this.startColorMatch();
                }, 2000);
            }
        }
    },
    
    /**
     * Number Quiz - Category Selection
     */
    startNumberQuiz() {
        const gameHTML = `
            <div style="padding: 40px; text-align: center;">
                <button class="back-button" onclick="window.location.href='mini-games.html'">← Back</button>
                <h2>🔢 Number Quiz</h2>
                <p>Choose your challenge category!</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; max-width: 900px; margin: 40px auto;">
                    <!-- Arithmetic Category -->
                    <div class="quiz-category-card" onclick="SimpleMiniGames.startArithmeticQuiz()" style="padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <div style="font-size: 60px; margin-bottom: 15px;">➕</div>
                        <h3 style="color: white; margin-bottom: 10px;">Arithmetic</h3>
                        <p style="color: rgba(255,255,255,0.9); font-size: 14px;">+, -, ×, ÷ operations<br>From basic to complex</p>
                    </div>
                    
                    <!-- Algebra Category -->
                    <div class="quiz-category-card" onclick="SimpleMiniGames.startAlgebraQuiz()" style="padding: 30px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 20px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <div style="font-size: 60px; margin-bottom: 15px;">📐</div>
                        <h3 style="color: white; margin-bottom: 10px;">Algebra</h3>
                        <p style="color: rgba(255,255,255,0.9); font-size: 14px;">Equations & polynomials<br>2nd & 3rd degree</p>
                    </div>
                    
                    <!-- Geometry Category -->
                    <div class="quiz-category-card" onclick="SimpleMiniGames.startGeometryQuiz()" style="padding: 30px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 20px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <div style="font-size: 60px; margin-bottom: 15px;">📏</div>
                        <h3 style="color: white; margin-bottom: 10px;">Geometry</h3>
                        <p style="color: rgba(255,255,255,0.9); font-size: 14px;">Shapes & angles<br>Area, perimeter & more</p>
                    </div>
                </div>
            </div>
        `;
        
        this.showGameScreen(gameHTML);
    },
    
    /**
     * Arithmetic Quiz - AI Adaptive Difficulty
     */
    startArithmeticQuiz() {
        // Initialize difficulty tracking if not exists
        if (!this.quizDifficulty) {
            this.quizDifficulty = {
                level: 1, // 1=Easy, 2=Medium, 3=Hard, 4=Expert, 5=Master
                correctStreak: 0,
                wrongStreak: 0
            };
        }
        
        const difficulty = this.quizDifficulty;
        let question, answer, options;
        
        // Generate question based on difficulty level
        if (difficulty.level === 1) {
            // Level 1: Simple addition (1-10)
            const num1 = Math.floor(Math.random() * 10) + 1;
            const num2 = Math.floor(Math.random() * 10) + 1;
            question = `${num1} + ${num2}`;
            answer = num1 + num2;
        } else if (difficulty.level === 2) {
            // Level 2: Addition/Subtraction (1-20)
            const num1 = Math.floor(Math.random() * 20) + 1;
            const num2 = Math.floor(Math.random() * 20) + 1;
            const op = Math.random() > 0.5 ? '+' : '-';
            if (op === '+') {
                question = `${num1} + ${num2}`;
                answer = num1 + num2;
            } else {
                question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)}`;
                answer = Math.max(num1, num2) - Math.min(num1, num2);
            }
        } else if (difficulty.level === 3) {
            // Level 3: All operations (1-20)
            const num1 = Math.floor(Math.random() * 15) + 1;
            const num2 = Math.floor(Math.random() * 10) + 1;
            const ops = ['+', '-', '*', '/'];
            const op = ops[Math.floor(Math.random() * ops.length)];
            
            if (op === '+') {
                question = `${num1} + ${num2}`;
                answer = num1 + num2;
            } else if (op === '-') {
                question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)}`;
                answer = Math.max(num1, num2) - Math.min(num1, num2);
            } else if (op === '*') {
                const n1 = Math.floor(Math.random() * 10) + 1;
                const n2 = Math.floor(Math.random() * 10) + 1;
                question = `${n1} × ${n2}`;
                answer = n1 * n2;
            } else {
                const divisor = Math.floor(Math.random() * 9) + 2;
                const quotient = Math.floor(Math.random() * 10) + 1;
                const dividend = divisor * quotient;
                question = `${dividend} ÷ ${divisor}`;
                answer = quotient;
            }
        } else if (difficulty.level === 4) {
            // Level 4: Complex operations
            const num1 = Math.floor(Math.random() * 20) + 5;
            const num2 = Math.floor(Math.random() * 15) + 5;
            const num3 = Math.floor(Math.random() * 10) + 1;
            const opType = Math.floor(Math.random() * 3);
            
            if (opType === 0) {
                question = `${num1} + ${num2} - ${num3}`;
                answer = num1 + num2 - num3;
            } else if (opType === 1) {
                question = `${num1} × ${num3} + ${num2}`;
                answer = num1 * num3 + num2;
            } else {
                const n = Math.floor(Math.random() * 8) + 2;
                question = `${n} × ${n}`;
                answer = n * n;
            }
        } else {
            // Level 5: Quadratic equations (sum/product of roots)
            const a = 1;
            const root1 = Math.floor(Math.random() * 10) + 1;
            const root2 = Math.floor(Math.random() * 10) + 1;
            const b = -(root1 + root2);
            const c = root1 * root2;
            
            const questionType = Math.random() > 0.5 ? 'sum' : 'product';
            if (questionType === 'sum') {
                question = `x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0<br>Sum of roots?`;
                answer = root1 + root2;
            } else {
                question = `x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0<br>Product of roots?`;
                answer = root1 * root2;
            }
        }
        
        // Generate options
        options = [answer];
        while (options.length < 4) {
            const offset = Math.floor(Math.random() * 10) - 5;
            const opt = answer + offset;
            if (opt !== answer && !options.includes(opt) && opt > 0) {
                options.push(opt);
            }
        }
        options.sort(() => Math.random() - 0.5);
        
        const difficultyNames = ['Easy', 'Medium', 'Hard', 'Expert', 'Master'];
        const difficultyColors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        
        const gameHTML = `
            <div style="padding: 40px; text-align: center;">
                <button class="back-button" onclick="window.location.href='mini-games.html'">← Back</button>
                <h2>🔢 Number Quiz</h2>
                <div style="display: flex; justify-content: center; gap: 20px; margin: 20px 0;">
                    <div style="font-size: 18px; color: ${difficultyColors[difficulty.level - 1]}; font-weight: 600;">
                        ${difficultyNames[difficulty.level - 1]} Mode
                    </div>
                    <div style="font-size: 18px; color: #10B981;">
                        Streak: ${difficulty.correctStreak} ✓
                    </div>
                </div>
                <p>Solve the problem!</p>
                <div style="font-size: ${difficulty.level >= 5 ? '40px' : '60px'}; margin: 40px 0; line-height: 1.4;">${question}</div>
                <div style="display: grid; grid-template-columns: repeat(2, 150px); gap: 20px; justify-content: center;">
                    ${options.map(opt => `
                        <button onclick="SimpleMiniGames.checkMathAnswer(${opt}, ${answer})" 
                                style="font-size: 40px; padding: 30px; border: 3px solid #667eea; border-radius: 15px; background: white; cursor: pointer; transition: all 0.3s;">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.showGameScreen(gameHTML);
    },
    
    /**
     * Algebra Quiz - Equations & Polynomials
     */
    startAlgebraQuiz() {
        // Initialize difficulty tracking
        if (!this.algebraDifficulty) {
            this.algebraDifficulty = {
                level: 1, // 1=Easy, 2=Medium, 3=Hard, 4=Expert, 5=Master
                correctStreak: 0,
                wrongStreak: 0
            };
        }
        
        const difficulty = this.algebraDifficulty;
        let question, answer, options;
        
        if (difficulty.level === 1) {
            // Level 1: Simple linear equations (x + a = b)
            const a = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 20) + 1;
            question = `x + ${a} = ${b}<br>Find x`;
            answer = b - a;
        } else if (difficulty.level === 2) {
            // Level 2: Linear equations (ax + b = c)
            const a = Math.floor(Math.random() * 5) + 2;
            const b = Math.floor(Math.random() * 10) + 1;
            const x = Math.floor(Math.random() * 10) + 1;
            const c = a * x + b;
            question = `${a}x + ${b} = ${c}<br>Find x`;
            answer = x;
        } else if (difficulty.level === 3) {
            // Level 3: Quadratic - Sum of roots
            const root1 = Math.floor(Math.random() * 8) + 1;
            const root2 = Math.floor(Math.random() * 8) + 1;
            const b = -(root1 + root2);
            const c = root1 * root2;
            question = `x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0<br>Sum of roots?`;
            answer = root1 + root2;
        } else if (difficulty.level === 4) {
            // Level 4: Quadratic - Product of roots
            const root1 = Math.floor(Math.random() * 10) + 1;
            const root2 = Math.floor(Math.random() * 10) + 1;
            const b = -(root1 + root2);
            const c = root1 * root2;
            question = `x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0<br>Product of roots?`;
            answer = root1 * root2;
        } else {
            // Level 5: Cubic equations - Sum of roots
            const r1 = Math.floor(Math.random() * 5) + 1;
            const r2 = Math.floor(Math.random() * 5) + 1;
            const r3 = Math.floor(Math.random() * 5) + 1;
            const b = -(r1 + r2 + r3);
            question = `x³ ${b >= 0 ? '+' : ''}${b}x² + ... = 0<br>Sum of roots?`;
            answer = r1 + r2 + r3;
        }
        
        // Generate options
        options = [answer];
        while (options.length < 4) {
            const offset = Math.floor(Math.random() * 10) - 5;
            const opt = answer + offset;
            if (opt !== answer && !options.includes(opt) && opt >= 0) {
                options.push(opt);
            }
        }
        options.sort(() => Math.random() - 0.5);
        
        const difficultyNames = ['Easy', 'Medium', 'Hard', 'Expert', 'Master'];
        const difficultyColors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        
        const gameHTML = `
            <div style="padding: 40px; text-align: center;">
                <button class="back-button" onclick="window.location.href='number-quiz.html'"> Back to Number Quiz← Back</button>
                <h2>📐 Algebra Quiz</h2>
                <div style="display: flex; justify-content: center; gap: 20px; margin: 20px 0;">
                    <div style="font-size: 18px; color: ${difficultyColors[difficulty.level - 1]}; font-weight: 600;">
                        ${difficultyNames[difficulty.level - 1]} Mode
                    </div>
                    <div style="font-size: 18px; color: #10B981;">
                        Streak: ${difficulty.correctStreak} ✓
                    </div>
                </div>
                <p>Solve the equation!</p>
                <div style="font-size: 40px; margin: 40px 0; line-height: 1.6;">${question}</div>
                <div style="display: grid; grid-template-columns: repeat(2, 150px); gap: 20px; justify-content: center;">
                    ${options.map(opt => `
                        <button onclick="SimpleMiniGames.checkQuizAnswer(${opt}, ${answer}, 'algebra')" 
                                style="font-size: 40px; padding: 30px; border: 3px solid #f5576c; border-radius: 15px; background: white; cursor: pointer; transition: all 0.3s;">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.showGameScreen(gameHTML);
    },
    
    /**
     * Geometry Quiz - Shapes & Angles with Visual Diagrams
     */
    startGeometryQuiz() {
        // Initialize difficulty tracking
        if (!this.geometryDifficulty) {
            this.geometryDifficulty = {
                level: 1,
                correctStreak: 0,
                wrongStreak: 0
            };
        }
        
        const difficulty = this.geometryDifficulty;
        let question, answer, options, visualDiagram;
        
        if (difficulty.level === 1) {
            // Level 1: Square area
            const side = Math.floor(Math.random() * 10) + 3;
            question = `Find the area of the square`;
            answer = side * side;
            visualDiagram = `
                <div style="border: 4px solid #667eea; width: 150px; height: 150px; display: flex; align-items: center; justify-content: center; background: rgba(102, 126, 234, 0.1); border-radius: 10px; margin: 20px auto;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${side} cm</div>
                        <div style="font-size: 60px; margin: 10px 0;">⬛</div>
                        <div style="font-size: 24px; font-weight: bold;">${side} cm</div>
                    </div>
                </div>
            `;
        } else if (difficulty.level === 2) {
            // Level 2: Rectangle area/perimeter
            const length = Math.floor(Math.random() * 10) + 5;
            const width = Math.floor(Math.random() * 8) + 3;
            const type = Math.random() > 0.5 ? 'area' : 'perimeter';
            if (type === 'area') {
                question = `Find the area of the rectangle`;
                answer = length * width;
            } else {
                question = `Find the perimeter of the rectangle`;
                answer = 2 * (length + width);
            }
            visualDiagram = `
                <div style="border: 4px solid #f5576c; width: ${length * 15}px; height: ${width * 15}px; max-width: 200px; max-height: 150px; display: flex; flex-direction: column; justify-content: space-between; background: rgba(245, 87, 108, 0.1); border-radius: 10px; margin: 20px auto; padding: 10px;">
                    <div style="text-align: center; font-size: 18px; font-weight: bold;">${length} cm</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 18px; font-weight: bold; writing-mode: vertical-rl;">${width} cm</div>
                        <div style="font-size: 50px;">▭</div>
                        <div style="font-size: 18px; font-weight: bold; writing-mode: vertical-rl;">${width} cm</div>
                    </div>
                    <div style="text-align: center; font-size: 18px; font-weight: bold;">${length} cm</div>
                </div>
            `;
        } else if (difficulty.level === 3) {
            // Level 3: Triangle area & angles
            const questionType = Math.random() > 0.5 ? 'area' : 'angle';
            if (questionType === 'area') {
                const base = Math.floor(Math.random() * 12) + 4;
                const height = Math.floor(Math.random() * 10) + 4;
                question = `Find the area of the triangle`;
                answer = Math.floor((base * height) / 2);
                visualDiagram = `
                    <div style="position: relative; width: 200px; height: 150px; margin: 20px auto;">
                        <div style="font-size: 80px; color: #EF4444;">🔺</div>
                        <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); font-size: 18px; font-weight: bold;">Base: ${base} cm</div>
                        <div style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); font-size: 18px; font-weight: bold;">h: ${height} cm</div>
                    </div>
                `;
            } else {
                const angle1 = Math.floor(Math.random() * 50) + 30;
                const angle2 = Math.floor(Math.random() * 50) + 30;
                const angle3 = 180 - angle1 - angle2;
                question = `Find the missing angle ∠C`;
                answer = angle3;
                visualDiagram = `
                    <div style="position: relative; width: 200px; height: 150px; margin: 20px auto;">
                        <div style="font-size: 80px; color: #EF4444;">🔺</div>
                        <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); font-size: 18px; font-weight: bold; color: #667eea;">∠A = ${angle1}°</div>
                        <div style="position: absolute; bottom: 0; left: 0; font-size: 18px; font-weight: bold; color: #667eea;">∠B = ${angle2}°</div>
                        <div style="position: absolute; bottom: 0; right: 0; font-size: 18px; font-weight: bold; color: #EF4444;">∠C = ?</div>
                    </div>
                `;
            }
        } else if (difficulty.level === 4) {
            // Level 4: Circle & Parallel lines angles
            const questionType = Math.random() > 0.5 ? 'circle' : 'parallel';
            if (questionType === 'circle') {
                const radius = Math.floor(Math.random() * 8) + 3;
                const type = Math.random() > 0.5 ? 'area' : 'circumference';
                if (type === 'area') {
                    question = `Find the area (π ≈ 3)`;
                    answer = Math.floor(3 * radius * radius);
                } else {
                    question = `Find the circumference (π ≈ 3)`;
                    answer = Math.floor(2 * 3 * radius);
                }
                visualDiagram = `
                    <div style="position: relative; width: 200px; height: 200px; margin: 20px auto;">
                        <div style="font-size: 100px; color: #00f2fe;">⭕</div>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 20px; font-weight: bold;">r = ${radius} cm</div>
                    </div>
                `;
            } else {
                // Parallel lines with transversal
                const angle = Math.floor(Math.random() * 60) + 60;
                const correspondingAngle = angle;
                question = `Find the corresponding angle`;
                answer = correspondingAngle;
                visualDiagram = `
                    <div style="position: relative; width: 250px; height: 150px; margin: 20px auto; background: rgba(0, 242, 254, 0.1); border-radius: 10px; padding: 20px;">
                        <div style="font-size: 16px; margin-bottom: 10px;">Parallel lines cut by transversal</div>
                        <div style="border-top: 3px solid #667eea; width: 100%; margin: 20px 0;"></div>
                        <div style="position: absolute; top: 30px; left: 50px; font-size: 18px; font-weight: bold; color: #667eea;">${angle}°</div>
                        <div style="border-top: 3px solid #667eea; width: 100%; margin: 20px 0;"></div>
                        <div style="position: absolute; bottom: 30px; right: 50px; font-size: 18px; font-weight: bold; color: #EF4444;">?</div>
                        <div style="position: absolute; top: 0; left: 40%; width: 3px; height: 100%; background: #f5576c; transform: rotate(30deg);"></div>
                    </div>
                `;
            }
        } else {
            // Level 5: Complex angle problems
            const problemType = Math.floor(Math.random() * 3);
            if (problemType === 0) {
                // Exterior angle of triangle
                const int1 = Math.floor(Math.random() * 50) + 40;
                const int2 = Math.floor(Math.random() * 50) + 40;
                const exterior = int1 + int2;
                question = `Find the exterior angle`;
                answer = exterior;
                visualDiagram = `
                    <div style="position: relative; width: 250px; height: 150px; margin: 20px auto;">
                        <div style="font-size: 80px; color: #8B5CF6;">🔺</div>
                        <div style="position: absolute; top: 20px; left: 30px; font-size: 16px; font-weight: bold; color: #667eea;">${int1}°</div>
                        <div style="position: absolute; top: 20px; right: 30px; font-size: 16px; font-weight: bold; color: #667eea;">${int2}°</div>
                        <div style="position: absolute; bottom: 20px; right: 0; font-size: 18px; font-weight: bold; color: #EF4444;">Ext. ∠ = ?</div>
                    </div>
                `;
            } else if (problemType === 1) {
                // Complementary angles
                const angle1 = Math.floor(Math.random() * 60) + 20;
                const angle2 = 90 - angle1;
                question = `Find the complementary angle`;
                answer = angle2;
                visualDiagram = `
                    <div style="position: relative; width: 200px; height: 200px; margin: 20px auto; background: rgba(139, 92, 246, 0.1); border-radius: 10px; padding: 20px;">
                        <div style="font-size: 16px; margin-bottom: 10px;">Complementary angles (sum = 90°)</div>
                        <div style="font-size: 60px; margin: 20px 0;">📐</div>
                        <div style="font-size: 18px; font-weight: bold; color: #667eea;">∠1 = ${angle1}°</div>
                        <div style="font-size: 18px; font-weight: bold; color: #EF4444; margin-top: 10px;">∠2 = ?</div>
                    </div>
                `;
            } else {
                // Supplementary angles
                const angle1 = Math.floor(Math.random() * 100) + 40;
                const angle2 = 180 - angle1;
                question = `Find the supplementary angle`;
                answer = angle2;
                visualDiagram = `
                    <div style="position: relative; width: 250px; height: 150px; margin: 20px auto; background: rgba(236, 72, 153, 0.1); border-radius: 10px; padding: 20px;">
                        <div style="font-size: 16px; margin-bottom: 10px;">Supplementary angles (sum = 180°)</div>
                        <div style="border-bottom: 3px solid #667eea; width: 100%; margin: 20px 0;"></div>
                        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                            <div style="font-size: 18px; font-weight: bold; color: #667eea;">∠1 = ${angle1}°</div>
                            <div style="font-size: 18px; font-weight: bold; color: #EF4444;">∠2 = ?</div>
                        </div>
                    </div>
                `;
            }
        }
        
        // Generate options
        options = [answer];
        while (options.length < 4) {
            const offset = Math.floor(Math.random() * 20) - 10;
            const opt = answer + offset;
            if (opt !== answer && !options.includes(opt) && opt > 0) {
                options.push(opt);
            }
        }
        options.sort(() => Math.random() - 0.5);
        
        const difficultyNames = ['Easy', 'Medium', 'Hard', 'Expert', 'Master'];
        const difficultyColors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        
        const gameHTML = `
            <div style="padding: 40px; text-align: center;">
                <button class="back-button" onclick="window.location.href='number-quiz.html'"> Back to Number Quiz← Back</button>
                <h2>📏 Geometry Quiz</h2>
                <div style="display: flex; justify-content: center; gap: 20px; margin: 20px 0;">
                    <div style="font-size: 18px; color: ${difficultyColors[difficulty.level - 1]}; font-weight: 600;">
                        ${difficultyNames[difficulty.level - 1]} Mode
                    </div>
                    <div style="font-size: 18px; color: #10B981;">
                        Streak: ${difficulty.correctStreak} ✓
                    </div>
                </div>
                
                <!-- Question and Visual Diagram Side by Side -->
                <div style="display: flex; justify-content: center; align-items: center; gap: 40px; margin: 30px auto; max-width: 800px; flex-wrap: wrap;">
                    <!-- Visual Diagram -->
                    <div style="flex: 1; min-width: 250px;">
                        ${visualDiagram}
                    </div>
                    
                    <!-- Question -->
                    <div style="flex: 1; min-width: 250px;">
                        <div style="font-size: 28px; font-weight: 600; color: #F9FAFB; margin-bottom: 20px;">${question}</div>
                    </div>
                </div>
                
                <!-- Answer Options -->
                <div style="display: grid; grid-template-columns: repeat(2, 150px); gap: 20px; justify-content: center; margin-top: 30px;">
                    ${options.map(opt => `
                        <button onclick="SimpleMiniGames.checkQuizAnswer(${opt}, ${answer}, 'geometry')" 
                                style="font-size: 40px; padding: 30px; border: 3px solid #00f2fe; border-radius: 15px; background: white; cursor: pointer; transition: all 0.3s;">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.showGameScreen(gameHTML);
    },
    
    /**
     * Universal Quiz Answer Checker
     */
    checkQuizAnswer(selected, correct, category) {
        const difficultyMap = {
            'arithmetic': this.quizDifficulty,
            'algebra': this.algebraDifficulty,
            'geometry': this.geometryDifficulty
        };
        
        const restartMap = {
            'arithmetic': () => this.startArithmeticQuiz(),
            'algebra': () => this.startAlgebraQuiz(),
            'geometry': () => this.startGeometryQuiz()
        };
        
        const difficulty = difficultyMap[category];
        const restartFunc = restartMap[category];
        
        if (selected === correct) {
            // Correct!
            difficulty.correctStreak++;
            difficulty.wrongStreak = 0;
            
            if (difficulty.correctStreak >= 3 && difficulty.level < 5) {
                difficulty.level++;
                difficulty.correctStreak = 0;
                this.showPopup(
                    '🎉 Level Up!',
                    `Excellent work! Moving to harder questions!\nDifficulty: Level ${difficulty.level}`,
                    'success'
                );
                setTimeout(() => {
                    this.closePopup();
                    restartFunc();
                }, 2000);
            } else {
                this.showPopup('✅ Correct!', 'Great job! Next question...', 'success');
                setTimeout(() => {
                    this.closePopup();
                    restartFunc();
                }, 1500);
            }
        } else {
            // Wrong!
            difficulty.wrongStreak++;
            difficulty.correctStreak = 0;
            
            if (difficulty.wrongStreak >= 2 && difficulty.level > 1) {
                difficulty.level--;
                difficulty.wrongStreak = 0;
                this.showPopup(
                    '💡 Difficulty Adjusted',
                    `Let's try easier questions.\nDifficulty: Level ${difficulty.level}`,
                    'info'
                );
                setTimeout(() => {
                    this.closePopup();
                    restartFunc();
                }, 2000);
            } else {
                this.showPopup('❌ Wrong Answer', `The correct answer was ${correct}.\nKeep trying!`, 'error');
                setTimeout(() => {
                    this.closePopup();
                    restartFunc();
                }, 2000);
            }
        }
    },
    
    checkMathAnswer(selected, correct) {
        const difficulty = this.quizDifficulty;
        
        if (selected === correct) {
            // Correct answer!
            difficulty.correctStreak++;
            difficulty.wrongStreak = 0;
            
            // Increase difficulty after 3 correct answers
            if (difficulty.correctStreak >= 3 && difficulty.level < 5) {
                difficulty.level++;
                difficulty.correctStreak = 0;
                this.showPopup(
                    '🎉 Level Up!',
                    `Amazing! You're getting better!\nDifficulty increased to Level ${difficulty.level}!`,
                    'success'
                );
                setTimeout(() => {
                    this.closePopup();
                    this.startArithmeticQuiz();
                }, 2000);
            } else {
                this.showPopup('✅ Correct!', 'Great job! Next question...', 'success');
                setTimeout(() => {
                    this.closePopup();
                    this.startArithmeticQuiz();
                }, 1500);
            }
        } else {
            // Wrong answer
            difficulty.wrongStreak++;
            difficulty.correctStreak = 0;
            
            // Decrease difficulty after 2 wrong answers
            if (difficulty.wrongStreak >= 2 && difficulty.level > 1) {
                difficulty.level--;
                difficulty.wrongStreak = 0;
                this.showPopup(
                    '💡 Difficulty Adjusted',
                    `Don't worry! Let's try easier questions.\nDifficulty decreased to Level ${difficulty.level}.`,
                    'info'
                );
                setTimeout(() => {
                    this.closePopup();
                    this.startArithmeticQuiz();
                }, 2000);
            } else {
                this.showPopup('❌ Try Again', `The correct answer was ${correct}.\nKeep trying!`, 'error');
                setTimeout(() => {
                    this.closePopup();
                    this.startArithmeticQuiz();
                }, 2000);
            }
        }
    },
    
    /**
     * Shape Finder Game - Enhanced with Adaptive Difficulty
     */
    startShapeFinder() {
        // Initialize difficulty tracking
        if (!this.shapeDifficulty) {
            this.shapeDifficulty = {
                level: 1, // 1=Easy, 2=Medium, 3=Hard, 4=Expert, 5=Master
                correctStreak: 0,
                wrongStreak: 0,
                score: 0,
                timeLimit: 0
            };
        }
        
        const difficulty = this.shapeDifficulty;
        const allShapes = [
            '⭐', '❤️', '⬛', '🔵', '🔺', '⬜', '🔶', '🔷',
            '🔸', '🔹', '🟥', '🟦', '🟧', '🟨', '🟩', '🟪',
            '⬜', '⬛', '🔴', '🟢', '🟡', '🟣', '🟤', '⚫',
            '⚪', '🔳', '🔲', '◼️', '◻️', '▪️', '▫️'
        ];
        
        let displayShapes, targetShape, gridCols, timeLimit, challengeType;
        
        // Difficulty-based configuration
        if (difficulty.level === 1) {
            // Easy: 6 very different shapes, no time limit
            const easyShapes = ['⭐', '❤️', '⬛', '🔵', '🔺', '⬜'];
            const shuffled = [...easyShapes].sort(() => Math.random() - 0.5);
            targetShape = shuffled[0];
            displayShapes = shuffled;
            gridCols = 3;
            timeLimit = 0;
            challengeType = 'single';
        } else if (difficulty.level === 2) {
            // Medium: 9 shapes, 12 seconds
            const shuffled = [...allShapes].sort(() => Math.random() - 0.5);
            targetShape = shuffled[0];
            displayShapes = shuffled.slice(0, 9);
            gridCols = 3;
            timeLimit = 12;
            challengeType = 'single';
        } else if (difficulty.level === 3) {
            // Hard: 12 shapes with similar ones, 10 seconds
            const shuffled = [...allShapes].sort(() => Math.random() - 0.5);
            targetShape = shuffled[0];
            displayShapes = shuffled.slice(0, 12);
            gridCols = 4;
            timeLimit = 10;
            challengeType = 'single';
        } else if (difficulty.level === 4) {
            // Expert: Pattern matching - find 2 same shapes, 8 seconds
            const shuffled = [...allShapes].sort(() => Math.random() - 0.5);
            targetShape = shuffled[0];
            // Add duplicate of target
            displayShapes = [...shuffled.slice(0, 7), targetShape, targetShape].sort(() => Math.random() - 0.5);
            gridCols = 3;
            timeLimit = 8;
            challengeType = 'pattern';
        } else {
            // Master: Find all matching shapes (3 of same), 6 seconds
            const shuffled = [...allShapes].sort(() => Math.random() - 0.5);
            targetShape = shuffled[0];
            // Add 3 of target shape
            displayShapes = [...shuffled.slice(0, 9), targetShape, targetShape, targetShape].sort(() => Math.random() - 0.5);
            gridCols = 4;
            timeLimit = 6;
            challengeType = 'multiple';
        }
        
        const difficultyNames = ['Easy', 'Medium', 'Hard', 'Expert', 'Master'];
        const difficultyColors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        
        const instructions = {
            'single': 'Find the matching shape!',
            'pattern': 'Find ALL matching shapes (2 total)!',
            'multiple': 'Find ALL matching shapes (3 total)!'
        };
        
        const gameHTML = `
            <div style="position: relative; min-height: 100vh; padding: 20px;">
                <!-- Back Button - Fixed Top Left -->
                <button class="back-button" onclick="window.location.href='mini-games.html'" style="position: absolute; top: 20px; left: 20px; z-index: 100;">
                    ← Back
                </button>
                
                <!-- Content Container -->
                <div style="max-width: 900px; margin: 0 auto; padding-top: 80px;">
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="font-size: 2.5rem; color: #F9FAFB; margin-bottom: 10px;">⭐ Shape Finder</h2>
                        <p style="color: #D1D5DB; font-size: 1.1rem;">${instructions[challengeType]}</p>
                    </div>
                    
                    <!-- Stats Bar -->
                    <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 30px; flex-wrap: wrap;">
                        <div style="padding: 12px 24px; background: rgba(${difficulty.level === 1 ? '16, 185, 129' : difficulty.level === 2 ? '245, 158, 11' : difficulty.level === 3 ? '239, 68, 68' : difficulty.level === 4 ? '139, 92, 246' : '236, 72, 153'}, 0.2); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                            <div style="font-size: 14px; color: #9CA3AF; margin-bottom: 4px;">Difficulty</div>
                            <div style="font-size: 20px; font-weight: 700; color: ${difficultyColors[difficulty.level - 1]};">${difficultyNames[difficulty.level - 1]}</div>
                        </div>
                        <div style="padding: 12px 24px; background: rgba(16, 185, 129, 0.2); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                            <div style="font-size: 14px; color: #9CA3AF; margin-bottom: 4px;">Score</div>
                            <div style="font-size: 20px; font-weight: 700; color: #10B981;">${difficulty.score}</div>
                        </div>
                        ${timeLimit > 0 ? `
                        <div style="padding: 12px 24px; background: rgba(239, 68, 68, 0.2); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                            <div style="font-size: 14px; color: #9CA3AF; margin-bottom: 4px;">Time</div>
                            <div id="shapeTimer" style="font-size: 20px; font-weight: 700; color: #EF4444;">⏱️ ${timeLimit}s</div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <!-- Target Shape -->
                    <div style="text-align: center; margin: 40px 0;">
                        <div style="display: inline-block; padding: 30px 50px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%); border-radius: 20px; border: 2px solid rgba(102, 126, 234, 0.5); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);">
                            <div style="font-size: 16px; color: #D1D5DB; margin-bottom: 10px; font-weight: 600;">TARGET</div>
                            <div style="font-size: 90px; animation: pulse 2s infinite;">${targetShape}</div>
                        </div>
                    </div>
                    
                    <!-- Shape Grid -->
                    <div style="display: grid; grid-template-columns: repeat(${gridCols}, 100px); gap: 15px; justify-content: center; margin: 40px auto;">
                        ${displayShapes.map((shape, i) => `
                            <button onclick="SimpleMiniGames.checkShapeMatch('${shape}', '${targetShape}', ${i}, '${challengeType}')" 
                                    class="shape-finder-btn shape-btn-${i}"
                                    style="font-size: 60px; padding: 20px; border: 3px solid rgba(102, 126, 234, 0.5); border-radius: 15px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);">
                                ${shape}
                            </button>
                        `).join('')}
                    </div>
                    
                    <!-- Progress -->
                    <div id="shapeProgress" style="text-align: center; margin-top: 30px; font-size: 20px; color: #667eea; font-weight: 700;"></div>
                </div>
            </div>
        `;
        
        this.showGameScreen(gameHTML);
        
        // Initialize tracking for multiple matches
        this.shapeMatches = {
            found: 0,
            required: challengeType === 'multiple' ? 3 : challengeType === 'pattern' ? 2 : 1,
            foundIndices: []
        };
        
        // Start timer if time limit exists
        if (timeLimit > 0) {
            this.startShapeTimer(timeLimit, targetShape, challengeType);
        }
    },
    
    /**
     * Timer for Shape Finder
     */
    startShapeTimer(seconds, correctShape, challengeType) {
        const timerEl = document.getElementById('shapeTimer');
        if (!timerEl) return;
        
        let timeLeft = seconds;
        this.shapeTimer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = `⏱️ ${timeLeft}s`;
            
            if (timeLeft <= 3) {
                timerEl.style.color = '#EF4444';
                timerEl.style.animation = 'pulse 0.5s infinite';
            }
            
            if (timeLeft <= 0) {
                clearInterval(this.shapeTimer);
                this.checkShapeMatch('timeout', correctShape, -1, challengeType);
            }
        }, 1000);
    },
    
    /**
     * Check Shape Match with Multiple Support
     */
    checkShapeMatch(selected, target, index, challengeType) {
        // Clear timer if exists
        if (this.shapeTimer) {
            clearInterval(this.shapeTimer);
        }
        
        const difficulty = this.shapeDifficulty;
        const matches = this.shapeMatches;
        
        if (selected === 'timeout') {
            // Time ran out
            difficulty.wrongStreak++;
            difficulty.correctStreak = 0;
            
            if (difficulty.wrongStreak >= 2 && difficulty.level > 1) {
                difficulty.level--;
                difficulty.wrongStreak = 0;
                this.showPopup(
                    '⏰ Time\'s Up!',
                    `Too slow! Moving to easier level.\nDifficulty: Level ${difficulty.level}`,
                    'warning'
                );
                setTimeout(() => {
                    this.closePopup();
                    this.startShapeFinder();
                }, 2000);
            } else {
                this.showPopup('⏰ Time\'s Up!', `The correct shape was ${target}.\nBe faster!`, 'error');
                setTimeout(() => {
                    this.closePopup();
                    this.startShapeFinder();
                }, 2000);
            }
            return;
        }
        
        if (selected === target) {
            // Correct shape found!
            matches.found++;
            matches.foundIndices.push(index);
            
            // Mark button as found
            const button = document.querySelector(`.shape-btn-${index}`);
            if (button) {
                button.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
                button.style.borderColor = '#10B981';
                button.style.color = 'white';
                button.disabled = true;
                button.style.transform = 'scale(1.1)';
            }
            
            // Update progress
            const progressEl = document.getElementById('shapeProgress');
            if (progressEl && matches.required > 1) {
                progressEl.textContent = `Found: ${matches.found}/${matches.required} ✓`;
            }
            
            // Check if all found
            if (matches.found >= matches.required) {
                difficulty.correctStreak++;
                difficulty.wrongStreak = 0;
                difficulty.score += difficulty.level * 15;
                
                // Disable all buttons
                document.querySelectorAll('.shape-finder-btn').forEach(btn => {
                    btn.disabled = true;
                    btn.style.opacity = '0.6';
                });
                
                // Level up after 3 correct
                if (difficulty.correctStreak >= 3 && difficulty.level < 5) {
                    difficulty.level++;
                    difficulty.correctStreak = 0;
                    this.showPopup(
                        '🎉 Level Up!',
                        `Amazing! You're a shape master!\nDifficulty: Level ${difficulty.level}\nScore: ${difficulty.score}`,
                        'success'
                    );
                    setTimeout(() => {
                        this.closePopup();
                        this.startShapeFinder();
                    }, 2000);
                } else {
                    this.showPopup('✅ Perfect!', `All shapes found! +${difficulty.level * 15} points\nScore: ${difficulty.score}`, 'success');
                    setTimeout(() => {
                        this.closePopup();
                        this.startShapeFinder();
                    }, 1500);
                }
            }
        } else {
            // Wrong shape!
            const button = document.querySelector(`.shape-btn-${index}`);
            if (button) {
                button.style.background = 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
                button.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    button.style.background = 'white';
                    button.style.animation = '';
                }, 500);
            }
            
            difficulty.wrongStreak++;
            difficulty.correctStreak = 0;
            
            // Level down after 2 wrong
            if (difficulty.wrongStreak >= 2 && difficulty.level > 1) {
                difficulty.level--;
                difficulty.wrongStreak = 0;
                this.showPopup(
                    '💡 Difficulty Adjusted',
                    `Let's try easier shapes.\nDifficulty: Level ${difficulty.level}`,
                    'info'
                );
                setTimeout(() => {
                    this.closePopup();
                    this.startShapeFinder();
                }, 2000);
            } else {
                this.showPopup('❌ Wrong Shape', `Look for ${target}. Keep trying!`, 'error');
                setTimeout(() => this.closePopup(), 1500);
            }
        }
    },
    
    /**
     * Spin Wheel Game - Professional Circular Spinning Wheel
     */
    startSpinWheel() {
        // Initialize wheel data
        if (!this.wheelData) {
            this.wheelData = {
                spinsToday: 0,
                totalSpins: 0,
                streak: 0,
                lastSpinDate: null,
                totalWinnings: 0
            };
            const saved = localStorage.getItem('wheelData');
            if (saved) {
                this.wheelData = JSON.parse(saved);
            }
        }
        
        // Check if new day
        const today = new Date().toDateString();
        if (this.wheelData.lastSpinDate !== today) {
            if (this.wheelData.lastSpinDate) {
                const lastDate = new Date(this.wheelData.lastSpinDate);
                const todayDate = new Date(today);
                const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    this.wheelData.streak++;
                } else if (diffDays > 1) {
                    this.wheelData.streak = 0;
                }
            }
            this.wheelData.lastSpinDate = today;
            localStorage.setItem('wheelData', JSON.stringify(this.wheelData));
        }
        
        const streakBonus = Math.min(this.wheelData.streak * 10, 100);
        
        const prizes = [
            { emoji: '🎁', name: 'Gift', value: 10, color: '#FF6B6B', weight: 30 },
            { emoji: '⭐', name: 'Star', value: 20, color: '#4ECDC4', weight: 25 },
            { emoji: '💎', name: 'Diamond', value: 50, color: '#45B7D1', weight: 20 },
            { emoji: '🏆', name: 'Trophy', value: 100, color: '#FFA07A', weight: 15 },
            { emoji: '🎉', name: 'Party', value: 5, color: '#98D8C8', weight: 5 },
            { emoji: '✨', name: 'Sparkle', value: 15, color: '#F7DC6F', weight: 3 },
            { emoji: '🌟', name: 'Mega Star', value: 200, color: '#BB8FCE', weight: 1.5 },
            { emoji: '💰', name: 'JACKPOT', value: 500, color: '#F39C12', weight: 0.5 }
        ];
        
        // Create SVG wheel segments
        const segmentAngle = 360 / prizes.length;
        const wheelSegments = prizes.map((prize, i) => {
            const startAngle = i * segmentAngle - 90;
            const endAngle = (i + 1) * segmentAngle - 90;
            const largeArc = segmentAngle > 180 ? 1 : 0;
            
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            const x1 = 200 + 180 * Math.cos(startRad);
            const y1 = 200 + 180 * Math.sin(startRad);
            const x2 = 200 + 180 * Math.cos(endRad);
            const y2 = 200 + 180 * Math.sin(endRad);
            
            const midAngle = (startAngle + endAngle) / 2;
            const midRad = (midAngle * Math.PI) / 180;
            const textX = 200 + 130 * Math.cos(midRad);
            const textY = 200 + 130 * Math.sin(midRad);
            
            return `
                <g>
                    <path d="M 200 200 L ${x1} ${y1} A 180 180 0 ${largeArc} 1 ${x2} ${y2} Z" 
                          fill="${prize.color}" 
                          stroke="#1E2139" 
                          stroke-width="3"/>
                    <text x="${textX}" y="${textY}" 
                          text-anchor="middle" 
                          dominant-baseline="middle" 
                          font-size="40" 
                          fill="white"
                          style="pointer-events: none; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                        ${prize.emoji}
                    </text>
                    <text x="${textX}" y="${textY + 25}" 
                          text-anchor="middle" 
                          dominant-baseline="middle" 
                          font-size="14" 
                          font-weight="bold"
                          fill="white"
                          style="pointer-events: none; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
                        ${prize.value}
                    </text>
                </g>
            `;
        }).join('');
        
        const gameHTML = `
            <style>
                /* Performance Optimizations */
                .spin-wheel-svg {
                    transform: translateZ(0);
                    backface-visibility: hidden;
                    perspective: 1000px;
                    filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.3));
                }
                
                /* Phase 2: Gradient Enhancement for Wheel Container */
                .spin-wheel-container {
                    position: relative;
                    transition: all 0.3s ease;
                }
                
                .spin-wheel-container::before {
                    content: '';
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    right: -10px;
                    bottom: -10px;
                    background: linear-gradient(45deg, #667eea, #764ba2, #667eea);
                    background-size: 200% 200%;
                    border-radius: 50%;
                    opacity: 0;
                    z-index: -1;
                    animation: gradientShift 3s ease infinite;
                    transition: opacity 0.3s ease;
                }
                
                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                .spin-button {
                    transform: translateZ(0);
                    will-change: transform;
                    position: relative;
                    overflow: hidden;
                }
                
                /* Phase 2: Animated gradient button */
                .spin-button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    transition: left 0.5s ease;
                }
                
                .spin-button:hover::before {
                    left: 100%;
                }
                
                .spin-button:hover {
                    transform: translateY(-3px) translateZ(0) scale(1.05);
                    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
                }
                
                /* Phase 2: Stat cards with glassmorphism */
                .spin-stat-card {
                    transform: translateZ(0);
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .spin-stat-card::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                    transform: rotate(45deg);
                    transition: all 0.6s ease;
                }
                
                .spin-stat-card:hover::before {
                    left: 100%;
                }
                
                .spin-stat-card:hover {
                    transform: translateY(-2px) translateZ(0);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
                }
                
                @media (max-width: 768px) {
                    .spin-wheel-container {
                        width: 90vw !important;
                        max-width: 350px !important;
                        height: 90vw !important;
                        max-height: 350px !important;
                    }
                    .spin-wheel-svg {
                        width: 100% !important;
                        height: 100% !important;
                    }
                    .spin-header h2 {
                        font-size: 1.8rem !important;
                    }
                    .spin-header p {
                        font-size: 0.95rem !important;
                    }
                    .spin-stats {
                        gap: 10px !important;
                    }
                    .spin-stat-card {
                        padding: 10px 16px !important;
                        min-width: 100px !important;
                    }
                    .spin-stat-card .stat-label {
                        font-size: 12px !important;
                    }
                    .spin-stat-card .stat-value {
                        font-size: 18px !important;
                    }
                    .spin-button {
                        font-size: 20px !important;
                        padding: 16px 40px !important;
                    }
                    .spin-winnings {
                        font-size: 16px !important;
                    }
                }
                @media (max-width: 480px) {
                    .spin-wheel-container {
                        width: 85vw !important;
                        max-width: 300px !important;
                        height: 85vw !important;
                        max-height: 300px !important;
                    }
                    .spin-header h2 {
                        font-size: 1.5rem !important;
                    }
                    .spin-stats {
                        gap: 8px !important;
                    }
                    .spin-stat-card {
                        padding: 8px 12px !important;
                        min-width: 90px !important;
                    }
                    .spin-button {
                        font-size: 18px !important;
                        padding: 14px 35px !important;
                    }
                }
            </style>
            <div style="position: relative; min-height: 100vh; padding: 20px;">
                <!-- Back Button - Fixed Top Left -->
                <button class="back-button" onclick="window.location.href='mini-games.html'" style="position: absolute; top: 20px; left: 20px; z-index: 100;">
                    ← Back
                </button>
                
                <!-- Content Container -->
                <div style="max-width: 900px; margin: 0 auto; padding-top: 80px;">
                    <!-- Header -->
                    <div class="spin-header" style="text-align: center; margin-bottom: 30px;">
                        <h2 style="font-size: 2.5rem; color: #F9FAFB; margin-bottom: 10px;">🎡 Spin the Wheel</h2>
                        <p style="color: #D1D5DB; font-size: 1.1rem;">Spin to win amazing prizes!</p>
                    </div>
                    
                    <!-- Stats Bar -->
                    <div class="spin-stats" style="display: flex; justify-content: center; gap: 15px; margin-bottom: 40px; flex-wrap: wrap;">
                        <div class="spin-stat-card" style="padding: 12px 24px; background: rgba(102, 126, 234, 0.2); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                            <div class="stat-label" style="font-size: 14px; color: #9CA3AF; margin-bottom: 4px;">Total Spins</div>
                            <div class="stat-value" style="font-size: 20px; font-weight: 700; color: #667eea;">${this.wheelData.totalSpins}</div>
                        </div>
                        <div class="spin-stat-card" style="padding: 12px 24px; background: rgba(16, 185, 129, 0.2); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                            <div class="stat-label" style="font-size: 14px; color: #9CA3AF; margin-bottom: 4px;">Daily Streak</div>
                            <div class="stat-value" style="font-size: 20px; font-weight: 700; color: #10B981;">🔥 ${this.wheelData.streak}</div>
                        </div>
                        <div class="spin-stat-card" style="padding: 12px 24px; background: rgba(245, 158, 11, 0.2); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                            <div class="stat-label" style="font-size: 14px; color: #9CA3AF; margin-bottom: 4px;">Streak Bonus</div>
                            <div class="stat-value" style="font-size: 20px; font-weight: 700; color: #F59E0B;">+${streakBonus}%</div>
                        </div>
                    </div>
                
                <!-- Spinning Wheel Container -->
                <div class="spin-wheel-container" style="position: relative; width: 400px; height: 400px; margin: 40px auto;">
                    <!-- Wheel SVG -->
                    <svg id="wheelSVG" class="spin-wheel-svg" width="400" height="400" viewBox="0 0 400 400" style="transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);">
                        ${wheelSegments}
                        <!-- Center arrow pointer -->
                        <g>
                            <polygon points="200,165 215,205 200,195 185,205" fill="#EC4899" stroke="#1E2139" stroke-width="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
                        </g>
                    </svg>
                </div>
                
                <!-- Spin Button -->
                <div style="text-align: center; margin-top: 40px;">
                    <button id="spinButton" class="spin-button" onclick="SimpleMiniGames.spinWheel()" 
                            style="font-size: 24px; padding: 20px 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 15px; cursor: pointer; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); transition: all 0.3s; font-weight: 700;">
                        🎡 SPIN NOW!
                    </button>
                </div>
                
                <div class="spin-winnings" style="text-align: center; margin-top: 20px; font-size: 18px; color: #10B981; font-weight: 600;">
                    Total Winnings: ${this.wheelData.totalWinnings} XP
                </div>
            </div>
        `;
        
        this.showGameScreen(gameHTML);
        
        // Store prizes for spin function
        this.currentWheelPrizes = prizes;
    },
    
    spinWheel() {
        const button = document.getElementById('spinButton');
        if (button) {
            button.disabled = true;
            button.style.opacity = '0.6';
        }
        
        const prizes = this.currentWheelPrizes;
        
        // Performance: Pre-calculate total weight
        const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedPrize = prizes[0];
        let selectedIndex = 0;
        
        // Performance: Optimized loop with early exit
        for (let i = 0; i < prizes.length; i++) {
            random -= prizes[i].weight;
            if (random <= 0) {
                selectedPrize = prizes[i];
                selectedIndex = i;
                break;
            }
        }
        
        // Calculate rotation
        const segmentAngle = 360 / prizes.length;
        const targetAngle = selectedIndex * segmentAngle;
        const spins = 5; // Number of full rotations
        const finalRotation = (spins * 360) + (360 - targetAngle) + (segmentAngle / 2);
        
        // Performance: Cache DOM element and use hardware acceleration
        const wheelSVG = document.getElementById('wheelSVG');
        const wheelContainer = document.querySelector('.spin-wheel-container');
        
        if (wheelSVG) {
            // Phase 1: Add glow effect during spin
            if (wheelContainer) {
                wheelContainer.style.filter = 'drop-shadow(0 0 30px rgba(102, 126, 234, 0.8))';
                wheelContainer.style.transform = 'scale(1.05)';
            }
            
            // Enable hardware acceleration with elastic easing
            wheelSVG.style.willChange = 'transform';
            wheelSVG.style.transition = 'transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'; // Elastic easing
            wheelSVG.style.transform = `rotate(${finalRotation}deg)`;
            
            // Disable hardware acceleration after animation
            setTimeout(() => {
                wheelSVG.style.willChange = 'auto';
                if (wheelContainer) {
                    wheelContainer.style.filter = 'none';
                    wheelContainer.style.transform = 'scale(1)';
                }
            }, 4100);
        }
        
        // Show result after spin completes
        setTimeout(() => {
            // Apply streak bonus
            const streakBonus = Math.min(this.wheelData.streak * 10, 100);
            const finalValue = Math.floor(selectedPrize.value * (1 + streakBonus / 100));
            
            // Update stats
            this.wheelData.spinsToday++;
            this.wheelData.totalSpins++;
            this.wheelData.totalWinnings += finalValue;
            
            // Performance: Batch localStorage write
            this._raf(() => {
                try {
                    localStorage.setItem('wheelData', JSON.stringify(this.wheelData));
                } catch (e) {
                    console.warn('Failed to save wheel data:', e);
                }
            });
            
            const isJackpot = selectedPrize.name === 'JACKPOT';
            const isBigWin = finalValue >= 100;
            
            // Phase 3: Trigger particle effects based on prize
            if (isJackpot) {
                this._createConfetti(100);
                this._createCoinRain(50);
                if (wheelContainer) {
                    wheelContainer.classList.add('jackpot-glow');
                    setTimeout(() => wheelContainer.classList.remove('jackpot-glow'), 3000);
                }
            } else if (isBigWin) {
                this._createConfetti(50);
                this._createSparkles(wheelContainer || wheelSVG, 30);
            } else {
                this._createSparkles(wheelContainer || wheelSVG, 15);
            }
            
            this.showPopup(
                isJackpot ? '🎰 JACKPOT! 🎰' : '🎉 You Won!',
                `${selectedPrize.emoji} ${selectedPrize.name}\n${finalValue} XP${streakBonus > 0 ? ` (+${streakBonus}% streak bonus!)` : ''}\n\nTotal Spins: ${this.wheelData.totalSpins}`,
                isJackpot ? 'success' : 'success'
            );
            
            // Refresh screen
            setTimeout(() => {
                this.closePopup();
                this.startSpinWheel();
            }, 3000);
        }, 4000);
    },
    
    /**
     * Lucky Draw Game - Enhanced with Rarity System & Collection
     */
    startLuckyDraw() {
        // Initialize draw data
        if (!this.drawData) {
            this.drawData = {
                drawsToday: 0,
                maxDraws: 3,
                collection: {},
                totalDraws: 0,
                rareFound: 0
            };
            const saved = localStorage.getItem('drawData');
            if (saved) {
                this.drawData = JSON.parse(saved);
            }
        }
        
        // Check if new day
        const today = new Date().toDateString();
        if (this.drawData.lastDrawDate !== today) {
            this.drawData.drawsToday = 0;
            this.drawData.lastDrawDate = today;
        }
        
        const drawsLeft = this.drawData.maxDraws - this.drawData.drawsToday;
        
        // Prize categories with rarity
        const prizes = [
            // Common (60%)
            { emoji: '🎁', name: 'Gift Box', value: 10, rarity: 'Common', color: '#9CA3AF' },
            { emoji: '⭐', name: 'Star', value: 15, rarity: 'Common', color: '#9CA3AF' },
            { emoji: '🎉', name: 'Party', value: 12, rarity: 'Common', color: '#9CA3AF' },
            // Uncommon (25%)
            { emoji: '💎', name: 'Diamond', value: 30, rarity: 'Uncommon', color: '#10B981' },
            { emoji: '✨', name: 'Sparkle', value: 25, rarity: 'Uncommon', color: '#10B981' },
            { emoji: '🌟', name: 'Shining Star', value: 35, rarity: 'Uncommon', color: '#10B981' },
            // Rare (10%)
            { emoji: '🏆', name: 'Trophy', value: 50, rarity: 'Rare', color: '#3B82F6' },
            { emoji: '👑', name: 'Crown', value: 60, rarity: 'Rare', color: '#3B82F6' },
            // Epic (4%)
            { emoji: '💰', name: 'Gold Bag', value: 100, rarity: 'Epic', color: '#8B5CF6' },
            { emoji: '🎊', name: 'Celebration', value: 80, rarity: 'Epic', color: '#8B5CF6' },
            // Legendary (1%)
            { emoji: '🔮', name: 'Crystal Ball', value: 200, rarity: 'Legendary', color: '#EC4899' },
            { emoji: '🌈', name: 'Rainbow', value: 250, rarity: 'Legendary', color: '#EC4899' }
        ];
        
        const collectionCount = Object.keys(this.drawData.collection).length;
        
        const gameHTML = `
            <div style="position: relative; min-height: 100vh; padding: 20px;">
                <!-- Back Button - Fixed Top Left -->
                <button class="back-button" onclick="window.location.href='mini-games.html'" style="position: absolute; top: 20px; left: 20px; z-index: 100;">
                    ← Back
                </button>
                
                <!-- Content Container -->
                <div style="max-width: 900px; margin: 0 auto; padding-top: 80px;">
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="font-size: 2.5rem; color: #F9FAFB; margin-bottom: 10px;">🎰 Lucky Draw</h2>
                        <p style="color: #D1D5DB; font-size: 1.1rem;">Pick mystery boxes to reveal prizes!</p>
                    </div>
                    
                    <!-- Stats Bar -->
                    <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 40px; flex-wrap: wrap;">
                        <div style="padding: 12px 24px; background: rgba(102, 126, 234, 0.2); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                            <div style="font-size: 14px; color: #9CA3AF; margin-bottom: 4px;">Draws Left</div>
                            <div style="font-size: 20px; font-weight: 700; color: #667eea;">${drawsLeft}/${this.drawData.maxDraws}</div>
                        </div>
                        <div style="padding: 12px 24px; background: rgba(236, 72, 153, 0.2); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                            <div style="font-size: 14px; color: #9CA3AF; margin-bottom: 4px;">Collection</div>
                            <div style="font-size: 20px; font-weight: 700; color: #EC4899;">${collectionCount}/${prizes.length}</div>
                        </div>
                        <div style="padding: 12px 24px; background: rgba(245, 158, 11, 0.2); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                            <div style="font-size: 14px; color: #9CA3AF; margin-bottom: 4px;">Rare Items</div>
                            <div style="font-size: 20px; font-weight: 700; color: #F59E0B;">${this.drawData.rareFound}</div>
                        </div>
                    </div>
                
                <!-- Mystery Boxes -->
                <div id="boxContainer" style="display: grid; grid-template-columns: repeat(3, 130px); gap: 20px; justify-content: center; margin: 40px auto; max-width: 500px;">
                    ${[1,2,3,4,5,6,7,8,9].map(i => `
                        <button onclick="SimpleMiniGames.openMysteryBox(this, ${i})" 
                                class="mystery-box"
                                ${drawsLeft <= 0 ? 'disabled' : ''}
                                style="font-size: 70px; padding: 25px; border: 3px solid #667eea; border-radius: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); cursor: ${drawsLeft > 0 ? 'pointer' : 'not-allowed'}; transition: all 0.3s; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                            📦
                        </button>
                    `).join('')}
                </div>
                
                ${drawsLeft <= 0 ? '<div style="text-align: center; color: #EF4444; font-size: 18px; font-weight: 600; margin-top: 20px;">⏰ Come back tomorrow for more draws!</div>' : ''}
            </div>
        `;
        
        this.showGameScreen(gameHTML);
    },
    
    openMysteryBox(button, index) {
        if (this.drawData.drawsToday >= this.drawData.maxDraws) {
            this.showPopup('⏰ No Draws Left', 'Come back tomorrow!', 'info');
            return;
        }
        
        // Prize selection with weighted rarity
        const prizes = [
            // Common (60%)
            { emoji: '🎁', name: 'Gift Box', value: 10, rarity: 'Common', color: '#9CA3AF', weight: 20 },
            { emoji: '⭐', name: 'Star', value: 15, rarity: 'Common', color: '#9CA3AF', weight: 20 },
            { emoji: '🎉', name: 'Party', value: 12, rarity: 'Common', color: '#9CA3AF', weight: 20 },
            // Uncommon (25%)
            { emoji: '💎', name: 'Diamond', value: 30, rarity: 'Uncommon', color: '#10B981', weight: 10 },
            { emoji: '✨', name: 'Sparkle', value: 25, rarity: 'Uncommon', color: '#10B981', weight: 8 },
            { emoji: '🌟', name: 'Shining Star', value: 35, rarity: 'Uncommon', color: '#10B981', weight: 7 },
            // Rare (10%)
            { emoji: '🏆', name: 'Trophy', value: 50, rarity: 'Rare', color: '#3B82F6', weight: 5 },
            { emoji: '👑', name: 'Crown', value: 60, rarity: 'Rare', color: '#3B82F6', weight: 5 },
            // Epic (4%)
            { emoji: '💰', name: 'Gold Bag', value: 100, rarity: 'Epic', color: '#8B5CF6', weight: 2 },
            { emoji: '🎊', name: 'Celebration', value: 80, rarity: 'Epic', color: '#8B5CF6', weight: 2 },
            // Legendary (1%)
            { emoji: '🔮', name: 'Crystal Ball', value: 200, rarity: 'Legendary', color: '#EC4899', weight: 0.5 },
            { emoji: '🌈', name: 'Rainbow', value: 250, rarity: 'Legendary', color: '#EC4899', weight: 0.5 }
        ];
        
        const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedPrize = prizes[0];
        
        for (const prize of prizes) {
            random -= prize.weight;
            if (random <= 0) {
                selectedPrize = prize;
                break;
            }
        }
        
        // Phase 3: Enhanced 3D flip animation
        button.classList.add('box-3d-flip');
        button.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        setTimeout(() => {
            button.textContent = selectedPrize.emoji;
            button.style.background = `linear-gradient(135deg, ${selectedPrize.color} 0%, ${selectedPrize.color}dd 100%)`;
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = `0 8px 25px ${selectedPrize.color}80`;
            button.disabled = true;
            
            // Phase 3: Add rarity-based glow
            const rarityClass = `rarity-${selectedPrize.rarity.toLowerCase()}`;
            button.classList.add(rarityClass);
            
            // Phase 3: Add sparkles for rare items
            if (selectedPrize.rarity !== 'Common') {
                this._createSparkles(button, 20);
            }
            
            // Update stats
            this.drawData.drawsToday++;
            this.drawData.totalDraws++;
            if (!this.drawData.collection[selectedPrize.name]) {
                this.drawData.collection[selectedPrize.name] = 0;
            }
            this.drawData.collection[selectedPrize.name]++;
            
            if (selectedPrize.rarity === 'Rare' || selectedPrize.rarity === 'Epic' || selectedPrize.rarity === 'Legendary') {
                this.drawData.rareFound++;
            }
            
            // Performance: Batch localStorage write
            this._raf(() => {
                try {
                    localStorage.setItem('drawData', JSON.stringify(this.drawData));
                } catch (e) {
                    console.warn('Failed to save draw data:', e);
                }
            });
            
            setTimeout(() => {
                const isLegendary = selectedPrize.rarity === 'Legendary';
                const isEpic = selectedPrize.rarity === 'Epic';
                const isNew = this.drawData.collection[selectedPrize.name] === 1;
                
                // Phase 3: Trigger effects based on rarity
                if (isLegendary) {
                    this._createConfetti(80);
                    this._createCoinRain(40);
                } else if (isEpic) {
                    this._createConfetti(50);
                    this._createSparkles(button, 30);
                } else if (selectedPrize.rarity === 'Rare') {
                    this._createSparkles(button, 20);
                }
                
                this.showPopup(
                    isLegendary ? '🌟 LEGENDARY! 🌟' : `${selectedPrize.emoji} ${selectedPrize.rarity}!`,
                    `${selectedPrize.name}\n${selectedPrize.value} XP\n${isNew ? '✨ NEW! Added to collection!' : ''}\n\nDraws left: ${this.drawData.maxDraws - this.drawData.drawsToday}`,
                    isLegendary ? 'success' : 'success'
                );
                
                // Refresh if no draws left
                if (this.drawData.drawsToday >= this.drawData.maxDraws) {
                    setTimeout(() => {
                        this.closePopup();
                        this.startLuckyDraw();
                    }, 3000);
                }
            }, 500);
        }, 500);
    },
    
    /**
     * Show Game Screen - Performance Optimized
     */
    showGameScreen(html) {
        // Performance: Cache DOM query
        let gameScreen = this._cache.gameScreen || document.getElementById('miniGamePlayScreen');
        
        if (!gameScreen) {
            gameScreen = document.createElement('div');
            gameScreen.id = 'miniGamePlayScreen';
            gameScreen.className = 'screen';
            document.querySelector('.game-container').appendChild(gameScreen);
            this._cache.gameScreen = gameScreen;
        }
        
        // Performance: Use requestAnimationFrame for DOM updates
        this._raf(() => {
            gameScreen.innerHTML = html;
            
            // Performance: Batch DOM updates
            const screens = document.querySelectorAll('.screen');
            screens.forEach(s => s.classList.remove('active'));
            gameScreen.classList.add('active');
        });
    },
    
    /**
     * Show Popup Notification
     */
    showPopup(title, message, type = 'info', buttons = null) {
        // Create popup if not exists
        let popup = document.getElementById('miniGamePopup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'miniGamePopup';
            popup.className = 'mini-game-popup';
            document.body.appendChild(popup);
        }
        
        const icons = {
            success: '🎉',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        
        // Phase 1: Enhanced popup with XP counter animation
        const xpMatch = message.match(/(\d+)\s*XP/);
        const xpValue = xpMatch ? parseInt(xpMatch[1]) : 0;
        
        popup.innerHTML = `
            <div class="popup-overlay popup-overlay-blur" onclick="SimpleMiniGames.closePopup()"></div>
            <div class="popup-content popup-content-enhanced ${type}">
                <div class="popup-icon popup-icon-bounce">${icons[type] || icons.info}</div>
                <h3 class="popup-title popup-title-slide">${title}</h3>
                <p class="popup-message popup-message-fade">${message.replace(/\d+\s*XP/, '<span id="xpCounter">0</span> XP')}</p>
                <div class="popup-buttons" id="popupButtons">
                </div>
            </div>
        `;
        
        popup.classList.add('active');
        
        // Phase 1: Animate XP counter
        if (xpValue > 0) {
            setTimeout(() => {
                const counter = document.getElementById('xpCounter');
                if (counter) {
                    let current = 0;
                    const increment = Math.ceil(xpValue / 30);
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= xpValue) {
                            current = xpValue;
                            clearInterval(timer);
                            counter.style.transform = 'scale(1.2)';
                            setTimeout(() => counter.style.transform = 'scale(1)', 200);
                        }
                        counter.textContent = current;
                    }, 30);
                }
            }, 300);
        }
        
        // Add buttons with proper event listeners
        const buttonsContainer = document.getElementById('popupButtons');
        if (buttons && buttons.length > 0) {
            buttons.forEach((btn, i) => {
                const button = document.createElement('button');
                button.className = `popup-btn popup-btn-${i}`;
                button.textContent = btn.text;
                button.onclick = btn.onClick;
                buttonsContainer.appendChild(button);
            });
        } else {
            const button = document.createElement('button');
            button.className = 'popup-btn';
            button.textContent = 'OK';
            button.onclick = () => this.closePopup();
            buttonsContainer.appendChild(button);
        }
    },
    
    /**
     * Close Popup
     */
    closePopup() {
        const popup = document.getElementById('miniGamePopup');
        if (popup) {
            popup.classList.remove('active');
        }
    }
};

// Add CSS for mini-games with 3D flip animation
const miniGameStyles = document.createElement('style');
miniGameStyles.textContent = `
    /* Phase 2: Enhanced Mini-Game Cards with Gradient Border */
    .mini-game-card {
        position: relative;
        overflow: hidden;
        background: white;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1), 0 0 0 1px rgba(102, 126, 234, 0.1);
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    /* Phase 2: Gradient border effect */
    .mini-game-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 20px;
        padding: 2px;
        background: linear-gradient(135deg, #667eea, #764ba2, #667eea);
        background-size: 200% 200%;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0;
        transition: opacity 0.3s ease;
        animation: gradientShift 3s ease infinite;
    }
    
    .mini-game-card:hover::before {
        opacity: 1;
    }
    
    /* Phase 2: Shine effect on hover */
    .mini-game-card::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
        transform: rotate(45deg);
        transition: all 0.6s ease;
        opacity: 0;
    }
    
    .mini-game-card:hover::after {
        left: 100%;
        opacity: 1;
    }
    
    .mini-game-card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4), 0 0 0 2px rgba(102, 126, 234, 0.2);
    }
    
    .mini-game-card h3 {
        color: #667eea;
        margin: 10px 0;
        position: relative;
        z-index: 1;
        transition: all 0.3s ease;
    }
    
    /* Phase 2: Text gradient on hover */
    .mini-game-card:hover h3 {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        transform: scale(1.05);
    }
    
    .mini-game-card p {
        color: #666;
        font-size: 14px;
        position: relative;
        z-index: 1;
        transition: color 0.3s ease;
    }
    
    .mini-game-card:hover p {
        color: #444;
    }
    
    /* 3D Flip Card Animation */
    .memory-card-container {
        width: 100px;
        height: 100px;
        perspective: 1000px;
        cursor: pointer;
    }
    
    .memory-card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        transition: transform 0.6s;
        transform-style: preserve-3d;
    }
    
    .memory-card-front,
    .memory-card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 50px;
        border-radius: 15px;
        border: 3px solid #667eea;
        background: white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .memory-card-front {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .memory-card-back {
        transform: rotateY(180deg);
        background: white;
    }
    
    .memory-card-container:hover .memory-card-inner {
        transform: scale(1.05);
    }
    
    .memory-card-container.flipped .memory-card-inner {
        transform: rotateY(180deg);
    }
    
    .memory-card-container.matched .memory-card-inner {
        transform: rotateY(180deg);
    }
    
    .memory-card-container.matched .memory-card-back {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        border-color: #00f2fe;
        animation: matchPulse 0.6s ease-out;
    }
    
    @keyframes matchPulse {
        0%, 100% {
            transform: rotateY(180deg) scale(1);
        }
        50% {
            transform: rotateY(180deg) scale(1.2);
        }
    }
    
    @keyframes matchSuccess {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.15) rotate(5deg);
        }
        100% {
            transform: scale(1);
        }
    }
    
    /* Phase 1: Enhanced Popup Styles */
    .mini-game-popup {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
    }
    
    .mini-game-popup.active {
        display: flex;
        align-items: center;
        justify-content: center;
        animation: popupFadeIn 0.3s ease-out;
    }
    
    @keyframes popupFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .popup-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        transition: backdrop-filter 0.3s ease;
    }
    
    /* Phase 1: Enhanced blur on popup */
    .popup-overlay-blur {
        backdrop-filter: blur(10px);
    }
    
    .popup-content {
        position: relative;
        background: linear-gradient(135deg, #252A48 0%, #1E2139 100%);
        border: 2px solid rgba(99, 102, 241, 0.5);
        border-radius: 20px;
        padding: 40px;
        max-width: 450px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: popupSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    /* Phase 1: Enhanced popup content */
    .popup-content-enhanced {
        animation: popupSlideInBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    @keyframes popupSlideIn {
        from {
            opacity: 0;
            transform: scale(0.5) translateY(-50px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    
    @keyframes popupSlideInBounce {
        0% {
            opacity: 0;
            transform: scale(0.3) translateY(-100px);
        }
        50% {
            transform: scale(1.05) translateY(0);
        }
        100% {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    
    .popup-icon {
        font-size: 4rem;
        margin-bottom: 20px;
        animation: iconBounce 0.6s ease-out;
    }
    
    /* Phase 1: Enhanced icon bounce */
    .popup-icon-bounce {
        animation: iconBounceBig 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    @keyframes iconBounceBig {
        0% {
            transform: scale(0) rotate(-180deg);
        }
        50% {
            transform: scale(1.2) rotate(10deg);
        }
        100% {
            transform: scale(1) rotate(0deg);
        }
    }
    
    .popup-title {
        font-size: 1.8rem;
        color: #F9FAFB;
        margin-bottom: 15px;
    }
    
    /* Phase 1: Title slide animation */
    .popup-title-slide {
        animation: titleSlide 0.5s ease-out 0.2s both;
    }
    
    @keyframes titleSlide {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .popup-message {
        font-size: 1.1rem;
        color: #D1D5DB;
        line-height: 1.6;
        margin-bottom: 25px;
        white-space: pre-line;
    }
    
    /* Phase 1: Message fade animation */
    .popup-message-fade {
        animation: messageFade 0.6s ease-out 0.3s both;
    }
    
    @keyframes messageFade {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Phase 1: XP counter styling */
    #xpCounter {
        color: #10B981;
        font-weight: 700;
        font-size: 1.3em;
        transition: transform 0.2s ease;
    }
    
    .popup-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
        animation: buttonsFade 0.5s ease-out 0.5s both;
    }
    
    @keyframes buttonsFade {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .popup-btn {
        padding: 12px 30px;
        font-size: 1.05rem;
        font-weight: 600;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        position: relative;
        overflow: hidden;
    }
    
    /* Phase 1: Enhanced button hover with scale and glow */
    .popup-btn:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 8px 25px rgba(99, 102, 241, 0.6);
    }
    
    .popup-btn:active {
        transform: translateY(-1px) scale(0.98);
    }
    
    .popup-content.success {
        border-color: rgba(16, 185, 129, 0.5);
    }
    
    .popup-content.error {
        border-color: rgba(239, 68, 68, 0.5);
    }
    
    .popup-content.warning {
        border-color: rgba(245, 158, 11, 0.5);
    }
    
    /* Phase 1: Enhanced Quiz Category Cards */
    .quiz-category-card {
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .quiz-category-card:hover {
        transform: translateY(-10px) scale(1.08);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5) !important;
        filter: brightness(1.1);
    }
    
    .quiz-category-card:active {
        transform: translateY(-5px) scale(1.02);
    }
    
    /* Shape Finder Animations */
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .shape-finder-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
    
    /* Phase 2: Enhanced Mystery Box with Pulse */
    .mystery-box {
        position: relative;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .mystery-box::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%);
        transform: translate(-50%, -50%) scale(0);
        border-radius: 15px;
        transition: transform 0.6s ease;
        z-index: -1;
    }
    
    .mystery-box:hover:not(:disabled)::before {
        transform: translate(-50%, -50%) scale(1.5);
    }
    
    .mystery-box:hover:not(:disabled) {
        transform: scale(1.15) translateY(-8px) rotateZ(5deg);
        box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
        animation: boxPulse 0.6s ease-in-out infinite;
    }
    
    @keyframes boxPulse {
        0%, 100% { transform: scale(1.15) translateY(-8px) rotateZ(5deg); }
        50% { transform: scale(1.18) translateY(-10px) rotateZ(-5deg); }
    }
    
    .mystery-box:active:not(:disabled) {
        transform: scale(0.95);
        animation: none;
    }
    
    /* Phase 2: Shape Finder Enhanced */
    .shape-finder-btn {
        position: relative;
        transition: all 0.3s ease;
    }
    
    .shape-finder-btn::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 15px;
        box-shadow: 0 0 20px rgba(102, 126, 234, 0);
        transition: box-shadow 0.3s ease;
    }
    
    .shape-finder-btn:hover::after {
        box-shadow: 0 0 30px rgba(102, 126, 234, 0.8);
    }
    
    .shape-finder-btn:hover {
        transform: scale(1.15) rotateZ(10deg);
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
    }
    
    /* Phase 2: Loading State Shimmer */
    @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
    }
    
    .loading-shimmer {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 1000px 100%;
        animation: shimmer 2s infinite;
    }
    
    /* Phase 2: Micro-interactions - Ripple Effect */
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .ripple-effect {
        position: relative;
        overflow: hidden;
    }
    
    .ripple-effect::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        pointer-events: none;
    }
    
    .ripple-effect:active::after {
        animation: ripple 0.6s ease-out;
    }
    
    /* Phase 2: Neumorphism for Cards */
    .neuro-card {
        background: #e0e5ec;
        box-shadow: 9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5);
        transition: all 0.3s ease;
    }
    
    .neuro-card:hover {
        box-shadow: inset 9px 9px 16px rgba(163, 177, 198, 0.6), inset -9px -9px 16px rgba(255, 255, 255, 0.5);
    }
    
    /* Phase 2: Colored Shadows */
    .shadow-purple {
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    
    .shadow-green {
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
    }
    
    .shadow-orange {
        box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);
    }
    
    /* Phase 2: Text Glow Effect */
    .text-glow {
        text-shadow: 0 0 10px rgba(102, 126, 234, 0.5), 0 0 20px rgba(102, 126, 234, 0.3);
    }
    
    /* Phase 2: Smooth Screen Transitions */
    .screen {
        animation: screenFadeIn 0.4s ease-out;
    }
    
    @keyframes screenFadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Phase 3: CSS Confetti Particles */
    .confetti-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
    }
    
    .confetti {
        position: absolute;
        width: 10px;
        height: 10px;
        background: #667eea;
        animation: confettiFall 3s linear forwards;
    }
    
    @keyframes confettiFall {
        0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    /* Phase 3: Sparkle Effect */
    .sparkle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: white;
        border-radius: 50%;
        animation: sparkleFloat 1.5s ease-out forwards;
        pointer-events: none;
    }
    
    @keyframes sparkleFloat {
        0% {
            transform: translate(0, 0) scale(0);
            opacity: 1;
        }
        50% {
            transform: translate(var(--tx), var(--ty)) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(calc(var(--tx) * 2), calc(var(--ty) * 2)) scale(0);
            opacity: 0;
        }
    }
    
    /* Phase 3: Coin Rain Effect */
    .coin {
        position: absolute;
        font-size: 24px;
        animation: coinFall 2s ease-in forwards;
        pointer-events: none;
    }
    
    @keyframes coinFall {
        0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    /* Phase 3: Glow Pulse on Jackpot */
    .jackpot-glow {
        animation: jackpotPulse 1s ease-in-out infinite;
    }
    
    @keyframes jackpotPulse {
        0%, 100% {
            box-shadow: 0 0 20px rgba(243, 156, 18, 0.5), 0 0 40px rgba(243, 156, 18, 0.3);
        }
        50% {
            box-shadow: 0 0 40px rgba(243, 156, 18, 0.8), 0 0 80px rgba(243, 156, 18, 0.5);
        }
    }
    
    /* Phase 3: 3D Flip Effect for Lucky Draw */
    .box-3d-flip {
        animation: box3DFlip 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    @keyframes box3DFlip {
        0% {
            transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
        }
        50% {
            transform: perspective(1000px) rotateY(180deg) rotateX(20deg) scale(1.2);
        }
        100% {
            transform: perspective(1000px) rotateY(360deg) rotateX(0deg) scale(1);
        }
    }
    
    /* Phase 3: Light Ray Effect */
    .light-rays {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 200%;
        height: 200%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        animation: rotateRays 10s linear infinite;
    }
    
    @keyframes rotateRays {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
    }
    
    .light-ray {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 2px;
        height: 50%;
        background: linear-gradient(to bottom, rgba(255,255,255,0.8), transparent);
        transform-origin: top center;
    }
    
    /* Phase 3: Prize Showcase Animation */
    .prize-showcase {
        animation: prizeShowcase 1s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    @keyframes prizeShowcase {
        0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
        }
        50% {
            transform: scale(1.3) rotate(10deg);
        }
        100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
        }
    }
    
    /* Phase 3: Rarity Glow Effects */
    .rarity-common {
        box-shadow: 0 0 20px rgba(156, 163, 175, 0.5);
    }
    
    .rarity-uncommon {
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
        animation: uncommonGlow 2s ease-in-out infinite;
    }
    
    .rarity-rare {
        box-shadow: 0 0 30px rgba(59, 130, 246, 0.7);
        animation: rareGlow 1.5s ease-in-out infinite;
    }
    
    .rarity-epic {
        box-shadow: 0 0 40px rgba(139, 92, 246, 0.8);
        animation: epicGlow 1s ease-in-out infinite;
    }
    
    .rarity-legendary {
        box-shadow: 0 0 50px rgba(236, 72, 153, 1);
        animation: legendaryGlow 0.8s ease-in-out infinite;
    }
    
    @keyframes uncommonGlow {
        0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); }
        50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.9); }
    }
    
    @keyframes rareGlow {
        0%, 100% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.7); }
        50% { box-shadow: 0 0 45px rgba(59, 130, 246, 1); }
    }
    
    @keyframes epicGlow {
        0%, 100% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); }
        50% { box-shadow: 0 0 60px rgba(139, 92, 246, 1); }
    }
    
    @keyframes legendaryGlow {
        0%, 100% { 
            box-shadow: 0 0 50px rgba(236, 72, 153, 1), 0 0 100px rgba(236, 72, 153, 0.5);
            filter: hue-rotate(0deg);
        }
        50% { 
            box-shadow: 0 0 80px rgba(236, 72, 153, 1), 0 0 150px rgba(236, 72, 153, 0.8);
            filter: hue-rotate(30deg);
        }
    }
`;
document.head.appendChild(miniGameStyles);

// Export to window
window.SimpleMiniGames = SimpleMiniGames;
window.showMiniGameMenu = () => SimpleMiniGames.showMenu();

console.log('✅ Simple Mini-Games loaded!');



