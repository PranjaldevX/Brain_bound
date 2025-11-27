/**
 * BrainBound Game - Complete Core System
 * All game functions (optimized, no heavy animations)
 */

// ==================== GAME STATE ====================
let gameState = {
    currentPack: null,
    currentLevel: 0,
    playerXP: 0,
    playerLevel: 1,
    completedLevels: [],
    badges: [],
    dailyStreak: 0,
    settings: {
        sound: true,
        music: true,
        darkMode: false
    },
    levelStartTime: null,
    attempts: 0,
    hintsUsed: 0
};

// Data Storage
let levelPacks = {};
let currentPuzzleData = null;
let selectedItems = [];

// ==================== INITIALIZATION ====================

/**
 * Initialize Game
 */
async function initGame() {
    console.log('🎮 Initializing BrainBound Game...');
    
    // Initialize AI System
    if (typeof initAI === 'function') {
        initAI();
        loadAIState();
        console.log('🤖 AI System initialized!');
    }
    
    // Load game data FIRST (wait for it)
    await loadGameData();
    
    // Then load other stuff
    loadProgress();
    showMainMenu();
    updatePlayerStats();
    checkDailyStreak();
    
    console.log('✅ Game initialized!');
    console.log('📦 Packs available:', Object.keys(levelPacks));
}

/**
 * Load Game Data
 */
async function loadGameData() {
    try {
        console.log('📡 Loading level packs...');
        const packs = ['underwater', 'space', 'jungle'];
        
        // Try different base paths
        const basePaths = [
            '../',           // Parent directory
            './',            // Current directory
            '',              // Root
            '../../'         // Two levels up
        ];
        
        for (const pack of packs) {
            let loaded = false;
            
            for (const basePath of basePaths) {
                try {
                    const url = `${basePath}complete-level-pack-${pack}.json`;
                    console.log(`🔍 Trying: ${url}`);
                    
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        console.log(`❌ Failed (${response.status}): ${url}`);
                        continue;
                    }
                    
                    const data = await response.json();
                    levelPacks[pack] = data.levelPack;
                    console.log(`✅ Loaded ${pack} pack from ${url}:`, data.levelPack.levels.length, 'levels');
                    loaded = true;
                    break;
                } catch (error) {
                    // Try next path
                    continue;
                }
            }
            
            if (!loaded) {
                console.error(`❌ Could not load ${pack} pack from any path!`);
            }
        }
        
        console.log('📦 Total packs loaded:', Object.keys(levelPacks).length);
        
        if (Object.keys(levelPacks).length === 0) {
            console.error('❌ NO PACKS LOADED! Check file locations!');
            alert('Error: Could not load any level packs!\n\nPlease ensure JSON files are in the correct location.');
        }
        
        updateLoadStatus();
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
}

/**
 * Update Load Status
 */
function updateLoadStatus() {
    const statusEl = document.getElementById('loadStatus');
    if (statusEl) {
        const totalPacks = Object.keys(levelPacks).length;
        const totalLevels = Object.values(levelPacks).reduce((sum, pack) => sum + pack.levels.length, 0);
        statusEl.textContent = `${totalPacks} packs, ${totalLevels} levels ✓`;
    }
    
    // Update AI Status
    const aiStatusEl = document.getElementById('aiStatus');
    if (aiStatusEl) {
        if (typeof AI_CONFIG !== 'undefined' && AI_CONFIG.enabled) {
            aiStatusEl.textContent = '🤖 AI Enabled ✓';
            aiStatusEl.style.color = '#4caf50';
        } else {
            aiStatusEl.textContent = '⚠️ AI Disabled (Add API Key)';
            aiStatusEl.style.color = '#ff9800';
        }
    }
}

/**
 * Check Game Status
 */
function checkGameStatus() {
    const packs = Object.keys(levelPacks);
    let totalLevels = 0;
    let status = 'Game Status:\n\n';
    
    packs.forEach(pack => {
        const levels = levelPacks[pack].levels.length;
        totalLevels += levels;
        status += `${pack}: ${levels} levels\n`;
    });
    
    status += `\nTotal: ${totalLevels} levels\n`;
    status += `Player XP: ${gameState.playerXP}\n`;
    status += `Completed: ${gameState.completedLevels.length}\n`;
    status += `\n✅ All systems ready!`;
    
    alert(status);
}

// ==================== NAVIGATION ====================

/**
 * Show Screen
 */
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
    }
}

/**
 * Show Screen - Core Navigation Function
 */
function showScreen(screenId) {
    console.log('📺 Showing screen:', screenId);
    
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        targetScreen.style.display = 'block';
        console.log('✅ Screen shown:', screenId);
    } else {
        console.error('❌ Screen not found:', screenId);
    }
}

/**
 * Show Main Menu
 */
function showMainMenu() {
    showScreen('mainMenu');
    updatePlayerStats();
}

/**
 * Show Level Select
 */
function showLevelSelect() {
    if (!gameState.currentPack) {
        alert('Please select a level pack first!');
        return;
    }
    
    showScreen('levelSelect');
    displayLevelList();
}

/**
 * Show Profile
 */
function showProfile() {
    showScreen('profileScreen');
    updateProfileStats();
}

/**
 * Show Settings
 */
function showSettings() {
    showScreen('settingsScreen');
    loadSettings();
}

// ==================== LEVEL PACK SELECTION ====================

/**
 * Select Pack with Preview
 */
function selectPackWithPreview(packName) {
    console.log('🎯 Selecting pack:', packName);
    console.log('📦 Available packs:', Object.keys(levelPacks));
    
    if (!levelPacks[packName]) {
        console.error('❌ Pack not found:', packName);
        console.log('💡 Trying to reload packs...');
        
        // Try to reload
        loadGameData().then(() => {
            if (levelPacks[packName]) {
                console.log('✅ Pack loaded! Trying again...');
                selectPackWithPreview(packName);
            } else {
                alert(`Pack "${packName}" could not be loaded!\n\nPlease refresh the page and try again.`);
            }
        });
        return;
    }
    
    gameState.currentPack = packName;
    const pack = levelPacks[packName];
    
    console.log('✅ Pack selected:', pack.packTitle);
    console.log('📚 Levels available:', pack.levels.length);
    
    // Update pack title
    const titleEl = document.getElementById('packTitle');
    if (titleEl) {
        titleEl.textContent = pack.packTitle || packName;
    }
    
    showLevelSelect();
}

/**
 * Show Level Select Screen
 */
function showLevelSelect() {
    console.log('📋 Showing level select screen');
    showScreen('levelSelect');
    displayLevelList();
}

/**
 * Display Level List
 */
function displayLevelList() {
    console.log('📋 displayLevelList called');
    console.log('🎯 Current pack:', gameState.currentPack);
    
    const listEl = document.getElementById('levelList');
    if (!listEl) {
        console.error('❌ levelList element not found!');
        return;
    }
    
    console.log('✅ levelList element found');
    listEl.innerHTML = '<p style="color: white; text-align: center;">Loading levels...</p>';
    
    const pack = levelPacks[gameState.currentPack];
    
    console.log('📦 Pack data:', pack ? 'Found' : 'Not found');
    console.log('📚 Levels:', pack?.levels?.length || 0);
    
    if (!pack || !pack.levels || pack.levels.length === 0) {
        listEl.innerHTML = `
            <div style="padding: 40px; text-align: center; color: white;">
                <h3 style="color: #ef4444; margin-bottom: 20px;">⚠️ No Levels Available</h3>
                <p style="margin-bottom: 10px;">Pack: ${gameState.currentPack}</p>
                <p style="margin-bottom: 20px;">Levels found: ${pack?.levels?.length || 0}</p>
                <button onclick="showMainMenu()" style="padding: 10px 20px; cursor: pointer; background: #667eea; color: white; border: none; border-radius: 8px;">
                    ← Back to Menu
                </button>
            </div>
        `;
        return;
    }
    
    console.log('✅ Creating level cards...');
    listEl.innerHTML = '';
    
    pack.levels.forEach((level, index) => {
        const isCompleted = gameState.completedLevels.includes(`${gameState.currentPack}-${index}`);
        const isLocked = index > 0 && !gameState.completedLevels.includes(`${gameState.currentPack}-${index - 1}`);
        
        const card = document.createElement('div');
        card.className = 'level-card' + (isCompleted ? ' completed' : '') + (isLocked ? ' locked' : '');
        card.style.cssText = `
            background: linear-gradient(135deg, rgba(37, 42, 72, 0.9) 0%, rgba(30, 33, 57, 0.9) 100%);
            border: 2px solid rgba(99, 102, 241, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin: 10px 0;
            cursor: ${isLocked ? 'not-allowed' : 'pointer'};
            transition: all 0.3s ease;
            opacity: ${isLocked ? '0.6' : '1'};
        `;
        
        card.innerHTML = `
            <div class="level-number" style="font-size: 1.5rem; font-weight: bold; color: #667eea; margin-bottom: 8px;">
                Level ${level.levelNumber || (index + 1)}
            </div>
            <div class="level-name" style="font-size: 1.1rem; color: #F9FAFB; margin-bottom: 8px;">
                ${level.title || 'Untitled Level'}
            </div>
            <div class="level-xp" style="color: #10B981; font-weight: 600;">
                ${level.rewardBadge?.xp || 10} XP
            </div>
            ${isCompleted ? '<div class="level-status" style="color: #10B981; margin-top: 8px;">✓ Completed</div>' : ''}
            ${isLocked ? '<div class="level-status" style="color: #F59E0B; margin-top: 8px;">🔒 Locked</div>' : ''}
        `;
        
        if (!isLocked) {
            card.onclick = () => {
                console.log('🎮 Starting level:', index);
                startLevel(index);
            };
            card.onmouseenter = () => {
                card.style.transform = 'translateY(-4px)';
                card.style.borderColor = 'rgba(99, 102, 241, 0.8)';
            };
            card.onmouseleave = () => {
                card.style.transform = 'translateY(0)';
                card.style.borderColor = 'rgba(99, 102, 241, 0.3)';
            };
        }
        
        listEl.appendChild(card);
    });
    
    console.log(`✅ ${pack.levels.length} level cards created!`);
}

// ==================== LEVEL GAMEPLAY ====================

/**
 * Start Level
 */
async function startLevel(levelIndex) {
    const pack = levelPacks[gameState.currentPack];
    if (!pack || !pack.levels[levelIndex]) {
        alert('Level not found!');
        return;
    }
    
    gameState.currentLevel = levelIndex;
    gameState.levelStartTime = Date.now();
    gameState.attempts = 0;
    gameState.hintsUsed = 0;
    selectedItems = [];
    
    const level = pack.levels[levelIndex];
    
    console.log('📝 Original level data:', {
        title: level.title,
        puzzleType: level.puzzleType,
        hasPuzzleData: !!level.puzzleData
    });
    
    // Start with original level data
    currentPuzzleData = JSON.parse(JSON.stringify(level)); // Deep clone
    
    // AI: Calculate dynamic difficulty
    if (typeof calculateDifficulty === 'function') {
        try {
            const aiDifficulty = await calculateDifficulty(levelIndex + 1, {
                attempts: gameState.attempts,
                hintsUsed: gameState.hintsUsed
            });
            console.log(`🤖 AI Difficulty: ${aiDifficulty}/10`);
            
            // Apply adaptive challenge if AI enabled
            if (typeof getAdaptiveChallenge === 'function' && typeof AI_CONFIG !== 'undefined' && AI_CONFIG.enabled) {
                const adaptedPuzzle = await getAdaptiveChallenge(currentPuzzleData, aiDifficulty);
                if (adaptedPuzzle && adaptedPuzzle.puzzleType) {
                    currentPuzzleData = adaptedPuzzle;
                    console.log('✅ Applied adaptive challenge');
                } else {
                    console.warn('⚠️ Adaptive challenge returned invalid data, using original');
                }
            }
        } catch (error) {
            console.warn('⚠️ AI difficulty calculation failed:', error);
        }
    }
    
    console.log('📝 Final puzzle data:', {
        title: currentPuzzleData.title,
        puzzleType: currentPuzzleData.puzzleType,
        hasPuzzleData: !!currentPuzzleData.puzzleData
    });
    
    showScreen('gameScreen');
    displayLevel(currentPuzzleData);
}

/**
 * Display Level
 */
function displayLevel(level) {
    // Update title
    const titleEl = document.getElementById('levelTitle');
    if (titleEl) {
        titleEl.textContent = level.title;
    }
    
    // Update character dialogue
    const avatarEl = document.getElementById('characterAvatar');
    const dialogueEl = document.getElementById('characterDialogue');
    
    if (level.characterDialogue) {
        if (avatarEl) avatarEl.textContent = getCharacterEmoji(level.characterDialogue.character);
        if (dialogueEl) dialogueEl.textContent = level.characterDialogue.intro;
    }
    
    // Load puzzle
    const container = document.getElementById('puzzleContainer');
    if (container) {
        container.innerHTML = '';
        loadPuzzle(level, container);
    }
}

/**
 * Get Character Emoji
 */
function getCharacterEmoji(character) {
    const emojis = {
        'Marina the Mermaid': '🧜‍♀️',
        'Splash the Dolphin': '🐬',
        'Captain Crabby': '🦀',
        'Professor Pufferfish': '🐡',
        'Sunny the Seahorse': '🌊',
        'Captain Zara': '🚀',
        'Ranger Leo': '🦁'
    };
    return emojis[character] || '🎮';
}

/**
 * Load Puzzle
 */
function loadPuzzle(level, container) {
    console.log('🎮 Loading puzzle:', level.title);
    console.log('📝 Puzzle type:', level.puzzleType);
    console.log('📊 Puzzle data:', level.puzzleData);
    
    const type = level.puzzleType;
    
    if (!type) {
        console.error('❌ No puzzle type defined!');
        container.innerHTML = '<p style="color: red;">Error: No puzzle type defined!</p>';
        return;
    }
    
    if (!level.puzzleData) {
        console.error('❌ No puzzle data!');
        container.innerHTML = '<p style="color: red;">Error: No puzzle data!</p>';
        return;
    }
    
    console.log('✅ Loading puzzle type:', type);
    
    try {
        switch(type) {
            case 'Matching':
                if (typeof loadMatchingPuzzle === 'function') {
                    loadMatchingPuzzle(level.puzzleData, container);
                } else {
                    throw new Error('loadMatchingPuzzle function not found');
                }
                break;
            case 'PathBuilder':
                if (typeof loadPathBuilderPuzzle === 'function') {
                    loadPathBuilderPuzzle(level.puzzleData, container);
                } else {
                    throw new Error('loadPathBuilderPuzzle function not found');
                }
                break;
            case 'Sequence':
                if (typeof loadSequencePuzzle === 'function') {
                    loadSequencePuzzle(level.puzzleData, container);
                } else {
                    throw new Error('loadSequencePuzzle function not found');
                }
                break;
            case 'LogicGrid':
                if (typeof loadLogicGridPuzzle === 'function') {
                    loadLogicGridPuzzle(level.puzzleData, container);
                } else {
                    throw new Error('loadLogicGridPuzzle function not found');
                }
                break;
            case 'Mixed':
                if (typeof loadMixedPuzzle === 'function') {
                    loadMixedPuzzle(level.puzzleData, container);
                } else {
                    throw new Error('loadMixedPuzzle function not found');
                }
                break;
            default:
                console.error('❌ Unknown puzzle type:', type);
                console.log('📋 Available types: Matching, PathBuilder, Sequence, LogicGrid, Mixed');
                container.innerHTML = `
                    <div style="padding: 20px; text-align: center;">
                        <p style="color: #ff6b6b; font-size: 1.2rem; margin-bottom: 10px;">
                            ⚠️ Puzzle type "${type}" not supported yet
                        </p>
                        <p style="color: #fff; margin-bottom: 10px;">
                            Available types: Matching, PathBuilder, Sequence, LogicGrid, Mixed
                        </p>
                        <button onclick="showLevelSelect()" style="padding: 10px 20px; margin-top: 10px;">
                            ← Back to Levels
                        </button>
                    </div>
                `;
        }
    } catch (error) {
        console.error('❌ Error loading puzzle:', error);
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #fff;">
                <p style="color: #ff6b6b; font-size: 1.2rem; margin-bottom: 10px;">
                    ❌ Error: ${error.message}
                </p>
                <p style="margin-bottom: 10px;">
                    Puzzle type: ${type}
                </p>
                <p style="margin-bottom: 10px;">
                    Please check the console (F12) for more details.
                </p>
                <button onclick="showLevelSelect()" style="padding: 10px 20px; margin-top: 10px; cursor: pointer;">
                    ← Back to Levels
                </button>
            </div>
        `;
    }
}

// ==================== PUZZLE TYPES ====================

/**
 * Load Matching Puzzle
 */
function loadMatchingPuzzle(data, container) {
    console.log('🎯 Loading matching puzzle with data:', data);
    
    if (!data || !data.pairs || data.pairs.length === 0) {
        console.error('❌ Invalid matching puzzle data!');
        container.innerHTML = '<p style="color: red;">Error: Invalid puzzle data!</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="matching-puzzle">
            <div class="matching-instructions">
                <p>🎯 Match the items by clicking one from each column!</p>
            </div>
            <div class="matching-columns">
                <div class="matching-column left-column" id="leftColumn">
                    <h4>Items</h4>
                </div>
                <div class="matching-column right-column" id="rightColumn">
                    <h4>Match With</h4>
                </div>
            </div>
        </div>
    `;
    
    const leftCol = container.querySelector('#leftColumn');
    const rightCol = container.querySelector('#rightColumn');
    
    // Shuffle right items
    const rightItems = [...data.pairs.map(p => p.right)].sort(() => Math.random() - 0.5);
    
    console.log('📝 Creating left items:', data.pairs.map(p => p.left));
    console.log('📝 Creating right items (shuffled):', rightItems);
    
    // Use DocumentFragment for better performance (single reflow)
    const leftFragment = document.createDocumentFragment();
    const rightFragment = document.createDocumentFragment();
    
    data.pairs.forEach((pair, index) => {
        const leftItem = document.createElement('div');
        leftItem.className = 'match-item';
        leftItem.innerHTML = `<span>${pair.left}</span>`;
        leftItem.dataset.index = index;
        leftFragment.appendChild(leftItem);
    });
    
    rightItems.forEach((item, index) => {
        const rightItem = document.createElement('div');
        rightItem.className = 'match-item';
        rightItem.innerHTML = `<span>${item}</span>`;
        rightItem.dataset.value = item;
        rightFragment.appendChild(rightItem);
    });
    
    leftCol.appendChild(leftFragment);
    rightCol.appendChild(rightFragment);
    
    // Event Delegation - Single event listener instead of multiple
    leftCol.addEventListener('click', (e) => {
        if (e.target.closest('.match-item')) {
            selectMatchItem(e.target.closest('.match-item'), 'left');
        }
    });
    
    rightCol.addEventListener('click', (e) => {
        if (e.target.closest('.match-item')) {
            selectMatchItem(e.target.closest('.match-item'), 'right');
        }
    });
    
    console.log('✅ Matching puzzle loaded successfully!');
}

// Debouncing flag for performance
let isProcessingMatch = false;

/**
 * Select Match Item
 */
function selectMatchItem(element, side) {
    // Debounce rapid clicks
    if (isProcessingMatch) return;
    isProcessingMatch = true;
    
    // Remove previous selection from same side
    const column = element.parentElement;
    column.querySelectorAll('.match-item').forEach(item => {
        if (item !== element) item.classList.remove('selected');
    });
    
    element.classList.toggle('selected');
    
    // Check if both sides have selection
    const leftSelected = document.querySelector('#leftColumn .match-item.selected');
    const rightSelected = document.querySelector('#rightColumn .match-item.selected');
    
    if (leftSelected && rightSelected) {
        // Store the match but don't check correctness yet
        createMatchConnection(leftSelected, rightSelected);
    }
    
    // Reset debounce flag
    setTimeout(() => isProcessingMatch = false, 150);
}

/**
 * Create Match Connection (visual only, no validation)
 */
function createMatchConnection(leftItem, rightItem) {
    // Mark as connected (not matched yet)
    leftItem.classList.add('connected');
    rightItem.classList.add('connected');
    leftItem.classList.remove('selected');
    rightItem.classList.remove('selected');
    
    // Store the connection data
    leftItem.dataset.connectedTo = rightItem.dataset.value;
    rightItem.dataset.connectedFrom = leftItem.dataset.index;
}

/**
 * Check Match (called when user clicks Check Answer button)
 */
function checkMatch(leftItem, rightItem) {
    const level = currentPuzzleData;
    const leftIndex = parseInt(leftItem.dataset.index);
    const rightValue = rightItem.dataset.value;
    const correctRight = level.puzzleData.pairs[leftIndex].right;
    
    return rightValue === correctRight;
}

/**
 * Load Path Builder Puzzle
 */
function loadPathBuilderPuzzle(data, container) {
    const size = data.gridSize || 4;
    container.innerHTML = `
        <div class="path-grid" style="grid-template-columns: repeat(${size}, 1fr);"></div>
    `;
    
    const grid = container.querySelector('.path-grid');
    const obstacles = data.obstacles || [];
    const start = data.start || [0, 0];
    const end = data.end || [size-1, size-1];
    
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Check if obstacle
            const isObstacle = obstacles.some(obs => obs[0] === row && obs[1] === col);
            const isStart = start[0] === row && start[1] === col;
            const isEnd = end[0] === row && end[1] === col;
            
            if (isObstacle) {
                cell.classList.add('obstacle');
                cell.textContent = '🚫';
            } else if (isStart) {
                cell.classList.add('start');
                cell.textContent = '🚀';
            } else if (isEnd) {
                cell.classList.add('end');
                cell.textContent = '🎯';
            }
            
            if (!isObstacle && !isStart && !isEnd) {
                cell.onclick = () => togglePath(cell);
            }
            
            grid.appendChild(cell);
        }
    }
}

/**
 * Toggle Path
 */
function togglePath(cell) {
    cell.classList.toggle('path');
}

/**
 * Load Sequence Puzzle
 */
function loadSequencePuzzle(data, container) {
    container.innerHTML = `
        <div class="sequence-puzzle">
            <div class="sequence-target" id="sequenceTarget">
                <p>Drag items here in correct order</p>
            </div>
            <div class="sequence-items" id="sequenceItems"></div>
        </div>
    `;
    
    const itemsContainer = container.querySelector('#sequenceItems');
    const options = data.options || data.correctSequence;
    
    // Shuffle options
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    
    shuffled.forEach((item, index) => {
        const element = document.createElement('div');
        element.className = 'sequence-item';
        element.textContent = item;
        element.draggable = true;
        element.dataset.value = item;
        
        element.ondragstart = (e) => {
            e.dataTransfer.setData('text', item);
            element.classList.add('dragging');
        };
        
        element.ondragend = () => {
            element.classList.remove('dragging');
        };
        
        itemsContainer.appendChild(element);
    });
    
    // Make target droppable
    const target = container.querySelector('#sequenceTarget');
    target.ondragover = (e) => e.preventDefault();
    target.ondrop = (e) => {
        e.preventDefault();
        const value = e.dataTransfer.getData('text');
        const item = Array.from(itemsContainer.children).find(el => el.dataset.value === value);
        if (item) {
            target.appendChild(item);
            if (target.children.length === 1) {
                target.querySelector('p')?.remove();
            }
        }
    };
}

/**
 * Load Logic Grid Puzzle
 */
function loadLogicGridPuzzle(data, container) {
    container.innerHTML = `
        <div class="logic-grid">
            <div class="clues-section">
                <h4>Clues:</h4>
                ${data.clues.map(clue => `<div class="clue">${clue}</div>`).join('')}
            </div>
            <div class="grid-section">
                <p>Use the clues to solve the puzzle!</p>
                <button class="btn-primary" onclick="showLogicSolution()">Show Solution</button>
            </div>
        </div>
    `;
}

/**
 * Load Mixed Puzzle
 */
function loadMixedPuzzle(data, container) {
    container.innerHTML = `
        <div class="mixed-puzzle">
            <h4>Phase 1: Matching</h4>
            <div id="phase1"></div>
            <button class="btn-primary" onclick="nextPhase(2)" style="margin-top: 20px;">Next Phase →</button>
        </div>
    `;
    
    const phase1 = container.querySelector('#phase1');
    loadMatchingPuzzle(data.phase1, phase1);
}

// ==================== ANSWER CHECKING ====================

/**
 * Check Answer
 */
function checkAnswer() {
    gameState.attempts++;
    const level = currentPuzzleData;
    
    let isCorrect = false;
    
    switch(level.puzzleType) {
        case 'Matching':
            isCorrect = checkMatchingAnswer();
            break;
        case 'PathBuilder':
            isCorrect = checkPathAnswer();
            break;
        case 'Sequence':
            isCorrect = checkSequenceAnswer();
            break;
        case 'LogicGrid':
            isCorrect = true; // Logic puzzles are self-checking
            break;
        case 'Mixed':
            isCorrect = checkMixedAnswer();
            break;
    }
    
    if (isCorrect) {
        levelComplete();
    } else {
        showFeedback(false);
    }
}

/**
 * Check Matching Answer
 */
function checkMatchingAnswer() {
    const level = currentPuzzleData;
    const leftItems = document.querySelectorAll('#leftColumn .match-item');
    let allCorrect = true;
    let correctCount = 0;
    
    // Check each connection
    leftItems.forEach(leftItem => {
        const connectedTo = leftItem.dataset.connectedTo;
        const leftIndex = parseInt(leftItem.dataset.index);
        const correctRight = level.puzzleData.pairs[leftIndex].right;
        
        if (!connectedTo) {
            // Not connected yet
            allCorrect = false;
            leftItem.classList.add('wrong');
        } else if (connectedTo === correctRight) {
            // Correct match
            leftItem.classList.add('correct');
            leftItem.classList.remove('connected', 'wrong');
            
            // Find and mark the right item too
            const rightItem = document.querySelector(`#rightColumn .match-item[data-value="${connectedTo}"]`);
            if (rightItem) {
                rightItem.classList.add('correct');
                rightItem.classList.remove('connected', 'wrong');
            }
            correctCount++;
        } else {
            // Wrong match
            allCorrect = false;
            leftItem.classList.add('wrong');
            leftItem.classList.remove('connected');
            
            // Find and mark the right item too
            const rightItem = document.querySelector(`#rightColumn .match-item[data-value="${connectedTo}"]`);
            if (rightItem) {
                rightItem.classList.add('wrong');
                rightItem.classList.remove('connected');
            }
        }
    });
    
    // Show feedback
    if (allCorrect && correctCount === level.puzzleData.pairs.length) {
        setTimeout(() => {
            showNotification(
                'Perfect!',
                'All matches are correct! 🎉',
                'success'
            );
        }, 500);
        return true;
    } else {
        setTimeout(() => {
            showNotification(
                'Not Quite Right!',
                `✅ Correct: ${correctCount}/${level.puzzleData.pairs.length}\n\nRed items are wrong. Try again!`,
                'error'
            );
        }, 500);
        return false;
    }
}

/**
 * Check Path Answer
 */
function checkPathAnswer() {
    const pathCells = document.querySelectorAll('.grid-cell.path');
    return pathCells.length >= 3; // Simple check
}

/**
 * Check Sequence Answer
 */
function checkSequenceAnswer() {
    const target = document.querySelector('#sequenceTarget');
    const items = Array.from(target.children).filter(el => el.classList.contains('sequence-item'));
    const userSequence = items.map(el => el.dataset.value);
    const correctSequence = currentPuzzleData.puzzleData.correctSequence;
    
    return JSON.stringify(userSequence) === JSON.stringify(correctSequence);
}

/**
 * Check Mixed Answer
 */
function checkMixedAnswer() {
    return true; // Simplified
}

/**
 * Reset Puzzle
 */
function resetPuzzle() {
    const container = document.getElementById('puzzleContainer');
    if (container && currentPuzzleData) {
        loadPuzzle(currentPuzzleData, container);
        selectedItems = [];
    }
}

// ==================== LEVEL COMPLETION ====================

/**
 * Level Complete
 */
async function levelComplete() {
    const level = currentPuzzleData;
    const timeSpent = Math.floor((Date.now() - gameState.levelStartTime) / 1000);
    
    // Award XP
    const xp = level.rewardBadge?.xp || 10;
    gameState.playerXP += xp;
    
    // Mark as completed
    const levelId = `${gameState.currentPack}-${gameState.currentLevel}`;
    if (!gameState.completedLevels.includes(levelId)) {
        gameState.completedLevels.push(levelId);
    }
    
    // AI: Analyze performance
    if (typeof analyzePerformance === 'function') {
        const performance = analyzePerformance({
            success: true,
            attempts: gameState.attempts,
            hintsUsed: gameState.hintsUsed,
            timeSeconds: timeSpent
        });
        console.log('🤖 AI Performance Analysis:', performance);
    }
    
    // Save progress immediately (critical save)
    saveProgressNow();
    if (typeof saveAIState === 'function') {
        saveAIState();
    }
    updatePlayerStats();
    
    // AI: Get encouragement message
    let successMessage = level.characterDialogue?.success || "Great job!";
    if (typeof getEncouragementMessage === 'function' && AI_CONFIG.enabled) {
        try {
            const aiMessage = await getEncouragementMessage({
                success: true,
                attempts: gameState.attempts,
                timeSeconds: timeSpent
            });
            if (aiMessage) {
                successMessage = aiMessage;
            }
        } catch (error) {
            console.warn('AI message failed, using default');
        }
    }
    
    // Show success message
    showSuccessModal(level, xp, successMessage);
}

/**
 * Show Success Modal
 */
function showSuccessModal(level, xp, customMessage) {
    const message = customMessage || level.characterDialogue?.success || "Great job!";
    const funFact = level.funFact || "";
    
    // Calculate bonus XP based on performance
    let bonusXP = 0;
    if (gameState.attempts === 1 && gameState.hintsUsed === 0) {
        bonusXP = Math.floor(xp * 0.2); // 20% bonus for perfect
    }
    
    const totalXP = xp + bonusXP;
    const bonusText = bonusXP > 0 ? `\n\n🌟 Perfect! Bonus: +${bonusXP} XP` : '';
    
    // Award bonus XP
    if (bonusXP > 0) {
        gameState.playerXP += bonusXP;
        saveProgress();
    }
    
    // Show beautiful notification with Next Level and Retry buttons
    showNotification(
        'Level Complete! 🎉',
        `${message}\n\n+${totalXP} XP${bonusText}\n\n💡 Fun Fact: ${funFact}`,
        'success',
        [
            {
                text: 'Next Level →',
                primary: true,
                onClick: () => {
                    closeNotification();
                    const currentLevelIndex = gameState.currentLevel;
                    const pack = levelPacks[gameState.currentPack];
                    if (pack && pack.levels && currentLevelIndex < pack.levels.length - 1) {
                        startLevel(currentLevelIndex + 1);
                    } else {
                        showLevelSelect();
                    }
                }
            },
            {
                text: '🔄 Retry',
                primary: false,
                onClick: () => {
                    closeNotification();
                    startLevel(gameState.currentLevel);
                }
            }
        ]
    );
}

/**
 * Show Feedback
 */
async function showFeedback(success) {
    let message = success ? "Correct! 🎉" : "Not quite! Try again! 💪";
    
    // AI: Get encouraging feedback
    if (typeof getEncouragementMessage === 'function' && AI_CONFIG.enabled) {
        const aiMessage = await getEncouragementMessage({
            success: success,
            attempts: gameState.attempts,
            timeSeconds: Math.floor((Date.now() - gameState.levelStartTime) / 1000)
        });
        if (aiMessage) {
            message = aiMessage;
        }
    }
    
    if (!success) {
        showNotification(
            'Try Again!',
            message,
            'warning',
            [
                {
                    text: '🔄 Retry',
                    primary: true,
                    onClick: () => {
                        closeNotification();
                        startLevel(gameState.currentLevel);
                    }
                }
            ]
        );
    } else {
        showNotification(
            'Correct!',
            message,
            'success'
        );
    }
}

// ==================== HINTS ====================

/**
 * Show Hint
 */
async function showHint() {
    gameState.hintsUsed++;
    const level = currentPuzzleData;
    
    let hint = level.hint || "Think carefully!";
    
    // AI: Get smart contextual hint
    if (typeof getAIHint === 'function' && AI_CONFIG.enabled) {
        console.log('🤖 Generating AI hint...');
        const aiHint = await getAIHint(
            level.puzzleData, 
            {
                title: level.title,
                type: level.puzzleType
            },
            gameState.attempts
        );
        if (aiHint) {
            hint = aiHint;
            console.log('✅ AI hint generated!');
        }
    }
    
    const hintModal = document.getElementById('hintModal');
    const hintText = document.getElementById('hintText');
    
    if (hintModal && hintText) {
        hintText.textContent = hint;
        hintModal.classList.add('active');
    } else {
        showNotification('Hint 💡', hint, 'info');
    }
}

/**
 * Close Hint
 */
function closeHint() {
    const hintModal = document.getElementById('hintModal');
    if (hintModal) {
        hintModal.classList.remove('active');
    }
}

// ==================== NOTIFICATION SYSTEM ====================

/**
 * Show Notification (replaces alert)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Type: 'success', 'error', 'info', 'warning'
 * @param {Array} buttons - Optional custom buttons [{text, onClick}]
 */
function showNotification(title, message, type = 'info', buttons = null) {
    const modal = document.getElementById('notificationModal');
    const icon = document.getElementById('notificationIcon');
    const titleEl = document.getElementById('notificationTitle');
    const messageEl = document.getElementById('notificationMessage');
    const buttonsEl = document.getElementById('notificationButtons');
    
    if (!modal) return;
    
    // Set icon based on type
    const icons = {
        success: '🎉',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    icon.textContent = icons[type] || icons.info;
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // Remove previous type classes
    modal.classList.remove('success', 'error', 'info', 'warning');
    modal.classList.add(type);
    
    // Setup buttons
    if (buttons && buttons.length > 0) {
        buttonsEl.innerHTML = '';
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = btn.primary ? 'btn-primary' : 'btn-secondary';
            button.textContent = btn.text;
            button.onclick = () => {
                if (btn.onClick) btn.onClick();
                closeNotification();
            };
            buttonsEl.appendChild(button);
        });
    } else {
        buttonsEl.innerHTML = '<button class="btn-primary" onclick="closeNotification()">OK</button>';
    }
    
    // Show modal
    modal.classList.add('active');
}

/**
 * Close Notification
 */
function closeNotification() {
    const modal = document.getElementById('notificationModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ==================== PROGRESS & STATS ====================

/**
 * Update Player Stats
 */
function updatePlayerStats() {
    const xpEl = document.getElementById('playerXP');
    const levelEl = document.getElementById('playerLevel');
    
    if (xpEl) xpEl.textContent = gameState.playerXP;
    if (levelEl) levelEl.textContent = gameState.playerLevel;
    
    // Calculate level from XP
    gameState.playerLevel = Math.floor(gameState.playerXP / 100) + 1;
}

/**
 * Update Profile Stats
 */
function updateProfileStats() {
    document.getElementById('profileLevel').textContent = gameState.playerLevel;
    document.getElementById('totalXP').textContent = gameState.playerXP;
    document.getElementById('levelsCompleted').textContent = gameState.completedLevels.length;
    document.getElementById('badgesEarned').textContent = gameState.badges.length;
    document.getElementById('currentStreak').textContent = gameState.dailyStreak;
}

// Debounced save for better performance
let saveTimeout;

/**
 * Save Progress (Debounced)
 */
function saveProgress() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        try {
            localStorage.setItem('brainbound_progress', JSON.stringify(gameState));
            console.log('💾 Progress saved');
        } catch (error) {
            console.error('❌ Save failed:', error);
        }
    }, 1000); // Save after 1 second of inactivity
}

/**
 * Save Progress Immediately (for critical saves)
 */
function saveProgressNow() {
    clearTimeout(saveTimeout);
    try {
        localStorage.setItem('brainbound_progress', JSON.stringify(gameState));
        console.log('💾 Progress saved immediately');
    } catch (error) {
        console.error('❌ Save failed:', error);
    }
}

/**
 * Load Progress
 */
function loadProgress() {
    const saved = localStorage.getItem('brainbound_progress');
    if (saved) {
        const data = JSON.parse(saved);
        gameState = { ...gameState, ...data };
        console.log('📂 Progress loaded');
    }
}

/**
 * Reset Progress
 */
function resetProgress() {
    if (confirm('Are you sure you want to reset all progress?')) {
        gameState = {
            currentPack: null,
            currentLevel: 0,
            playerXP: 0,
            playerLevel: 1,
            completedLevels: [],
            badges: [],
            dailyStreak: 0,
            settings: gameState.settings
        };
        saveProgress();
        alert('Progress reset!');
        showMainMenu();
    }
}

// ==================== SETTINGS ====================

/**
 * Load Settings
 */
function loadSettings() {
    document.getElementById('soundToggle').checked = gameState.settings.sound;
    document.getElementById('musicToggle').checked = gameState.settings.music;
    document.getElementById('darkModeToggle').checked = gameState.settings.darkMode;
}

/**
 * Toggle Sound
 */
function toggleSound() {
    gameState.settings.sound = document.getElementById('soundToggle').checked;
    saveProgress();
}

/**
 * Toggle Music
 */
function toggleMusic() {
    gameState.settings.music = document.getElementById('musicToggle').checked;
    saveProgress();
}

/**
 * Toggle Dark Mode
 */
function toggleDarkMode() {
    gameState.settings.darkMode = document.getElementById('darkModeToggle').checked;
    document.body.classList.toggle('dark-mode', gameState.settings.darkMode);
    saveProgress();
}

// ==================== DAILY STREAK ====================

/**
 * Check Daily Streak
 */
function checkDailyStreak() {
    const lastPlayed = localStorage.getItem('last_played_date');
    const today = new Date().toDateString();
    
    if (lastPlayed === today) {
        // Already played today
        return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastPlayed === yesterday.toDateString()) {
        // Streak continues
        gameState.dailyStreak++;
    } else if (lastPlayed) {
        // Streak broken
        gameState.dailyStreak = 1;
    } else {
        // First time
        gameState.dailyStreak = 1;
    }
    
    localStorage.setItem('last_played_date', today);
    saveProgress();
}

// ==================== MINI GAMES ====================

/**
 * Show Mini Game Menu
 */
function showMiniGameMenu() {
    alert('🎮 Mini-games coming soon!\n\nStay tuned for exciting mini-games!');
}

/**
 * Show Safari Mode
 */
function showSafariMode(mode) {
    alert('📸 Safari Mode coming soon!\n\nExplore and photograph animals!');
}

/**
 * Show Customization
 */
function showCustomization() {
    alert('🎨 Customization coming soon!\n\nPersonalize your experience!');
}

// ==================== INITIALIZATION ====================

// Start game when page loads
window.addEventListener('DOMContentLoaded', initGame);

console.log('✅ Game Core loaded successfully');


// ==================== AI INTEGRATION ENHANCEMENTS ====================

/**
 * Enhanced Start Level with AI
 */
const originalStartLevel = startLevel;
startLevel = function(levelIndex) {
    // Call original function
    originalStartLevel(levelIndex);
    
    // AI Enhancement: Calculate and apply difficulty
    if (typeof calculateDifficulty === 'function' && AI_CONFIG && AI_CONFIG.enabled) {
        const aiDifficulty = calculateDifficulty(levelIndex + 1, {
            attempts: gameState.attempts,
            hintsUsed: gameState.hintsUsed
        });
        console.log(`🤖 AI Difficulty Level: ${aiDifficulty}/10`);
    }
};

/**
 * Enhanced Show Hint with AI
 */
const originalShowHint = showHint;
showHint = async function() {
    gameState.hintsUsed++;
    const level = currentPuzzleData;
    
    let hint = level.hint || "Think carefully!";
    
    // Try to get AI-generated hint
    if (typeof getAIHint === 'function' && AI_CONFIG && AI_CONFIG.enabled) {
        try {
            console.log('🤖 Generating AI hint...');
            const aiHint = await getAIHint(
                { type: level.puzzleType, data: level.puzzleData },
                { title: level.title, story: level.miniStory },
                gameState.attempts
            );
            if (aiHint) {
                hint = aiHint;
                console.log('✅ AI hint generated!');
            }
        } catch (error) {
            console.warn('⚠️ AI hint failed, using default:', error);
        }
    }
    
    const hintModal = document.getElementById('hintModal');
    const hintText = document.getElementById('hintText');
    
    if (hintModal && hintText) {
        hintText.textContent = hint;
        hintModal.classList.add('active');
    } else {
        alert(`💡 Hint:\n\n${hint}`);
    }
};

/**
 * Enhanced Level Complete with AI
 */
const originalLevelComplete = levelComplete;
levelComplete = async function() {
    const level = currentPuzzleData;
    const timeSpent = Math.floor((Date.now() - gameState.levelStartTime) / 1000);
    
    // AI: Analyze performance
    if (typeof analyzePerformance === 'function' && AI_CONFIG && AI_CONFIG.enabled) {
        const performance = {
            success: true,
            attempts: gameState.attempts,
            hintsUsed: gameState.hintsUsed,
            timeSeconds: timeSpent,
            levelNumber: gameState.currentLevel + 1
        };
        
        const analysis = analyzePerformance(performance);
        console.log('🤖 AI Performance Analysis:', analysis);
        
        // Get AI encouragement
        if (typeof getEncouragementMessage === 'function') {
            try {
                const encouragement = await getEncouragementMessage(performance);
                console.log('🤖 AI Encouragement:', encouragement);
            } catch (error) {
                console.warn('⚠️ AI encouragement failed:', error);
            }
        }
        
        // Save AI state
        if (typeof saveAIState === 'function') {
            saveAIState();
        }
    }
    
    // Call original function
    originalLevelComplete();
};

/**
 * Enhanced Check Answer with AI
 */
const originalCheckAnswer = checkAnswer;
checkAnswer = function() {
    gameState.attempts++;
    
    // AI: Track attempt
    if (AI_CONFIG && AI_CONFIG.enabled) {
        console.log(`🤖 Attempt #${gameState.attempts}`);
    }
    
    // Call original function
    originalCheckAnswer();
};

/**
 * AI Status Display
 */
function displayAIStatus() {
    const statusEl = document.getElementById('loadStatus');
    if (statusEl && AI_CONFIG) {
        const aiStatus = AI_CONFIG.enabled ? '🤖 AI Active' : '🤖 AI Disabled';
        const currentText = statusEl.textContent;
        if (!currentText.includes('AI')) {
            statusEl.textContent = currentText + ' | ' + aiStatus;
        }
    }
}

// Display AI status on load
setTimeout(displayAIStatus, 1000);

console.log('🤖 AI Integration Enhanced!');


// ==================== AI TESTING & STATUS ====================

/**
 * Update AI Status Display
 */
function updateAIStatus() {
    const aiStatusEl = document.getElementById('aiStatus');
    if (aiStatusEl && typeof AI_CONFIG !== 'undefined') {
        if (AI_CONFIG.enabled && AI_CONFIG.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
            aiStatusEl.textContent = '🤖 Active & Ready';
            aiStatusEl.style.color = '#4caf50';
        } else if (AI_CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            aiStatusEl.textContent = '⚠️ Need API Key';
            aiStatusEl.style.color = '#ff9800';
        } else {
            aiStatusEl.textContent = '❌ Disabled';
            aiStatusEl.style.color = '#f44336';
        }
    }
}

/**
 * Test AI System
 */
async function testAI() {
    console.log('🧪 Testing AI System...');
    
    if (typeof AI_CONFIG === 'undefined') {
        alert('❌ AI system not loaded!\n\nMake sure ai-integration.js is included.');
        return;
    }
    
    let report = '🤖 AI System Test Report\n\n';
    
    // Test 1: Configuration
    report += '1. Configuration:\n';
    report += `   - API Key: ${AI_CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE' ? '❌ Not set' : '✅ Set'}\n`;
    report += `   - Enabled: ${AI_CONFIG.enabled ? '✅ Yes' : '❌ No'}\n`;
    report += `   - URL: ${AI_CONFIG.GEMINI_API_URL ? '✅ Set' : '❌ Missing'}\n\n`;
    
    // Test 2: Functions
    report += '2. Functions Available:\n';
    report += `   - initAI: ${typeof initAI === 'function' ? '✅' : '❌'}\n`;
    report += `   - calculateDifficulty: ${typeof calculateDifficulty === 'function' ? '✅' : '❌'}\n`;
    report += `   - getAIHint: ${typeof getAIHint === 'function' ? '✅' : '❌'}\n`;
    report += `   - analyzePerformance: ${typeof analyzePerformance === 'function' ? '✅' : '❌'}\n`;
    report += `   - getAdaptiveChallenge: ${typeof getAdaptiveChallenge === 'function' ? '✅' : '❌'}\n\n`;
    
    // Test 3: Difficulty Calculation
    if (typeof calculateDifficulty === 'function') {
        report += '3. Difficulty Test:\n';
        const testDiff = calculateDifficulty(10, { attempts: 1, hintsUsed: 0 });
        report += `   - Level 10 Difficulty: ${testDiff}/10 ✅\n\n`;
    }
    
    // Test 4: API Connection (if enabled)
    if (AI_CONFIG.enabled && AI_CONFIG.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
        report += '4. API Connection:\n';
        report += '   Testing... (this may take a moment)\n';
        
        try {
            if (typeof getAIHint === 'function') {
                const testHint = await getAIHint(
                    { type: 'Matching', data: {} },
                    { title: 'Test Level', story: 'Test' },
                    1
                );
                report += testHint ? '   ✅ API Working!\n' : '   ⚠️ API returned empty\n';
            }
        } catch (error) {
            report += `   ❌ API Error: ${error.message}\n`;
        }
    } else {
        report += '4. API Connection:\n';
        report += '   ⚠️ Skipped (AI not enabled or no API key)\n';
    }
    
    report += '\n';
    
    // Summary
    if (AI_CONFIG.enabled && AI_CONFIG.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
        report += '✅ AI System is READY!\n';
        report += '\nAI Features Active:\n';
        report += '- Dynamic difficulty adjustment\n';
        report += '- Smart contextual hints\n';
        report += '- Performance tracking\n';
        report += '- Adaptive challenges\n';
        report += '- Encouragement messages\n';
    } else {
        report += '⚠️ AI System is NOT ACTIVE\n\n';
        report += 'To enable AI:\n';
        report += '1. Get API key from: https://makersuite.google.com/app/apikey\n';
        report += '2. Open: brainbound-game/ai-integration.js\n';
        report += '3. Replace YOUR_GEMINI_API_KEY_HERE with your key\n';
        report += '4. Set enabled: true\n';
        report += '\nSee AI-SETUP-GUIDE.md for details!';
    }
    
    alert(report);
    console.log(report);
}

// Update AI status on load
setTimeout(() => {
    updateAIStatus();
    
    // Log AI status
    if (typeof AI_CONFIG !== 'undefined') {
        if (AI_CONFIG.enabled && AI_CONFIG.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
            console.log('✅ AI System is ACTIVE and READY!');
            console.log('🤖 Features: Dynamic difficulty, Smart hints, Performance tracking');
        } else {
            console.log('⚠️ AI System is DISABLED');
            console.log('💡 To enable: Add API key in ai-integration.js');
            console.log('📖 Guide: See AI-SETUP-GUIDE.md');
        }
    }
}, 1500);

console.log('✅ AI Integration Complete!');


// ==================== NUMBER QUIZ PUZZLE ====================

/**
 * Load Number Quiz Puzzle
 */
function loadNumberQuizPuzzle(data, container) {
    container.innerHTML = `
        <div class="number-quiz">
            <div class="quiz-question">
                <h3>${data.question || 'Solve the problem!'}</h3>
                <div class="quiz-problem" id="quizProblem">${data.problem || '2 + 2 = ?'}</div>
            </div>
            <div class="quiz-options" id="quizOptions"></div>
            <div class="quiz-feedback" id="quizFeedback"></div>
        </div>
    `;
    
    const optionsContainer = container.querySelector('#quizOptions');
    const options = data.options || [2, 3, 4, 5];
    const correctAnswer = data.correctAnswer || 4;
    
    // Shuffle options
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    
    shuffled.forEach(option => {
        const button = document.createElement('button');
        button.className = 'quiz-option';
        button.textContent = option;
        button.onclick = () => checkNumberQuizAnswer(option, correctAnswer, button);
        optionsContainer.appendChild(button);
    });
}

/**
 * Check Number Quiz Answer
 */
function checkNumberQuizAnswer(selected, correct, button) {
    const feedback = document.getElementById('quizFeedback');
    const allButtons = document.querySelectorAll('.quiz-option');
    
    // Disable all buttons
    allButtons.forEach(btn => btn.disabled = true);
    
    if (selected === correct) {
        button.classList.add('correct');
        feedback.innerHTML = '✅ Correct! Great job!';
        feedback.className = 'quiz-feedback correct';
        
        // Auto-complete after 1 second
        setTimeout(() => {
            levelComplete();
        }, 1500);
    } else {
        button.classList.add('incorrect');
        feedback.innerHTML = '❌ Try again!';
        feedback.className = 'quiz-feedback incorrect';
        
        gameState.attempts++;
        
        // Re-enable buttons after 1 second
        setTimeout(() => {
            allButtons.forEach(btn => {
                if (!btn.classList.contains('incorrect')) {
                    btn.disabled = false;
                }
            });
            feedback.innerHTML = '';
        }, 1000);
    }
}

/**
 * Generate Number Quiz
 * Creates math problems based on difficulty
 */
function generateNumberQuiz(difficulty) {
    const operations = ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * Math.min(difficulty, 4))];
    
    let num1, num2, answer, problem;
    
    switch(operation) {
        case '+':
            num1 = Math.floor(Math.random() * (10 * difficulty)) + 1;
            num2 = Math.floor(Math.random() * (10 * difficulty)) + 1;
            answer = num1 + num2;
            problem = `${num1} + ${num2} = ?`;
            break;
            
        case '-':
            num1 = Math.floor(Math.random() * (10 * difficulty)) + 10;
            num2 = Math.floor(Math.random() * num1) + 1;
            answer = num1 - num2;
            problem = `${num1} - ${num2} = ?`;
            break;
            
        case '×':
            num1 = Math.floor(Math.random() * Math.min(10, difficulty)) + 1;
            num2 = Math.floor(Math.random() * Math.min(10, difficulty)) + 1;
            answer = num1 * num2;
            problem = `${num1} × ${num2} = ?`;
            break;
            
        case '÷':
            num2 = Math.floor(Math.random() * Math.min(10, difficulty)) + 1;
            answer = Math.floor(Math.random() * Math.min(10, difficulty)) + 1;
            num1 = num2 * answer;
            problem = `${num1} ÷ ${num2} = ?`;
            break;
    }
    
    // Generate wrong options
    const options = [answer];
    while (options.length < 4) {
        const wrong = answer + Math.floor(Math.random() * 10) - 5;
        if (wrong > 0 && !options.includes(wrong)) {
            options.push(wrong);
        }
    }
    
    return {
        question: 'Solve this math problem!',
        problem: problem,
        correctAnswer: answer,
        options: options,
        instruction: 'Choose the correct answer!'
    };
}

/**
 * Load Counting Puzzle
 */
function loadCountingPuzzle(data, container) {
    container.innerHTML = `
        <div class="counting-puzzle">
            <div class="counting-question">
                <h3>Count the items!</h3>
                <div class="counting-items" id="countingItems"></div>
            </div>
            <div class="counting-input">
                <label>How many do you see?</label>
                <input type="number" id="countInput" min="0" max="100" placeholder="Enter number">
                <button class="btn-primary" onclick="checkCountingAnswer()">Check Answer</button>
            </div>
        </div>
    `;
    
    const itemsContainer = container.querySelector('#countingItems');
    const emoji = data.emoji || '🐠';
    const count = data.count || 5;
    
    // Display items to count
    for (let i = 0; i < count; i++) {
        const item = document.createElement('span');
        item.className = 'counting-item';
        item.textContent = emoji;
        item.style.fontSize = '40px';
        item.style.margin = '10px';
        itemsContainer.appendChild(item);
    }
    
    // Store correct answer
    container.dataset.correctCount = count;
}

/**
 * Check Counting Answer
 */
function checkCountingAnswer() {
    const input = document.getElementById('countInput');
    const userAnswer = parseInt(input.value);
    const correctAnswer = parseInt(document.querySelector('.counting-puzzle').dataset.correctCount);
    
    if (isNaN(userAnswer)) {
        alert('Please enter a number!');
        return;
    }
    
    gameState.attempts++;
    
    if (userAnswer === correctAnswer) {
        alert('✅ Correct! You counted perfectly!');
        levelComplete();
    } else {
        alert(`❌ Not quite! Try counting again!`);
        input.value = '';
        input.focus();
    }
}

/**
 * Load Number Sequence Puzzle
 */
function loadNumberSequencePuzzle(data, container) {
    container.innerHTML = `
        <div class="number-sequence-puzzle">
            <div class="sequence-question">
                <h3>Complete the number sequence!</h3>
                <div class="number-sequence" id="numberSequence"></div>
            </div>
            <div class="sequence-options" id="sequenceOptions"></div>
        </div>
    `;
    
    const sequenceContainer = container.querySelector('#numberSequence');
    const optionsContainer = container.querySelector('#sequenceOptions');
    
    const sequence = data.sequence || [2, 4, 6, '?', 10];
    const correctAnswer = data.correctAnswer || 8;
    const options = data.options || [6, 7, 8, 9];
    
    // Display sequence
    sequence.forEach(num => {
        const item = document.createElement('div');
        item.className = 'sequence-number';
        item.textContent = num;
        if (num === '?') {
            item.classList.add('missing');
        }
        sequenceContainer.appendChild(item);
    });
    
    // Display options
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'sequence-option';
        button.textContent = option;
        button.onclick = () => checkSequenceAnswer(option, correctAnswer, button);
        optionsContainer.appendChild(button);
    });
}

/**
 * Check Number Sequence Answer
 */
function checkSequenceAnswer(selected, correct, button) {
    const allButtons = document.querySelectorAll('.sequence-option');
    allButtons.forEach(btn => btn.disabled = true);
    
    if (selected === correct) {
        button.classList.add('correct');
        
        // Fill in the missing number
        const missing = document.querySelector('.sequence-number.missing');
        if (missing) {
            missing.textContent = correct;
            missing.classList.remove('missing');
            missing.classList.add('revealed');
        }
        
        setTimeout(() => {
            alert('✅ Perfect! You found the pattern!');
            levelComplete();
        }, 1000);
    } else {
        button.classList.add('incorrect');
        gameState.attempts++;
        
        setTimeout(() => {
            allButtons.forEach(btn => {
                if (!btn.classList.contains('incorrect')) {
                    btn.disabled = false;
                }
            });
        }, 1000);
    }
}

/**
 * Load Comparison Puzzle
 */
function loadComparisonPuzzle(data, container) {
    container.innerHTML = `
        <div class="comparison-puzzle">
            <div class="comparison-question">
                <h3>Which is ${data.type || 'bigger'}?</h3>
                <div class="comparison-items">
                    <button class="comparison-item" onclick="checkComparison('left')">
                        <div class="comparison-number">${data.left || 5}</div>
                    </button>
                    <div class="comparison-vs">VS</div>
                    <button class="comparison-item" onclick="checkComparison('right')">
                        <div class="comparison-number">${data.right || 8}</div>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Store correct answer
    container.dataset.comparisonType = data.type || 'bigger';
    container.dataset.leftValue = data.left || 5;
    container.dataset.rightValue = data.right || 8;
}

/**
 * Check Comparison Answer
 */
function checkComparison(choice) {
    const puzzle = document.querySelector('.comparison-puzzle');
    const type = puzzle.dataset.comparisonType;
    const left = parseInt(puzzle.dataset.leftValue);
    const right = parseInt(puzzle.dataset.rightValue);
    
    let correct = false;
    
    if (type === 'bigger' || type === 'larger') {
        correct = (choice === 'left' && left > right) || (choice === 'right' && right > left);
    } else if (type === 'smaller') {
        correct = (choice === 'left' && left < right) || (choice === 'right' && right < left);
    }
    
    gameState.attempts++;
    
    if (correct) {
        alert('✅ Correct! You chose the right number!');
        levelComplete();
    } else {
        alert('❌ Try again! Think carefully!');
    }
}

console.log('✅ Number Quiz puzzles loaded!');


// ==================== NUMBER QUIZ PUZZLE ====================

/**
 * Load Number Quiz Puzzle
 */
function loadNumberQuizPuzzle(data, container) {
    container.innerHTML = `
        <div class="number-quiz">
            <div class="quiz-question">
                <h3>${data.question || 'Solve the problem!'}</h3>
                <div class="quiz-problem" id="quizProblem">${data.problem || '2 + 2 = ?'}</div>
            </div>
            <div class="quiz-options" id="quizOptions"></div>
            <div class="quiz-feedback" id="quizFeedback"></div>
        </div>
    `;
    
    const optionsContainer = container.querySelector('#quizOptions');
    const options = data.options || [2, 3, 4, 5];
    const correctAnswer = data.correctAnswer || 4;
    
    // Shuffle options
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    
    shuffled.forEach(option => {
        const button = document.createElement('button');
        button.className = 'quiz-option';
        button.textContent = option;
        button.onclick = () => checkNumberQuizAnswer(option, correctAnswer, button);
        optionsContainer.appendChild(button);
    });
}

/**
 * Check Number Quiz Answer
 */
function checkNumberQuizAnswer(selected, correct, button) {
    const feedback = document.getElementById('quizFeedback');
    const allButtons = document.querySelectorAll('.quiz-option');
    
    // Disable all buttons
    allButtons.forEach(btn => btn.disabled = true);
    
    if (selected === correct) {
        button.classList.add('correct');
        feedback.innerHTML = '✅ Correct! Great job!';
        feedback.className = 'quiz-feedback correct';
        
        // Auto-complete after 1 second
        setTimeout(() => {
            levelComplete();
        }, 1500);
    } else {
        button.classList.add('incorrect');
        feedback.innerHTML = '❌ Try again!';
        feedback.className = 'quiz-feedback incorrect';
        
        gameState.attempts++;
        
        // Re-enable buttons after 1 second
        setTimeout(() => {
            allButtons.forEach(btn => {
                if (!btn.classList.contains('incorrect')) {
                    btn.disabled = false;
                }
            });
            feedback.innerHTML = '';
        }, 1000);
    }
}

/**
 * Generate Number Quiz
 * Creates math problems based on difficulty
 */
function generateNumberQuiz(difficulty) {
    const operations = ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * Math.min(difficulty, 4))];
    
    let num1, num2, answer, problem;
    
    switch(operation) {
        case '+':
            num1 = Math.floor(Math.random() * (10 * difficulty)) + 1;
            num2 = Math.floor(Math.random() * (10 * difficulty)) + 1;
            answer = num1 + num2;
            problem = `${num1} + ${num2} = ?`;
            break;
            
        case '-':
            num1 = Math.floor(Math.random() * (10 * difficulty)) + 10;
            num2 = Math.floor(Math.random() * num1) + 1;
            answer = num1 - num2;
            problem = `${num1} - ${num2} = ?`;
            break;
            
        case '×':
            num1 = Math.floor(Math.random() * Math.min(10, difficulty)) + 1;
            num2 = Math.floor(Math.random() * Math.min(10, difficulty)) + 1;
            answer = num1 * num2;
            problem = `${num1} × ${num2} = ?`;
            break;
            
        case '÷':
            num2 = Math.floor(Math.random() * Math.min(10, difficulty)) + 1;
            answer = Math.floor(Math.random() * Math.min(10, difficulty)) + 1;
            num1 = num2 * answer;
            problem = `${num1} ÷ ${num2} = ?`;
            break;
    }
    
    // Generate wrong options
    const options = [answer];
    while (options.length < 4) {
        const wrong = answer + Math.floor(Math.random() * 10) - 5;
        if (wrong > 0 && !options.includes(wrong)) {
            options.push(wrong);
        }
    }
    
    return {
        question: 'Solve this math problem!',
        problem: problem,
        correctAnswer: answer,
        options: options,
        instruction: 'Choose the correct answer!'
    };
}

/**
 * Load Counting Puzzle
 */
function loadCountingPuzzle(data, container) {
    container.innerHTML = `
        <div class="counting-puzzle">
            <div class="counting-question">
                <h3>Count the items!</h3>
                <div class="counting-items" id="countingItems"></div>
            </div>
            <div class="counting-input">
                <label>How many do you see?</label>
                <input type="number" id="countInput" min="0" max="100" placeholder="Enter number">
                <button class="btn-primary" onclick="checkCountingAnswer()">Check Answer</button>
            </div>
        </div>
    `;
    
    const itemsContainer = container.querySelector('#countingItems');
    const emoji = data.emoji || '🐠';
    const count = data.count || 5;
    
    // Display items to count
    for (let i = 0; i < count; i++) {
        const item = document.createElement('span');
        item.className = 'counting-item';
        item.textContent = emoji;
        item.style.fontSize = '40px';
        item.style.margin = '10px';
        item.style.display = 'inline-block';
        itemsContainer.appendChild(item);
    }
    
    // Store correct answer
    container.dataset.correctCount = count;
}

/**
 * Check Counting Answer
 */
function checkCountingAnswer() {
    const input = document.getElementById('countInput');
    const userAnswer = parseInt(input.value);
    const correctAnswer = parseInt(document.querySelector('.counting-puzzle').dataset.correctCount);
    
    if (isNaN(userAnswer)) {
        alert('Please enter a number!');
        return;
    }
    
    gameState.attempts++;
    
    if (userAnswer === correctAnswer) {
        alert('✅ Correct! You counted perfectly!');
        levelComplete();
    } else {
        alert(`❌ Not quite! Try counting again carefully.`);
        input.value = '';
        input.focus();
    }
}

/**
 * Load Number Sequence Puzzle
 */
function loadNumberSequencePuzzle(data, container) {
    container.innerHTML = `
        <div class="number-sequence-puzzle">
            <div class="sequence-question">
                <h3>Complete the number sequence!</h3>
                <div class="number-sequence" id="numberSequence"></div>
            </div>
            <div class="sequence-options" id="sequenceOptions"></div>
        </div>
    `;
    
    const sequenceContainer = container.querySelector('#numberSequence');
    const optionsContainer = container.querySelector('#sequenceOptions');
    
    const sequence = data.sequence || [2, 4, 6, '?', 10];
    const correctAnswer = data.correctAnswer || 8;
    const options = data.options || [6, 7, 8, 9];
    
    // Display sequence
    sequence.forEach(num => {
        const item = document.createElement('div');
        item.className = 'sequence-number';
        item.textContent = num;
        if (num === '?') {
            item.classList.add('missing');
        }
        sequenceContainer.appendChild(item);
    });
    
    // Display options
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'sequence-option';
        button.textContent = option;
        button.onclick = () => checkSequenceAnswer(option, correctAnswer, button);
        optionsContainer.appendChild(button);
    });
}

/**
 * Check Number Sequence Answer
 */
function checkSequenceAnswer(selected, correct, button) {
    const allButtons = document.querySelectorAll('.sequence-option');
    allButtons.forEach(btn => btn.disabled = true);
    
    if (selected === correct) {
        button.classList.add('correct');
        
        // Fill in the missing number
        const missing = document.querySelector('.sequence-number.missing');
        if (missing) {
            missing.textContent = correct;
            missing.classList.remove('missing');
            missing.classList.add('filled');
        }
        
        setTimeout(() => {
            alert('✅ Perfect! You found the pattern!');
            levelComplete();
        }, 1000);
    } else {
        button.classList.add('incorrect');
        gameState.attempts++;
        
        setTimeout(() => {
            allButtons.forEach(btn => {
                if (!btn.classList.contains('incorrect')) {
                    btn.disabled = false;
                }
            });
        }, 1000);
    }
}

/**
 * Load Comparison Puzzle
 */
function loadComparisonPuzzle(data, container) {
    container.innerHTML = `
        <div class="comparison-puzzle">
            <div class="comparison-question">
                <h3>Which is ${data.type || 'bigger'}?</h3>
                <div class="comparison-items">
                    <button class="comparison-item" onclick="checkComparison('left')">
                        <div class="comparison-number">${data.left || 5}</div>
                    </button>
                    <div class="comparison-vs">VS</div>
                    <button class="comparison-item" onclick="checkComparison('right')">
                        <div class="comparison-number">${data.right || 8}</div>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Store correct answer
    container.dataset.comparisonType = data.type || 'bigger';
    container.dataset.leftValue = data.left || 5;
    container.dataset.rightValue = data.right || 8;
}

/**
 * Check Comparison Answer
 */
function checkComparison(choice) {
    const puzzle = document.querySelector('.comparison-puzzle');
    const type = puzzle.dataset.comparisonType;
    const left = parseInt(puzzle.dataset.leftValue);
    const right = parseInt(puzzle.dataset.rightValue);
    
    let correct = false;
    
    if (type === 'bigger' || type === 'larger') {
        correct = (choice === 'left' && left > right) || (choice === 'right' && right > left);
    } else if (type === 'smaller') {
        correct = (choice === 'left' && left < right) || (choice === 'right' && right < left);
    }
    
    gameState.attempts++;
    
    if (correct) {
        alert('✅ Correct! You chose the right number!');
        levelComplete();
    } else {
        alert('❌ Try again! Think carefully about which is ' + type + '.');
    }
}

console.log('✅ Number Quiz puzzles loaded!');


// ==================== NUMBER PUZZLE TYPES ====================

/**
 * Load Number Quiz Puzzle
 * Simple math questions for kids
 */
function loadNumberQuizPuzzle(data, container) {
    const question = data.question || "What is 2 + 2?";
    const correctAnswer = data.answer || 4;
    const options = data.options || [3, 4, 5, 6];
    
    container.innerHTML = `
        <div class="number-quiz">
            <div class="quiz-question">
                <h3>${question}</h3>
            </div>
            <div class="quiz-options" id="quizOptions"></div>
        </div>
    `;
    
    const optionsContainer = container.querySelector('#quizOptions');
    
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = option;
        btn.onclick = () => selectQuizAnswer(btn, option, correctAnswer);
        optionsContainer.appendChild(btn);
    });
}

/**
 * Select Quiz Answer
 */
function selectQuizAnswer(button, selected, correct) {
    // Remove previous selections
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.classList.remove('selected', 'correct', 'wrong');
    });
    
    button.classList.add('selected');
    
    if (selected === correct) {
        button.classList.add('correct');
        setTimeout(() => {
            showFeedback(true);
            levelComplete();
        }, 500);
    } else {
        button.classList.add('wrong');
        gameState.attempts++;
        setTimeout(() => {
            showFeedback(false);
            button.classList.remove('selected', 'wrong');
        }, 1000);
    }
}

/**
 * Load Counting Puzzle
 * Count objects and select correct number
 */
function loadCountingPuzzle(data, container) {
    const items = data.items || ['🐠', '🐠', '🐠', '🐠', '🐠'];
    const correctCount = data.count || items.length;
    const options = data.options || [3, 4, 5, 6, 7];
    
    container.innerHTML = `
        <div class="counting-puzzle">
            <div class="counting-instruction">
                <h3>Count the items!</h3>
            </div>
            <div class="counting-items" id="countingItems"></div>
            <div class="counting-question">
                <p>How many are there?</p>
            </div>
            <div class="counting-options" id="countingOptions"></div>
        </div>
    `;
    
    // Display items to count
    const itemsContainer = container.querySelector('#countingItems');
    items.forEach(item => {
        const span = document.createElement('span');
        span.className = 'count-item';
        span.textContent = item;
        itemsContainer.appendChild(span);
    });
    
    // Display number options
    const optionsContainer = container.querySelector('#countingOptions');
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'count-option';
        btn.textContent = option;
        btn.onclick = () => selectCountAnswer(btn, option, correctCount);
        optionsContainer.appendChild(btn);
    });
}

/**
 * Select Count Answer
 */
function selectCountAnswer(button, selected, correct) {
    document.querySelectorAll('.count-option').forEach(btn => {
        btn.classList.remove('selected', 'correct', 'wrong');
    });
    
    button.classList.add('selected');
    
    if (selected === correct) {
        button.classList.add('correct');
        // Highlight counted items
        document.querySelectorAll('.count-item').forEach(item => {
            item.classList.add('counted');
        });
        setTimeout(() => {
            showFeedback(true);
            levelComplete();
        }, 800);
    } else {
        button.classList.add('wrong');
        gameState.attempts++;
        setTimeout(() => {
            showFeedback(false);
            button.classList.remove('selected', 'wrong');
        }, 1000);
    }
}

/**
 * Load Number Sequence Puzzle
 * Find the missing number in sequence
 */
function loadNumberSequencePuzzle(data, container) {
    const sequence = data.sequence || [2, 4, '?', 8, 10];
    const correctAnswer = data.answer || 6;
    const options = data.options || [5, 6, 7, 8];
    
    container.innerHTML = `
        <div class="number-sequence-puzzle">
            <div class="sequence-instruction">
                <h3>Find the missing number!</h3>
            </div>
            <div class="number-sequence" id="numberSequence"></div>
            <div class="sequence-options" id="sequenceOptions"></div>
        </div>
    `;
    
    // Display sequence
    const sequenceContainer = container.querySelector('#numberSequence');
    sequence.forEach(num => {
        const box = document.createElement('div');
        box.className = 'sequence-box';
        if (num === '?') {
            box.classList.add('missing');
            box.textContent = '?';
        } else {
            box.textContent = num;
        }
        sequenceContainer.appendChild(box);
    });
    
    // Display options
    const optionsContainer = container.querySelector('#sequenceOptions');
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'sequence-option';
        btn.textContent = option;
        btn.onclick = () => selectSequenceAnswer(btn, option, correctAnswer);
        optionsContainer.appendChild(btn);
    });
}

/**
 * Select Sequence Answer
 */
function selectSequenceAnswer(button, selected, correct) {
    document.querySelectorAll('.sequence-option').forEach(btn => {
        btn.classList.remove('selected', 'correct', 'wrong');
    });
    
    button.classList.add('selected');
    
    if (selected === correct) {
        button.classList.add('correct');
        // Fill in the missing number
        const missingBox = document.querySelector('.sequence-box.missing');
        if (missingBox) {
            missingBox.textContent = correct;
            missingBox.classList.add('filled');
        }
        setTimeout(() => {
            showFeedback(true);
            levelComplete();
        }, 800);
    } else {
        button.classList.add('wrong');
        gameState.attempts++;
        setTimeout(() => {
            showFeedback(false);
            button.classList.remove('selected', 'wrong');
        }, 1000);
    }
}

/**
 * Load Comparison Puzzle
 * Compare numbers (greater/less than)
 */
function loadComparisonPuzzle(data, container) {
    const num1 = data.num1 || 5;
    const num2 = data.num2 || 8;
    const question = data.question || "Which number is bigger?";
    const correctAnswer = data.answer || num2;
    
    container.innerHTML = `
        <div class="comparison-puzzle">
            <div class="comparison-instruction">
                <h3>${question}</h3>
            </div>
            <div class="comparison-numbers">
                <button class="compare-option" onclick="selectCompareAnswer(this, ${num1}, ${correctAnswer})">
                    <span class="compare-number">${num1}</span>
                </button>
                <span class="compare-vs">VS</span>
                <button class="compare-option" onclick="selectCompareAnswer(this, ${num2}, ${correctAnswer})">
                    <span class="compare-number">${num2}</span>
                </button>
            </div>
        </div>
    `;
}

/**
 * Select Compare Answer
 */
function selectCompareAnswer(button, selected, correct) {
    document.querySelectorAll('.compare-option').forEach(btn => {
        btn.classList.remove('selected', 'correct', 'wrong');
    });
    
    button.classList.add('selected');
    
    if (selected === correct) {
        button.classList.add('correct');
        setTimeout(() => {
            showFeedback(true);
            levelComplete();
        }, 500);
    } else {
        button.classList.add('wrong');
        gameState.attempts++;
        setTimeout(() => {
            showFeedback(false);
            button.classList.remove('selected', 'wrong');
        }, 1000);
    }
}

/**
 * Load Addition Puzzle
 * Simple addition problems
 */
function loadAdditionPuzzle(data, container) {
    const num1 = data.num1 || 3;
    const num2 = data.num2 || 5;
    const correctAnswer = num1 + num2;
    const options = data.options || [correctAnswer - 1, correctAnswer, correctAnswer + 1, correctAnswer + 2];
    
    container.innerHTML = `
        <div class="math-puzzle">
            <div class="math-instruction">
                <h3>Solve the problem!</h3>
            </div>
            <div class="math-problem">
                <span class="math-number">${num1}</span>
                <span class="math-operator">+</span>
                <span class="math-number">${num2}</span>
                <span class="math-equals">=</span>
                <span class="math-answer">?</span>
            </div>
            <div class="math-options" id="mathOptions"></div>
        </div>
    `;
    
    const optionsContainer = container.querySelector('#mathOptions');
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'math-option';
        btn.textContent = option;
        btn.onclick = () => selectMathAnswer(btn, option, correctAnswer);
        optionsContainer.appendChild(btn);
    });
}

/**
 * Load Subtraction Puzzle
 */
function loadSubtractionPuzzle(data, container) {
    const num1 = data.num1 || 8;
    const num2 = data.num2 || 3;
    const correctAnswer = num1 - num2;
    const options = data.options || [correctAnswer - 1, correctAnswer, correctAnswer + 1, correctAnswer + 2];
    
    container.innerHTML = `
        <div class="math-puzzle">
            <div class="math-instruction">
                <h3>Solve the problem!</h3>
            </div>
            <div class="math-problem">
                <span class="math-number">${num1}</span>
                <span class="math-operator">−</span>
                <span class="math-number">${num2}</span>
                <span class="math-equals">=</span>
                <span class="math-answer">?</span>
            </div>
            <div class="math-options" id="mathOptions"></div>
        </div>
    `;
    
    const optionsContainer = container.querySelector('#mathOptions');
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'math-option';
        btn.textContent = option;
        btn.onclick = () => selectMathAnswer(btn, option, correctAnswer);
        optionsContainer.appendChild(btn);
    });
}

/**
 * Select Math Answer
 */
function selectMathAnswer(button, selected, correct) {
    document.querySelectorAll('.math-option').forEach(btn => {
        btn.classList.remove('selected', 'correct', 'wrong');
    });
    
    button.classList.add('selected');
    
    if (selected === correct) {
        button.classList.add('correct');
        // Update answer display
        const answerDisplay = document.querySelector('.math-answer');
        if (answerDisplay) {
            answerDisplay.textContent = correct;
            answerDisplay.classList.add('revealed');
        }
        setTimeout(() => {
            showFeedback(true);
            levelComplete();
        }, 800);
    } else {
        button.classList.add('wrong');
        gameState.attempts++;
        setTimeout(() => {
            showFeedback(false);
            button.classList.remove('selected', 'wrong');
        }, 1000);
    }
}

// Update loadPuzzle to include new types
const originalLoadPuzzle = loadPuzzle;
loadPuzzle = function(level, container) {
    const type = level.puzzleType;
    
    switch(type) {
        case 'Addition':
            loadAdditionPuzzle(level.puzzleData, container);
            break;
        case 'Subtraction':
            loadSubtractionPuzzle(level.puzzleData, container);
            break;
        default:
            originalLoadPuzzle(level, container);
    }
};

console.log('✅ Number Puzzle Functions Added!');


/**
 * Check Game Status - Debug Function
 */
function checkGameStatus() {
    console.log('🔍 GAME STATUS CHECK:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Check level packs
    console.log('📦 Level Packs Loaded:', Object.keys(levelPacks).length);
    Object.keys(levelPacks).forEach(packName => {
        const pack = levelPacks[packName];
        console.log(`  ✓ ${packName}:`, pack.levels.length, 'levels');
    });
    
    // Check current state
    console.log('\n🎮 Current State:');
    console.log('  Pack:', gameState.currentPack || 'None');
    console.log('  Level:', gameState.currentLevel);
    console.log('  XP:', gameState.playerXP);
    console.log('  Player Level:', gameState.playerLevel);
    
    // Check AI
    console.log('\n🤖 AI Status:');
    if (typeof AI_CONFIG !== 'undefined') {
        console.log('  Enabled:', AI_CONFIG.enabled);
        console.log('  API Key:', AI_CONFIG.GEMINI_API_KEY ? 'Set ✓' : 'Not set ✗');
    } else {
        console.log('  AI System not loaded');
    }
    
    // Check functions
    console.log('\n⚙️ Core Functions:');
    const functions = [
        'initGame', 'loadGameData', 'startLevel', 'loadPuzzle',
        'loadMatchingPuzzle', 'loadPathBuilderPuzzle', 'loadSequencePuzzle'
    ];
    functions.forEach(fn => {
        console.log(`  ${typeof window[fn] === 'function' ? '✓' : '✗'} ${fn}`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Show alert
    const totalPacks = Object.keys(levelPacks).length;
    const totalLevels = Object.values(levelPacks).reduce((sum, pack) => sum + pack.levels.length, 0);
    alert(`Game Status:\n\n✓ ${totalPacks} packs loaded\n✓ ${totalLevels} total levels\n✓ All systems operational\n\nCheck console (F12) for details!`);
}

/**
 * Test Level Loading
 */
function testLevelLoading() {
    console.log('🧪 TESTING LEVEL LOADING:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Test each pack
    ['underwater', 'space', 'jungle'].forEach(packName => {
        const pack = levelPacks[packName];
        if (pack) {
            console.log(`\n📦 ${packName.toUpperCase()} Pack:`);
            console.log(`  Total Levels: ${pack.levels.length}`);
            console.log(`  First Level:`, pack.levels[0].title);
            console.log(`  Puzzle Type:`, pack.levels[0].puzzleType);
            console.log(`  Has Data:`, !!pack.levels[0].puzzleData);
        } else {
            console.log(`\n❌ ${packName} pack not loaded!`);
        }
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}


// ==================== FLOATING ACTION BUTTON (FAB) ====================

/**
 * Toggle FAB Menu
 */
function toggleFAB() {
    const fabContainer = document.getElementById('fabContainer');
    if (fabContainer) {
        fabContainer.classList.toggle('active');
    }
}

/**
 * Close FAB Menu
 */
function closeFAB() {
    const fabContainer = document.getElementById('fabContainer');
    if (fabContainer) {
        fabContainer.classList.remove('active');
    }
}

/**
 * Close FAB when clicking outside
 */
document.addEventListener('click', (e) => {
    const fabContainer = document.getElementById('fabContainer');
    const fabMain = document.getElementById('fabMain');
    
    if (fabContainer && fabMain && !fabContainer.contains(e.target)) {
        fabContainer.classList.remove('active');
    }
});

console.log('✅ FAB Functions Loaded!');
