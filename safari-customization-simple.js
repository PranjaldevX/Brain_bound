/**
 * Simple Safari Mode & Customization System
 */

const SimpleSafariMode = {
    /**
     * Start Safari Mode
     */
    start(mode) {
        let content = '';
        
        switch(mode) {
            case 'photo':
                content = this.getPhotoSafariContent();
                break;
            case 'tracker':
                content = this.getTrackerContent();
                break;
            case 'rescue':
                content = this.getRescueContent();
                break;
            case 'night':
                content = this.getNightSafariContent();
                break;
            default:
                content = this.getPhotoSafariContent();
        }
        
        this.showSafariScreen(content);
    },
    
    getPhotoSafariContent() {
        const animals = [
            { emoji: '🦁', name: 'Lion', points: 50 },
            { emoji: '🐘', name: 'Elephant', points: 40 },
            { emoji: '🦒', name: 'Giraffe', points: 45 },
            { emoji: '🦓', name: 'Zebra', points: 35 },
            { emoji: '🦏', name: 'Rhino', points: 60 },
            { emoji: '🐆', name: 'Leopard', points: 55 }
        ];
        
        return `
            <div style="padding: 40px; text-align: center;">
                <button class="back-button" onclick="showMainMenu()">← Back</button>
                <h2>📸 Photo Safari</h2>
                <p>Click on animals to take photos!</p>
                <div id="safariScore" style="font-size: 24px; margin: 20px 0;">Score: 0</div>
                <div style="display: grid; grid-template-columns: repeat(3, 150px); gap: 20px; justify-content: center; margin-top: 30px;">
                    ${animals.map(animal => `
                        <button onclick="SimpleSafariMode.takePhoto('${animal.emoji}', '${animal.name}', ${animal.points})" 
                                class="safari-animal" data-photographed="false"
                                style="font-size: 60px; padding: 20px; background: white; border: 3px solid #2d5016; border-radius: 15px; cursor: pointer;">
                            ${animal.emoji}
                            <div style="font-size: 14px; margin-top: 10px;">${animal.name}</div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    takePhoto(emoji, name, points) {
        const button = event.target.closest('.safari-animal');
        if (button.dataset.photographed === 'true') {
            GamePopup.show('📸 Already Photographed', 'You already took a photo of this animal!', 'info');
            return;
        }
        
        button.dataset.photographed = 'true';
        button.style.background = '#d4edda';
        button.style.borderColor = '#28a745';
        
        const scoreEl = document.getElementById('safariScore');
        const currentScore = parseInt(scoreEl.textContent.split(': ')[1]) || 0;
        const newScore = currentScore + points;
        scoreEl.textContent = `Score: ${newScore}`;
        
        GamePopup.show('📸 Great Shot!', `Amazing photo of the ${name}!\n+${points} points!`, 'success');
        
        // Check if all photographed
        const allButtons = document.querySelectorAll('.safari-animal');
        const allPhotographed = Array.from(allButtons).every(b => b.dataset.photographed === 'true');
        if (allPhotographed) {
            setTimeout(() => {
                GamePopup.show('🎉 Safari Complete!', `Congratulations! You photographed all animals!\nTotal Score: ${newScore}`, 'success');
            }, 1500);
        }
    },
    
    getTrackerContent() {
        return `
            <div style="padding: 40px; text-align: center;">
                <button class="back-button" onclick="showMainMenu()">← Back</button>
                <h2>🐾 Animal Tracker</h2>
                <p>Follow the animal tracks!</p>
                <div style="margin: 40px 0;">
                    <div style="font-size: 80px; margin: 20px 0;">🐾 🐾 🐾</div>
                    <p style="font-size: 20px; margin: 20px 0;">Which animal made these tracks?</p>
                    <div style="display: flex; gap: 20px; justify-content: center; margin-top: 30px;">
                        <button onclick="SimpleSafariMode.guessAnimal('🦁', true)" style="font-size: 60px; padding: 20px; background: white; border: 3px solid #2d5016; border-radius: 15px; cursor: pointer;">🦁</button>
                        <button onclick="SimpleSafariMode.guessAnimal('🐘', false)" style="font-size: 60px; padding: 20px; background: white; border: 3px solid #2d5016; border-radius: 15px; cursor: pointer;">🐘</button>
                        <button onclick="SimpleSafariMode.guessAnimal('🦒', false)" style="font-size: 60px; padding: 20px; background: white; border: 3px solid #2d5016; border-radius: 15px; cursor: pointer;">🦒</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    guessAnimal(emoji, correct) {
        if (correct) {
            GamePopup.show('🎉 Correct!', 'You found the animal! Starting new round...', 'success');
            setTimeout(() => {
                GamePopup.close();
                this.start('tracker');
            }, 1500);
        } else {
            GamePopup.show('❌ Try Again', 'That\'s not the right animal. Try again!', 'error');
        }
    },
    
    getRescueContent() {
        return `
            <div style="padding: 40px; text-align: center;">
                <button class="back-button" onclick="showMainMenu()">← Back</button>
                <h2>🚑 Wildlife Rescue</h2>
                <p>Help rescue animals in need!</p>
                <div style="margin: 40px 0;">
                    <div style="font-size: 80px; margin: 20px 0;">🐘</div>
                    <p style="font-size: 18px; margin: 20px 0;">This elephant is stuck in mud! What should we do?</p>
                    <div style="display: flex; flex-direction: column; gap: 15px; max-width: 400px; margin: 30px auto;">
                        <button onclick="SimpleSafariMode.rescueAction('rope', true)" style="padding: 15px; background: white; border: 3px solid #2d5016; border-radius: 10px; cursor: pointer; font-size: 16px;">
                            🪢 Use a rope to pull it out
                        </button>
                        <button onclick="SimpleSafariMode.rescueAction('water', false)" style="padding: 15px; background: white; border: 3px solid #2d5016; border-radius: 10px; cursor: pointer; font-size: 16px;">
                            💧 Add more water
                        </button>
                        <button onclick="SimpleSafariMode.rescueAction('wait', false)" style="padding: 15px; background: white; border: 3px solid #2d5016; border-radius: 10px; cursor: pointer; font-size: 16px;">
                            ⏰ Wait for it to get out
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    rescueAction(action, correct) {
        if (correct) {
            GamePopup.show('🎉 Great Job!', 'You rescued the elephant safely!\nYou are a wildlife hero!', 'success');
        } else {
            GamePopup.show('❌ Try Another Way', 'That might not work. Try another approach!', 'warning');
        }
    },
    
    getNightSafariContent() {
        return `
            <div style="padding: 40px; text-align: center; background: #1a1a2e; color: white; min-height: 100vh;">
                <button class="back-button" onclick="showMainMenu()" style="background: white; color: black;">← Back</button>
                <h2>🌙 Night Safari</h2>
                <p>Explore the jungle at night!</p>
                <div style="margin: 40px 0;">
                    <div style="font-size: 80px; margin: 20px 0;">🌙 ✨ 🦉</div>
                    <p style="font-size: 18px; margin: 20px 0;">Click to reveal nocturnal animals!</p>
                    <div style="display: grid; grid-template-columns: repeat(3, 120px); gap: 20px; justify-content: center; margin-top: 30px;">
                        ${['🦉', '🦇', '🦝', '🦊', '🐺', '🦔'].map(animal => `
                            <button onclick="SimpleSafariMode.revealAnimal(this, '${animal}')" 
                                    style="font-size: 60px; padding: 20px; background: #2a2a3e; border: 3px solid #ffd700; border-radius: 15px; cursor: pointer;">
                                ❓
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },
    
    revealAnimal(button, animal) {
        button.textContent = animal;
        button.style.background = '#3a3a4e';
        button.disabled = true;
        GamePopup.show('🌙 Night Discovery!', `You found a ${animal}!`, 'success');
    },
    
    showSafariScreen(html) {
        let screen = document.getElementById('safariMode');
        
        if (!screen) {
            screen = document.createElement('div');
            screen.id = 'safariMode';
            screen.className = 'screen active';
            document.querySelector('.game-container').appendChild(screen);
        }
        
        screen.innerHTML = html;
        screen.classList.add('active');
    }
};

// Simple Customization System
const SimpleCustomization = {
    currentSkin: 'default',
    
    showMenu() {
        const skins = [
            { id: 'default', emoji: '🧠', name: 'Brain', unlocked: true },
            { id: 'robot', emoji: '🤖', name: 'Robot', unlocked: true },
            { id: 'alien', emoji: '👽', name: 'Alien', unlocked: true },
            { id: 'wizard', emoji: '🧙', name: 'Wizard', unlocked: true },
            { id: 'ninja', emoji: '🥷', name: 'Ninja', unlocked: true },
            { id: 'pirate', emoji: '🏴‍☠️', name: 'Pirate', unlocked: true }
        ];
        
        const content = `
            <div style="padding: 40px; text-align: center;">
                <button class="back-button" onclick="showMainMenu()">← Back</button>
                <h2>🎨 Customize Your Character</h2>
                <p>Choose your avatar!</p>
                <div id="currentAvatar" style="font-size: 100px; margin: 30px 0;">🧠</div>
                <div style="display: grid; grid-template-columns: repeat(3, 150px); gap: 20px; justify-content: center; margin-top: 30px;">
                    ${skins.map(skin => `
                        <button onclick="SimpleCustomization.selectSkin('${skin.id}', '${skin.emoji}')" 
                                class="skin-option ${skin.id === this.currentSkin ? 'selected' : ''}"
                                style="font-size: 60px; padding: 20px; background: white; border: 3px solid ${skin.id === this.currentSkin ? '#667eea' : '#ddd'}; border-radius: 15px; cursor: pointer;">
                            ${skin.emoji}
                            <div style="font-size: 14px; margin-top: 10px;">${skin.name}</div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        let screen = document.getElementById('customizeMode');
        
        if (!screen) {
            screen = document.createElement('div');
            screen.id = 'customizeMode';
            screen.className = 'screen active';
            document.querySelector('.game-container').appendChild(screen);
        }
        
        screen.innerHTML = content;
        screen.classList.add('active');
    },
    
    selectSkin(id, emoji) {
        this.currentSkin = id;
        document.getElementById('currentAvatar').textContent = emoji;
        
        // Update all skin buttons
        document.querySelectorAll('.skin-option').forEach(btn => {
            btn.style.borderColor = '#ddd';
        });
        event.target.closest('.skin-option').style.borderColor = '#667eea';
        
        GamePopup.show('✨ Avatar Changed!', `Your new avatar is ${emoji}!\nLooking great!`, 'success');
    }
};

// Shared Popup System
const GamePopup = {
    show(title, message, type = 'info', buttons = null) {
        let popup = document.getElementById('gamePopup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'gamePopup';
            popup.className = 'game-popup';
            document.body.appendChild(popup);
        }
        
        const icons = { success: '🎉', error: '❌', info: 'ℹ️', warning: '⚠️' };
        
        popup.innerHTML = `
            <div class="popup-overlay" onclick="GamePopup.close()"></div>
            <div class="popup-content ${type}">
                <div class="popup-icon">${icons[type] || icons.info}</div>
                <h3 class="popup-title">${title}</h3>
                <p class="popup-message">${message}</p>
                <div class="popup-buttons" id="gamePopupButtons"></div>
            </div>
        `;
        popup.classList.add('active');
        
        // Add buttons with proper event listeners
        const buttonsContainer = document.getElementById('gamePopupButtons');
        if (buttons && buttons.length > 0) {
            buttons.forEach((btn, i) => {
                const button = document.createElement('button');
                button.className = 'popup-btn';
                button.textContent = btn.text;
                button.onclick = btn.onClick;
                buttonsContainer.appendChild(button);
            });
        } else {
            const button = document.createElement('button');
            button.className = 'popup-btn';
            button.textContent = 'OK';
            button.onclick = () => GamePopup.close();
            buttonsContainer.appendChild(button);
        }
    },
    
    close() {
        const popup = document.getElementById('gamePopup');
        if (popup) popup.classList.remove('active');
    }
};

// Export to window
window.SimpleSafariMode = SimpleSafariMode;
window.SimpleCustomization = SimpleCustomization;
window.GamePopup = GamePopup;
window.showSafariMode = (mode) => SimpleSafariMode.start(mode);
window.showCustomization = () => SimpleCustomization.showMenu();

console.log('✅ Safari Mode & Customization loaded!');


// Add CSS for popups
const popupStyles = document.createElement('style');
popupStyles.textContent = `
    .game-popup {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
    }
    
    .game-popup.active {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .popup-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
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
    
    .popup-icon {
        font-size: 4rem;
        margin-bottom: 20px;
    }
    
    .popup-title {
        font-size: 1.8rem;
        color: #F9FAFB;
        margin-bottom: 15px;
    }
    
    .popup-message {
        font-size: 1.1rem;
        color: #D1D5DB;
        line-height: 1.6;
        margin-bottom: 25px;
        white-space: pre-line;
    }
    
    .popup-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
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
    }
    
    .popup-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    }
`;
document.head.appendChild(popupStyles);
