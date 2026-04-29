const ACHIEVEMENTS = {
    FIRST_DIVE: {
        id: 'FIRST_DIVE',
        name: '首次下潜',
        description: '到达第5层',
        icon: '🏊',
        condition: (player) => player.depth >= 5
    },
    DEEP_DIG: {
        id: 'DEEP_DIG',
        name: '深入地下',
        description: '到达第25层',
        icon: '🕳️',
        condition: (player) => player.depth >= 25
    },
    MINER_NOVICE: {
        id: 'MINER_NOVICE',
        name: '矿工新手',
        description: '收集10个矿石',
        icon: '🪨',
        condition: (player) => player.getTotalOres() >= 10
    },
    MINER_EXPERT: {
        id: 'MINER_EXPERT',
        name: '矿工达人',
        description: '收集100个矿石',
        icon: '⛏️',
        condition: (player) => player.getTotalOres() >= 100
    },
    WEALTH: {
        id: 'WEALTH',
        name: '财富积累',
        description: '获得1000金币',
        icon: '💰',
        condition: (player) => player.totalGoldEarned >= 1000
    },
    UPGRADE: {
        id: 'UPGRADE',
        name: '装备升级',
        description: '首次升级镐子',
        icon: '🔧',
        condition: (player) => player.pickaxeLevel >= 2
    },
    ABYSS: {
        id: 'ABYSS',
        name: '深渊探索',
        description: '到达第50层',
        icon: '🌑',
        condition: (player) => player.depth >= 50
    },
    TREASURE_HUNTER: {
        id: 'TREASURE_HUNTER',
        name: '宝藏猎人',
        description: '收集钻石',
        icon: '💎',
        condition: (player) => player.hasCollected('DIAMOND')
    },
    ULTIMATE_MINER: {
        id: 'ULTIMATE_MINER',
        name: '终极矿工',
        description: '到达第100层',
        icon: '🏆',
        condition: (player) => player.depth >= 100
    }
};

class UI {
    constructor() {
        this.depthDisplay = document.getElementById('depth-display');
        this.goldDisplay = document.getElementById('gold-display');
        this.pickaxeDisplay = document.getElementById('pickaxe-display');
        this.ladderDisplay = document.getElementById('ladder-display');
        this.inventoryDisplay = document.getElementById('inventory-display');
        this.shopModal = document.getElementById('shop-modal');
        this.startScreen = document.getElementById('start-screen');
        this.loadBtn = document.getElementById('load-btn');
        this.achievementsDisplay = document.getElementById('achievements-display');
        this.settingsModal = document.getElementById('settings-modal');
        this.settingsBtn = document.getElementById('settings-btn');
        this.closeSettingsBtn = document.getElementById('close-settings');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeValue = document.getElementById('volume-value');
        
        this.unlockedAchievements = new Set();
        
        this.defaultSettings = {
            volume: 0.5,
            keyBindings: {
                up: ['ArrowUp', 'KeyW'],
                down: ['ArrowDown', 'KeyS'],
                left: ['ArrowLeft', 'KeyA'],
                right: ['ArrowRight', 'KeyD'],
                dig: ['Space'],
                shop: ['KeyE'],
                returnToSurface: ['KeyR']
            }
        };
        
        this.settings = this.loadSettings();
        this.loadAchievements();
        this.updateLoadButton();
        this.initSettingsEvents();
    }

    updateStats(player) {
        if (this.depthDisplay) {
            this.depthDisplay.textContent = `${player.depth} 层`;
        }
        if (this.goldDisplay) {
            this.goldDisplay.textContent = player.gold.toLocaleString();
        }
        if (this.pickaxeDisplay) {
            this.pickaxeDisplay.textContent = player.pickaxeName;
            this.pickaxeDisplay.style.color = PICKAXE_LEVELS[player.pickaxeLevel].color;
        }
        if (this.ladderDisplay) {
            this.ladderDisplay.textContent = `🪜 ${player.ladders}`;
        }
    }

    updateInventory(player) {
        if (!this.inventoryDisplay) return;
        
        this.inventoryDisplay.innerHTML = '';
        
        const types = Object.keys(player.inventory);
        if (types.length === 0) {
            this.inventoryDisplay.innerHTML = '<p style="color: #666; text-align: center;">背包空空如也...</p>';
            return;
        }
        
        for (const type of types) {
            const item = player.inventory[type];
            if (item.count <= 0) continue;
            
            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.innerHTML = `
                <span class="item-name">${item.icon} ${item.name}</span>
                <span class="item-count">x${item.count}</span>
            `;
            this.inventoryDisplay.appendChild(div);
        }
    }

    updateAll(player) {
        this.updateStats(player);
        this.updateInventory(player);
    }

    showShop(shop, player) {
        if (this.shopModal) {
            this.shopModal.classList.remove('hidden');
            shop.render(player);
        }
    }

    hideShop() {
        if (this.shopModal) {
            this.shopModal.classList.add('hidden');
        }
    }

    toggleShop(shop, player) {
        if (this.shopModal) {
            if (shop.isOpen) {
                this.hideShop();
                shop.close();
            } else {
                this.showShop(shop, player);
                shop.open();
            }
        }
    }

    hideStartScreen() {
        if (this.startScreen) {
            this.startScreen.classList.add('hidden');
        }
    }

    showStartScreen() {
        if (this.startScreen) {
            this.startScreen.classList.remove('hidden');
        }
    }

    updateLoadButton() {
        if (this.loadBtn) {
            const hasSave = localStorage.getItem('pixelMinerSave');
            this.loadBtn.style.display = hasSave ? 'block' : 'none';
        }
    }

    showMessage(message, type = 'info') {
        const colors = {
            info: '#87ceeb',
            success: '#32cd32',
            warning: '#ffd700',
            error: '#ff6b6b'
        };
        
        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: ${colors[type]};
            padding: 15px 30px;
            border-radius: 8px;
            border: 2px solid ${colors[type]};
            font-size: 1.1em;
            z-index: 1000;
            animation: fadeInOut 2s forwards;
        `;
        msgDiv.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                15% { opacity: 1; transform: translateX(-50%) translateY(0); }
                85% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(msgDiv);
        
        setTimeout(() => {
            msgDiv.remove();
        }, 2000);
    }

    drawDepthIndicator(ctx, player, canvasWidth) {
        const depth = player.depth;
        const maxDepth = 100;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvasWidth - 30, 10, 20, 200);
        
        const depthRatio = depth / maxDepth;
        const indicatorHeight = 200 * depthRatio;
        
        const gradient = ctx.createLinearGradient(0, 10, 0, 210);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(0.25, '#808080');
        gradient.addColorStop(0.5, '#CD7F32');
        gradient.addColorStop(0.75, '#FFD700');
        gradient.addColorStop(1, '#9932CC');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(canvasWidth - 28, 12, 16, indicatorHeight);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvasWidth - 30, 10, 20, 200);
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(`${depth}层`, canvasWidth - 20, 230);
    }

    initSettingsEvents() {
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => this.showSettings());
        }
        
        if (this.closeSettingsBtn) {
            this.closeSettingsBtn.addEventListener('click', () => this.hideSettings());
        }
        
        if (this.settingsModal) {
            this.settingsModal.addEventListener('click', (e) => {
                if (e.target === this.settingsModal) {
                    this.hideSettings();
                }
            });
        }
        
        if (this.volumeSlider) {
            this.volumeSlider.value = this.settings.volume * 100;
            this.volumeValue.textContent = `${Math.round(this.settings.volume * 100)}%`;
            
            this.volumeSlider.addEventListener('input', (e) => {
                const value = e.target.value / 100;
                this.settings.volume = value;
                this.volumeValue.textContent = `${e.target.value}%`;
                soundManager.setVolume(value);
                this.saveSettings();
            });
        }
    }

    showSettings() {
        if (this.settingsModal) {
            this.settingsModal.classList.remove('hidden');
        }
    }

    hideSettings() {
        if (this.settingsModal) {
            this.settingsModal.classList.add('hidden');
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('pixelMinerSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('pixelMinerSettings');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    ...this.defaultSettings,
                    ...parsed,
                    keyBindings: {
                        ...this.defaultSettings.keyBindings,
                        ...(parsed.keyBindings || {})
                    }
                };
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
        return { ...this.defaultSettings };
    }

    getVolume() {
        return this.settings.volume;
    }

    getKeyBindings() {
        return this.settings.keyBindings;
    }

    loadAchievements() {
        try {
            const saved = localStorage.getItem('pixelMinerAchievements');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.unlockedAchievements = new Set(parsed);
            }
        } catch (e) {
            console.error('Failed to load achievements:', e);
        }
    }

    saveAchievements() {
        try {
            localStorage.setItem('pixelMinerAchievements', JSON.stringify([...this.unlockedAchievements]));
        } catch (e) {
            console.error('Failed to save achievements:', e);
        }
    }

    checkAchievements(player) {
        for (const key in ACHIEVEMENTS) {
            const achievement = ACHIEVEMENTS[key];
            if (!this.unlockedAchievements.has(achievement.id)) {
                if (achievement.condition(player)) {
                    this.unlockAchievement(achievement);
                }
            }
        }
    }

    unlockAchievement(achievement) {
        this.unlockedAchievements.add(achievement.id);
        this.saveAchievements();
        this.updateAchievementsList();
        
        soundManager.playAchievement();
        
        this.showMessage(`🏆 成就解锁: ${achievement.name}`, 'success');
    }

    updateAchievementsList() {
        if (!this.achievementsDisplay) return;
        
        this.achievementsDisplay.innerHTML = '';
        
        const achievements = Object.values(ACHIEVEMENTS);
        
        for (const achievement of achievements) {
            const div = document.createElement('div');
            div.className = 'achievement-item';
            
            const isUnlocked = this.unlockedAchievements.has(achievement.id);
            
            div.innerHTML = `
                <span class="achievement-icon">${isUnlocked ? achievement.icon : '🔒'}</span>
                <span class="achievement-name" style="color: ${isUnlocked ? '#ffd700' : '#666'}">${achievement.name}</span>
            `;
            
            div.title = achievement.description;
            
            this.achievementsDisplay.appendChild(div);
        }
    }
}
