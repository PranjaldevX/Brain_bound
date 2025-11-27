/**
 * BrainBound - AI Integration System
 * Uses Gemini API for dynamic difficulty and hints
 */

// AI Configuration
const AI_CONFIG = {
    // Gemini API Key - INTEGRATED ✅
    GEMINI_API_KEY: 'AIzaSyCpY5mCYWb2X3kVg8tEp0gpbh46aMmYpGU',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    enabled: true, // AI ENABLED! 🤖
    maxRetries: 3,
    timeout: 10000
};

// AI State
let aiState = {
    currentDifficulty: 1,
    playerPerformance: [],
    adaptiveHints: [],
    generatedPuzzles: []
};

/**
 * Initialize AI System
 */
function initAI() {
    console.log('🤖 AI System initializing...');
    
    if (!AI_CONFIG.GEMINI_API_KEY || AI_CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        console.warn('⚠️ AI disabled: No API key configured');
        AI_CONFIG.enabled = false;
        return;
    }
    
    AI_CONFIG.enabled = true;
    console.log('✅ AI System ready!');
}

/**
 * Calculate Dynamic Difficulty - AI ENHANCED
 * Uses Gemini AI to intelligently adjust difficulty based on comprehensive player analysis
 */
async function calculateDifficulty(levelNumber, playerStats) {
    // Base difficulty increases progressively with level
    let baseDifficulty = Math.min(10, Math.floor(levelNumber / 5) + 1);
    
    // Get recent performance data
    const recentPerformance = aiState.playerPerformance.slice(-10);
    const veryRecentPerformance = aiState.playerPerformance.slice(-3);
    
    if (recentPerformance.length === 0) {
        aiState.currentDifficulty = baseDifficulty;
        return baseDifficulty;
    }
    
    // Calculate performance metrics
    const avgScore = recentPerformance.reduce((a, b) => a + b, 0) / recentPerformance.length;
    const recentAvg = veryRecentPerformance.length > 0 
        ? veryRecentPerformance.reduce((a, b) => a + b, 0) / veryRecentPerformance.length 
        : avgScore;
    
    // Determine trend
    const trend = recentAvg > avgScore ? 'improving' : recentAvg < avgScore ? 'declining' : 'stable';
    
    // AI-powered difficulty adjustment
    if (AI_CONFIG.enabled) {
        try {
            const aiDifficulty = await getAIDifficultyRecommendation({
                levelNumber,
                baseDifficulty,
                avgScore,
                recentAvg,
                trend,
                attempts: playerStats.attempts || 1,
                hintsUsed: playerStats.hintsUsed || 0,
                timeSpent: playerStats.timeSeconds || 0
            });
            
            if (aiDifficulty !== null) {
                console.log(`🤖 AI Difficulty: ${aiDifficulty}/10 (Base: ${baseDifficulty})`);
                aiState.currentDifficulty = aiDifficulty;
                return aiDifficulty;
            }
        } catch (error) {
            console.warn('AI difficulty calculation failed, using fallback');
        }
    }
    
    // Fallback: Rule-based difficulty adjustment
    let difficulty = baseDifficulty;
    
    // Performance-based adjustments
    if (avgScore > 0.95) {
        difficulty += 2; // Excellent performance - significant increase
    } else if (avgScore > 0.85) {
        difficulty += 1; // Great performance - moderate increase
    } else if (avgScore < 0.4) {
        difficulty = Math.max(1, difficulty - 2); // Struggling - significant decrease
    } else if (avgScore < 0.6) {
        difficulty = Math.max(1, difficulty - 1); // Below average - slight decrease
    }
    
    // Trend-based adjustments
    if (trend === 'improving' && avgScore > 0.7) {
        difficulty += 1; // Reward improvement
    } else if (trend === 'declining' && avgScore < 0.6) {
        difficulty = Math.max(1, difficulty - 1); // Support struggling player
    }
    
    // Attempts-based adjustments
    if (playerStats.attempts > 5) {
        difficulty = Math.max(1, difficulty - 2); // Many attempts - make easier
    } else if (playerStats.attempts > 3) {
        difficulty = Math.max(1, difficulty - 1);
    } else if (playerStats.attempts === 1 && playerStats.hintsUsed === 0) {
        difficulty += 1; // First try success - increase challenge
    }
    
    // Hints-based adjustments
    if (playerStats.hintsUsed > 3) {
        difficulty = Math.max(1, difficulty - 1); // Needs lots of help
    }
    
    // Time-based adjustments
    if (playerStats.timeSeconds > 300) {
        difficulty = Math.max(1, difficulty - 1); // Taking too long
    } else if (playerStats.timeSeconds < 30 && playerStats.attempts === 1) {
        difficulty += 1; // Very fast - increase challenge
    }
    
    // Ensure difficulty stays within bounds
    difficulty = Math.min(10, Math.max(1, difficulty));
    
    aiState.currentDifficulty = difficulty;
    console.log(`📊 Difficulty: ${difficulty}/10 | Avg Score: ${(avgScore * 100).toFixed(0)}% | Trend: ${trend}`);
    
    return difficulty;
}

/**
 * Get AI Difficulty Recommendation
 * Uses Gemini AI to analyze player data and recommend optimal difficulty
 */
async function getAIDifficultyRecommendation(playerData) {
    if (!AI_CONFIG.enabled) {
        return null;
    }
    
    try {
        const prompt = `You are an adaptive learning AI for a children's educational game (ages 5-8).

Player Performance Data:
- Current Level: ${playerData.levelNumber}
- Base Difficulty: ${playerData.baseDifficulty}/10
- Average Score: ${(playerData.avgScore * 100).toFixed(0)}%
- Recent Average: ${(playerData.recentAvg * 100).toFixed(0)}%
- Performance Trend: ${playerData.trend}
- Last Level Attempts: ${playerData.attempts}
- Hints Used: ${playerData.hintsUsed}
- Time Spent: ${playerData.timeSpent}s

Analyze this data and recommend an optimal difficulty level (1-10) that will:
1. Keep the child engaged (not too easy, not too hard)
2. Promote learning through appropriate challenge
3. Build confidence through achievable goals
4. Adapt to their improving or declining performance

Consider:
- Zone of Proximal Development (slightly above current ability)
- Flow state (optimal challenge-skill balance)
- Motivation and engagement
- Learning progression

Respond with ONLY a single number between 1 and 10 representing the recommended difficulty level.`;

        const response = await callGeminiAPI(prompt);
        
        if (response) {
            const difficulty = parseInt(response.trim());
            if (!isNaN(difficulty) && difficulty >= 1 && difficulty <= 10) {
                return difficulty;
            }
        }
    } catch (error) {
        console.error('AI Difficulty Recommendation Error:', error);
    }
    
    return null;
}

/**
 * Get AI-Generated Hint
 * Uses Gemini API to generate contextual hints
 */
async function getAIHint(puzzleData, levelInfo, attempts) {
    if (!AI_CONFIG.enabled) {
        return getFallbackHint(puzzleData, levelInfo);
    }
    
    try {
        const prompt = `You are a helpful tutor for kids aged 5-8. 
        
Level: ${levelInfo.title}
Puzzle Type: ${puzzleData.type}
Attempts: ${attempts}
        
Generate a ${attempts === 1 ? 'gentle' : attempts === 2 ? 'clearer' : 'very clear'} hint for this puzzle.
Keep it simple, encouraging, and age-appropriate.
Use emojis to make it fun!

Puzzle Details: ${JSON.stringify(puzzleData)}

Hint (max 50 words):`;

        const response = await callGeminiAPI(prompt);
        
        if (response) {
            return response;
        }
    } catch (error) {
        console.error('AI Hint Error:', error);
    }
    
    return getFallbackHint(puzzleData, levelInfo);
}

/**
 * Fallback Hint System
 * When AI is not available
 */
function getFallbackHint(puzzleData, levelInfo) {
    const hints = {
        Matching: [
            "🤔 Look carefully at what each item does!",
            "💡 Think about how these things are connected!",
            "✨ Match things that go together!"
        ],
        PathBuilder: [
            "🗺️ Try going around the obstacles!",
            "👣 Plan your path step by step!",
            "🎯 Look for the clearest route!"
        ],
        Sequence: [
            "📊 Think about what comes first!",
            "🔢 Put them in order from start to finish!",
            "⏰ What happens at the beginning?"
        ],
        LogicGrid: [
            "🧩 Use the clues one at a time!",
            "✅ Cross out what can't be true!",
            "🔍 Start with the easiest clue!"
        ]
    };
    
    const typeHints = hints[puzzleData.type] || hints.Matching;
    return typeHints[Math.min(gameState.attempts, typeHints.length - 1)];
}

/**
 * Generate Dynamic Puzzle
 * AI creates new puzzle variations
 */
async function generateDynamicPuzzle(theme, difficulty, puzzleType) {
    if (!AI_CONFIG.enabled) {
        return null;
    }
    
    try {
        const prompt = `Create a ${puzzleType} puzzle for kids aged 5-8.
        
Theme: ${theme}
Difficulty: ${difficulty}/10
        
Generate a fun, educational puzzle with:
- Clear instructions
- Age-appropriate content
- Fun facts
- Encouraging dialogue

Return as JSON with structure:
{
    "title": "Puzzle Title",
    "story": "Short story",
    "puzzleData": {...},
    "hint": "Helpful hint",
    "funFact": "Interesting fact"
}`;

        const response = await callGeminiAPI(prompt);
        
        if (response) {
            try {
                return JSON.parse(response);
            } catch (e) {
                console.error('Failed to parse AI puzzle:', e);
            }
        }
    } catch (error) {
        console.error('AI Puzzle Generation Error:', error);
    }
    
    return null;
}

/**
 * Analyze Player Performance
 * Track and analyze how player is doing
 */
function analyzePerformance(levelResult) {
    const score = calculateLevelScore(levelResult);
    aiState.playerPerformance.push(score);
    
    // Keep only last 20 performances
    if (aiState.playerPerformance.length > 20) {
        aiState.playerPerformance.shift();
    }
    
    // Calculate trends
    const recentAvg = aiState.playerPerformance.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const overallAvg = aiState.playerPerformance.reduce((a, b) => a + b, 0) / aiState.playerPerformance.length;
    
    return {
        recentAverage: recentAvg,
        overallAverage: overallAvg,
        trend: recentAvg > overallAvg ? 'improving' : recentAvg < overallAvg ? 'declining' : 'stable',
        recommendation: getRecommendation(recentAvg)
    };
}

/**
 * Calculate Level Score
 */
function calculateLevelScore(result) {
    let score = 1.0;
    
    // Deduct for attempts
    score -= (result.attempts - 1) * 0.1;
    
    // Deduct for hints
    score -= result.hintsUsed * 0.15;
    
    // Deduct for time (if took too long)
    if (result.timeSeconds > 300) {
        score -= 0.1;
    }
    
    // Bonus for first try
    if (result.attempts === 1 && result.hintsUsed === 0) {
        score += 0.2;
    }
    
    return Math.max(0, Math.min(1, score));
}

/**
 * Get Recommendation
 */
function getRecommendation(avgScore) {
    if (avgScore > 0.9) {
        return "🌟 Excellent! Try harder levels!";
    } else if (avgScore > 0.7) {
        return "👍 Great job! Keep it up!";
    } else if (avgScore > 0.5) {
        return "💪 Good effort! Practice more!";
    } else {
        return "🤗 Take your time! You're learning!";
    }
}

/**
 * Call Gemini API
 */
async function callGeminiAPI(prompt) {
    if (!AI_CONFIG.enabled) {
        return null;
    }
    
    try {
        const response = await fetch(`${AI_CONFIG.GEMINI_API_URL}?key=${AI_CONFIG.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        }
        
        return null;
    } catch (error) {
        console.error('Gemini API Error:', error);
        return null;
    }
}

/**
 * Get Adaptive Challenge - AI ENHANCED
 * Dynamically adjusts puzzle complexity based on difficulty level
 */
async function getAdaptiveChallenge(basePuzzle, difficulty) {
    const adjusted = JSON.parse(JSON.stringify(basePuzzle)); // Deep clone
    
    console.log(`🎯 Adapting puzzle to difficulty ${difficulty}/10`);
    
    // Difficulty multipliers
    const difficultyMultiplier = difficulty / 5; // 0.2 to 2.0
    
    switch (basePuzzle.puzzleType) {
        case 'Matching':
            // Adjust number of pairs based on difficulty
            const basePairs = adjusted.puzzleData.pairs.length;
            let targetPairs = Math.min(10, Math.max(3, Math.floor(basePairs * difficultyMultiplier)));
            
            if (difficulty <= 2) {
                // Easy: 3-4 pairs
                targetPairs = Math.min(4, basePairs);
            } else if (difficulty <= 4) {
                // Medium: 5-6 pairs
                targetPairs = Math.min(6, Math.max(5, basePairs));
            } else if (difficulty <= 7) {
                // Hard: 7-8 pairs
                targetPairs = Math.min(8, Math.max(7, basePairs));
            } else {
                // Expert: 9-10 pairs
                targetPairs = Math.min(10, Math.max(9, basePairs));
            }
            
            // Adjust pairs array
            if (targetPairs < basePairs) {
                adjusted.puzzleData.pairs = adjusted.puzzleData.pairs.slice(0, targetPairs);
            }
            
            console.log(`  📝 Matching: ${targetPairs} pairs (difficulty ${difficulty})`);
            break;
            
        case 'PathBuilder':
            // Adjust grid size and obstacles
            const baseGridSize = adjusted.puzzleData.gridSize || 4;
            let newGridSize = baseGridSize;
            let obstacleCount = (adjusted.puzzleData.obstacles || []).length;
            
            if (difficulty <= 2) {
                // Easy: Small grid, few obstacles
                newGridSize = Math.min(4, baseGridSize);
                obstacleCount = Math.max(0, Math.floor(obstacleCount * 0.5));
            } else if (difficulty <= 4) {
                // Medium: Medium grid, moderate obstacles
                newGridSize = Math.min(5, baseGridSize);
                obstacleCount = Math.floor(obstacleCount * 0.8);
            } else if (difficulty <= 7) {
                // Hard: Large grid, many obstacles
                newGridSize = Math.min(6, Math.max(5, baseGridSize));
                obstacleCount = Math.floor(obstacleCount * 1.2);
            } else {
                // Expert: Largest grid, maximum obstacles
                newGridSize = Math.min(7, Math.max(6, baseGridSize));
                obstacleCount = Math.floor(obstacleCount * 1.5);
            }
            
            adjusted.puzzleData.gridSize = newGridSize;
            
            // Adjust obstacles (keep within grid bounds)
            if (obstacleCount < adjusted.puzzleData.obstacles.length) {
                adjusted.puzzleData.obstacles = adjusted.puzzleData.obstacles.slice(0, obstacleCount);
            }
            
            console.log(`  🗺️ PathBuilder: ${newGridSize}x${newGridSize} grid, ${obstacleCount} obstacles`);
            break;
            
        case 'Sequence':
            // Adjust number of items in sequence
            const baseItems = adjusted.puzzleData.correctSequence.length;
            let targetItems = baseItems;
            
            if (difficulty <= 2) {
                // Easy: 3-4 items
                targetItems = Math.min(4, baseItems);
            } else if (difficulty <= 4) {
                // Medium: 5-6 items
                targetItems = Math.min(6, Math.max(5, baseItems));
            } else if (difficulty <= 7) {
                // Hard: 7-8 items
                targetItems = Math.min(8, Math.max(7, baseItems));
            } else {
                // Expert: 9-10 items
                targetItems = Math.min(10, Math.max(9, baseItems));
            }
            
            // Adjust sequence arrays
            if (targetItems < baseItems) {
                adjusted.puzzleData.correctSequence = adjusted.puzzleData.correctSequence.slice(0, targetItems);
                if (adjusted.puzzleData.options) {
                    adjusted.puzzleData.options = adjusted.puzzleData.options.slice(0, targetItems);
                }
            }
            
            console.log(`  🔢 Sequence: ${targetItems} items (difficulty ${difficulty})`);
            break;
            
        case 'LogicGrid':
            // Adjust grid complexity
            if (difficulty <= 3) {
                // Simplify clues
                console.log(`  🧩 LogicGrid: Simplified (difficulty ${difficulty})`);
            } else if (difficulty > 7) {
                // Add complexity
                console.log(`  🧩 LogicGrid: Complex (difficulty ${difficulty})`);
            }
            break;
            
        case 'Mixed':
            // Mixed puzzles scale with all adjustments
            console.log(`  🎭 Mixed: Multi-challenge (difficulty ${difficulty})`);
            break;
    }
    
    // Add difficulty indicator to puzzle
    adjusted.adjustedDifficulty = difficulty;
    adjusted.originalDifficulty = basePuzzle.difficulty || 1;
    
    return adjusted;
}

/**
 * Get Progressive Difficulty Path
 * AI suggests optimal difficulty progression for next levels
 */
async function getProgressiveDifficultyPath(currentLevel, performance) {
    if (!AI_CONFIG.enabled) {
        return getDefaultDifficultyPath(currentLevel);
    }
    
    try {
        const prompt = `You are an adaptive learning AI designing difficulty progression for a children's game.

Current Status:
- Level: ${currentLevel}
- Recent Performance: ${(performance.recentAverage * 100).toFixed(0)}%
- Overall Performance: ${(performance.overallAverage * 100).toFixed(0)}%
- Trend: ${performance.trend}

Design an optimal difficulty progression for the next 5 levels that:
1. Gradually increases challenge
2. Maintains engagement
3. Builds confidence
4. Adapts to player's skill level

Respond with 5 numbers (1-10) separated by commas, representing difficulty for next 5 levels.
Example: 4,5,5,6,6`;

        const response = await callGeminiAPI(prompt);
        
        if (response) {
            const difficulties = response.trim().split(',').map(d => parseInt(d.trim()));
            if (difficulties.length === 5 && difficulties.every(d => !isNaN(d) && d >= 1 && d <= 10)) {
                console.log(`🎯 AI Difficulty Path: ${difficulties.join(' → ')}`);
                return difficulties;
            }
        }
    } catch (error) {
        console.error('AI Difficulty Path Error:', error);
    }
    
    return getDefaultDifficultyPath(currentLevel);
}

/**
 * Get Default Difficulty Path
 * Fallback difficulty progression
 */
function getDefaultDifficultyPath(currentLevel) {
    const baseDifficulty = Math.min(10, Math.floor(currentLevel / 5) + 1);
    return [
        baseDifficulty,
        Math.min(10, baseDifficulty + 1),
        Math.min(10, baseDifficulty + 1),
        Math.min(10, baseDifficulty + 2),
        Math.min(10, baseDifficulty + 2)
    ];
}

/**
 * Get Encouragement Message
 * AI-powered or fallback encouragement
 */
async function getEncouragementMessage(performance) {
    if (!AI_CONFIG.enabled) {
        return getFallbackEncouragement(performance);
    }
    
    try {
        const prompt = `Generate a short, encouraging message for a child who just ${performance.success ? 'completed' : 'attempted'} a puzzle.
        
Performance:
- Success: ${performance.success}
- Attempts: ${performance.attempts}
- Time: ${performance.timeSeconds}s

Keep it positive, fun, and under 20 words. Use emojis!`;

        const response = await callGeminiAPI(prompt);
        return response || getFallbackEncouragement(performance);
    } catch (error) {
        return getFallbackEncouragement(performance);
    }
}

/**
 * Fallback Encouragement
 */
function getFallbackEncouragement(performance) {
    if (performance.success) {
        const messages = [
            "🎉 Amazing work! You're a star!",
            "🌟 Fantastic! Keep shining!",
            "🏆 Brilliant! You did it!",
            "✨ Wonderful! You're so smart!",
            "🎊 Incredible! Great job!"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    } else {
        const messages = [
            "💪 Keep trying! You're learning!",
            "🤗 Don't give up! You can do it!",
            "🌈 Every try makes you smarter!",
            "⭐ You're doing great! Try again!",
            "💖 Believe in yourself! Keep going!"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
}

/**
 * Save AI State
 */
function saveAIState() {
    try {
        localStorage.setItem('brainbound_ai_state', JSON.stringify(aiState));
    } catch (error) {
        console.error('Failed to save AI state:', error);
    }
}

/**
 * Load AI State
 */
function loadAIState() {
    try {
        const saved = localStorage.getItem('brainbound_ai_state');
        if (saved) {
            aiState = { ...aiState, ...JSON.parse(saved) };
        }
    } catch (error) {
        console.error('Failed to load AI state:', error);
    }
}

// Initialize AI on load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        initAI();
        loadAIState();
    });
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initAI,
        calculateDifficulty,
        getAIHint,
        generateDynamicPuzzle,
        analyzePerformance,
        getAdaptiveChallenge,
        getEncouragementMessage,
        AI_CONFIG
    };
}


/**
 * Get Difficulty Explanation
 * AI explains why difficulty was adjusted
 */
async function getDifficultyExplanation(oldDifficulty, newDifficulty, performance) {
    if (!AI_CONFIG.enabled || oldDifficulty === newDifficulty) {
        return null;
    }
    
    try {
        const change = newDifficulty > oldDifficulty ? 'increased' : 'decreased';
        const prompt = `You are explaining difficulty adjustment to a child (age 5-8) in a fun, encouraging way.

Difficulty ${change} from ${oldDifficulty} to ${newDifficulty}.
Recent performance: ${(performance.recentAverage * 100).toFixed(0)}%

Write a short, positive message (max 25 words) explaining why the difficulty changed.
Use simple words and emojis. Make it encouraging!`;

        const response = await callGeminiAPI(prompt);
        return response || null;
    } catch (error) {
        return null;
    }
}

/**
 * Get Skill Level Assessment
 * AI assesses player's current skill level
 */
async function getSkillLevelAssessment(performance) {
    if (!AI_CONFIG.enabled) {
        return getBasicSkillLevel(performance.overallAverage);
    }
    
    try {
        const prompt = `Assess a child's puzzle-solving skill level based on their performance.

Performance Data:
- Overall Average: ${(performance.overallAverage * 100).toFixed(0)}%
- Recent Average: ${(performance.recentAverage * 100).toFixed(0)}%
- Trend: ${performance.trend}
- Levels Completed: ${aiState.playerPerformance.length}

Provide:
1. Skill Level (Beginner/Intermediate/Advanced/Expert)
2. Strengths (1-2 words)
3. Areas to improve (1-2 words)
4. Encouraging message (max 20 words)

Format: Level|Strengths|Improvements|Message
Example: Intermediate|Pattern recognition|Speed|You're doing great! Keep practicing and you'll be an expert soon! 🌟`;

        const response = await callGeminiAPI(prompt);
        
        if (response) {
            const parts = response.split('|');
            if (parts.length === 4) {
                return {
                    level: parts[0].trim(),
                    strengths: parts[1].trim(),
                    improvements: parts[2].trim(),
                    message: parts[3].trim()
                };
            }
        }
    } catch (error) {
        console.error('Skill Assessment Error:', error);
    }
    
    return {
        level: getBasicSkillLevel(performance.overallAverage),
        strengths: 'Problem solving',
        improvements: 'Practice',
        message: '🌟 Keep learning and growing!'
    };
}

/**
 * Get Basic Skill Level
 */
function getBasicSkillLevel(avgScore) {
    if (avgScore >= 0.9) return 'Expert';
    if (avgScore >= 0.75) return 'Advanced';
    if (avgScore >= 0.6) return 'Intermediate';
    return 'Beginner';
}

/**
 * Get Personalized Challenge
 * AI creates a custom challenge based on player's profile
 */
async function getPersonalizedChallenge(playerProfile) {
    if (!AI_CONFIG.enabled) {
        return null;
    }
    
    try {
        const prompt = `Create a personalized puzzle challenge for a child based on their profile.

Player Profile:
- Skill Level: ${playerProfile.skillLevel}
- Favorite Puzzle Type: ${playerProfile.favoritePuzzleType || 'Unknown'}
- Strengths: ${playerProfile.strengths}
- Current Difficulty: ${aiState.currentDifficulty}/10

Create a fun, engaging challenge that:
1. Matches their skill level
2. Builds on their strengths
3. Introduces slight new complexity
4. Keeps them motivated

Describe the challenge in 2-3 sentences, kid-friendly language with emojis.`;

        const response = await callGeminiAPI(prompt);
        return response || null;
    } catch (error) {
        return null;
    }
}

/**
 * Track Difficulty History
 * Maintains history of difficulty adjustments
 */
const difficultyHistory = {
    history: [],
    
    add(level, difficulty, reason) {
        this.history.push({
            level,
            difficulty,
            reason,
            timestamp: Date.now()
        });
        
        // Keep last 50 entries
        if (this.history.length > 50) {
            this.history.shift();
        }
        
        this.save();
    },
    
    getRecent(count = 10) {
        return this.history.slice(-count);
    },
    
    getAverage() {
        if (this.history.length === 0) return 1;
        return this.history.reduce((sum, entry) => sum + entry.difficulty, 0) / this.history.length;
    },
    
    getTrend() {
        if (this.history.length < 5) return 'stable';
        
        const recent = this.history.slice(-5);
        const older = this.history.slice(-10, -5);
        
        if (older.length === 0) return 'stable';
        
        const recentAvg = recent.reduce((sum, e) => sum + e.difficulty, 0) / recent.length;
        const olderAvg = older.reduce((sum, e) => sum + e.difficulty, 0) / older.length;
        
        if (recentAvg > olderAvg + 0.5) return 'increasing';
        if (recentAvg < olderAvg - 0.5) return 'decreasing';
        return 'stable';
    },
    
    save() {
        try {
            localStorage.setItem('brainbound_difficulty_history', JSON.stringify(this.history));
        } catch (error) {
            console.error('Failed to save difficulty history:', error);
        }
    },
    
    load() {
        try {
            const saved = localStorage.getItem('brainbound_difficulty_history');
            if (saved) {
                this.history = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load difficulty history:', error);
        }
    }
};

/**
 * Display Difficulty Info
 * Shows current difficulty status to player
 */
function displayDifficultyInfo() {
    const difficulty = aiState.currentDifficulty;
    const trend = difficultyHistory.getTrend();
    
    const info = {
        level: difficulty,
        label: getDifficultyLabel(difficulty),
        color: getDifficultyColor(difficulty),
        trend: trend,
        emoji: getDifficultyEmoji(difficulty),
        description: getDifficultyDescription(difficulty)
    };
    
    console.log(`
╔════════════════════════════════════╗
║     DIFFICULTY STATUS              ║
╠════════════════════════════════════╣
║ Level: ${info.emoji} ${info.label} (${difficulty}/10)     ║
║ Trend: ${trend === 'increasing' ? '📈' : trend === 'decreasing' ? '📉' : '➡️'} ${trend}              ║
║ ${info.description}                ║
╚════════════════════════════════════╝
    `);
    
    return info;
}

/**
 * Get Difficulty Label
 */
function getDifficultyLabel(difficulty) {
    if (difficulty <= 2) return 'Very Easy';
    if (difficulty <= 4) return 'Easy';
    if (difficulty <= 6) return 'Medium';
    if (difficulty <= 8) return 'Hard';
    return 'Expert';
}

/**
 * Get Difficulty Color
 */
function getDifficultyColor(difficulty) {
    if (difficulty <= 2) return '#4caf50'; // Green
    if (difficulty <= 4) return '#8bc34a'; // Light Green
    if (difficulty <= 6) return '#ffc107'; // Yellow
    if (difficulty <= 8) return '#ff9800'; // Orange
    return '#f44336'; // Red
}

/**
 * Get Difficulty Emoji
 */
function getDifficultyEmoji(difficulty) {
    if (difficulty <= 2) return '😊';
    if (difficulty <= 4) return '🙂';
    if (difficulty <= 6) return '🤔';
    if (difficulty <= 8) return '😤';
    return '🔥';
}

/**
 * Get Difficulty Description
 */
function getDifficultyDescription(difficulty) {
    if (difficulty <= 2) return 'Perfect for beginners!';
    if (difficulty <= 4) return 'Nice and comfortable!';
    if (difficulty <= 6) return 'Good challenge!';
    if (difficulty <= 8) return 'Tough but doable!';
    return 'Expert level!';
}

/**
 * Initialize Difficulty System
 */
function initDifficultySystem() {
    difficultyHistory.load();
    console.log('📊 Difficulty System initialized');
    console.log(`   Current: ${aiState.currentDifficulty}/10`);
    console.log(`   Average: ${difficultyHistory.getAverage().toFixed(1)}/10`);
    console.log(`   Trend: ${difficultyHistory.getTrend()}`);
}

// Initialize difficulty system on load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        initDifficultySystem();
    });
}

// Export additional functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ...module.exports,
        getAIDifficultyRecommendation,
        getProgressiveDifficultyPath,
        getDifficultyExplanation,
        getSkillLevelAssessment,
        getPersonalizedChallenge,
        difficultyHistory,
        displayDifficultyInfo
    };
}
