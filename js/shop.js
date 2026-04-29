const LADDER_COST = 50;

class Shop {
    constructor() {
        this.isOpen = false;
        this.items = this.generateShopItems();
        this.ladderCount = 1;
    }

    generateShopItems() {
        const items = [];
        
        for (let level = 2; level <= 6; level++) {
            const pickaxe = PICKAXE_LEVELS[level];
            items.push({
                id: `pickaxe_${level}`,
                type: 'pickaxe',
                level: level,
                name: pickaxe.name,
                cost: pickaxe.cost,
                color: pickaxe.color
            });
        }
        
        return items;
    }

    open() {
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
    }

    toggle() {
        this.isOpen = !this.isOpen;
    }

    canBuy(itemId, player) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return false;
        
        if (item.type === 'pickaxe') {
            if (player.pickaxeLevel >= item.level) return false;
            if (player.pickaxeLevel !== item.level - 1) return false;
        }
        
        return player.gold >= item.cost;
    }

    canBuyLadder(count, player) {
        const totalCost = LADDER_COST * count;
        return player.gold >= totalCost;
    }

    buy(itemId, player) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return { success: false, message: '物品不存在' };
        
        if (!this.canBuy(itemId, player)) {
            if (player.gold < item.cost) {
                return { success: false, message: '金币不足！' };
            }
            if (item.type === 'pickaxe' && player.pickaxeLevel >= item.level) {
                return { success: false, message: '已拥有此装备！' };
            }
            if (item.type === 'pickaxe' && player.pickaxeLevel !== item.level - 1) {
                return { success: false, message: '请先升级上一级装备！' };
            }
            return { success: false, message: '无法购买' };
        }
        
        player.gold -= item.cost;
        
        if (item.type === 'pickaxe') {
            player.pickaxeLevel = item.level;
        }
        
        return { success: true, message: `成功购买 ${item.name}！` };
    }

    buyLadder(count, player) {
        const totalCost = LADDER_COST * count;
        
        if (player.gold < totalCost) {
            return { success: false, message: '金币不足！' };
        }
        
        player.gold -= totalCost;
        
        if (!player.inventory['LADDER']) {
            player.inventory['LADDER'] = {
                name: '梯子',
                count: 0,
                value: 0,
                icon: '🪜'
            };
        }
        player.inventory['LADDER'].count += count;
        
        return { success: true, message: `成功购买 ${count} 个梯子！` };
    }

    render(player) {
        const shopItems = document.getElementById('shop-items');
        if (!shopItems) return;
        
        shopItems.innerHTML = '';
        
        this.renderLadderSection(player, shopItems);
        
        this.renderPickaxeSection(player, shopItems);
    }

    renderLadderSection(player, container) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'shop-section';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'shop-section-header';
        headerDiv.innerHTML = '<span class="section-icon">🪜</span><span class="section-title">道具</span>';
        sectionDiv.appendChild(headerDiv);
        
        const ladderDiv = document.createElement('div');
        ladderDiv.className = 'shop-ladder-item';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'shop-ladder-info';
        
        const nameH4 = document.createElement('h4');
        nameH4.textContent = '梯子';
        nameH4.style.color = '#DEB887';
        
        const descP = document.createElement('p');
        descP.className = 'ladder-desc';
        descP.textContent = '用于快速返回地面，每个梯子可上升10层';
        
        const costP = document.createElement('p');
        costP.className = 'ladder-cost';
        costP.innerHTML = `<span style="color: #ffd700;">💰 ${LADDER_COST}</span> / 个`;
        
        infoDiv.appendChild(nameH4);
        infoDiv.appendChild(descP);
        infoDiv.appendChild(costP);
        
        const buyDiv = document.createElement('div');
        buyDiv.className = 'shop-ladder-buy';
        
        const countDiv = document.createElement('div');
        countDiv.className = 'ladder-count-control';
        
        const minusBtn = document.createElement('button');
        minusBtn.className = 'count-btn';
        minusBtn.textContent = '-';
        minusBtn.onclick = () => {
            if (this.ladderCount > 1) {
                this.ladderCount--;
                countSpan.textContent = this.ladderCount;
                totalCostSpan.innerHTML = `<span style="color: #ffd700;">💰 ${LADDER_COST * this.ladderCount}</span>`;
            }
        };
        
        const countSpan = document.createElement('span');
        countSpan.className = 'ladder-count';
        countSpan.textContent = this.ladderCount;
        
        const plusBtn = document.createElement('button');
        plusBtn.className = 'count-btn';
        plusBtn.textContent = '+';
        plusBtn.onclick = () => {
            if (this.ladderCount < 99) {
                this.ladderCount++;
                countSpan.textContent = this.ladderCount;
                totalCostSpan.innerHTML = `<span style="color: #ffd700;">💰 ${LADDER_COST * this.ladderCount}</span>`;
            }
        };
        
        countDiv.appendChild(minusBtn);
        countDiv.appendChild(countSpan);
        countDiv.appendChild(plusBtn);
        
        const totalCostSpan = document.createElement('p');
        totalCostSpan.className = 'ladder-total-cost';
        totalCostSpan.innerHTML = `总计: <span style="color: #ffd700;">💰 ${LADDER_COST * this.ladderCount}</span>`;
        
        const buyBtn = document.createElement('button');
        buyBtn.className = 'shop-upgrade-btn ladder-buy-btn';
        buyBtn.textContent = '购买';
        
        if (!this.canBuyLadder(this.ladderCount, player)) {
            buyBtn.textContent = '金币不足';
            buyBtn.disabled = true;
        } else {
            buyBtn.onclick = () => {
                const result = this.buyLadder(this.ladderCount, player);
                if (result.success) {
                    soundManager.playSell();
                    this.render(player);
                    if (window.game && window.game.ui) {
                        window.game.ui.updateStats(player);
                        window.game.ui.updateInventory(player);
                    }
                }
                alert(result.message);
            };
        }
        
        buyDiv.appendChild(countDiv);
        buyDiv.appendChild(totalCostSpan);
        buyDiv.appendChild(buyBtn);
        
        ladderDiv.appendChild(infoDiv);
        ladderDiv.appendChild(buyDiv);
        
        sectionDiv.appendChild(ladderDiv);
        container.appendChild(sectionDiv);
    }

    renderPickaxeSection(player, container) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'shop-section';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'shop-section-header';
        headerDiv.innerHTML = '<span class="section-icon">⛏️</span><span class="section-title">装备升级</span>';
        sectionDiv.appendChild(headerDiv);
        
        for (const item of this.items) {
            const div = document.createElement('div');
            div.className = 'shop-upgrade';
            
            const isOwned = item.type === 'pickaxe' && player.pickaxeLevel >= item.level;
            const canBuy = this.canBuy(item.id, player);
            const isNext = item.type === 'pickaxe' && player.pickaxeLevel === item.level - 1;
            
            if (isOwned) {
                div.classList.add('owned');
            }
            
            if (isNext && !isOwned) {
                div.classList.add('available');
            }
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'shop-upgrade-info';
            
            const nameH4 = document.createElement('h4');
            nameH4.textContent = item.name;
            nameH4.style.color = item.color;
            
            infoDiv.appendChild(nameH4);
            
            const compareDiv = this.createCompareDiv(player, item, isOwned, isNext);
            infoDiv.appendChild(compareDiv);
            
            const costP = document.createElement('p');
            costP.className = 'item-cost';
            costP.innerHTML = `<span style="color: #ffd700;">💰 ${item.cost}</span>`;
            infoDiv.appendChild(costP);
            
            const btn = document.createElement('button');
            btn.className = 'shop-upgrade-btn';
            
            if (isOwned) {
                btn.textContent = '已拥有 ✓';
                btn.disabled = true;
            } else if (!isNext) {
                btn.textContent = '未解锁';
                btn.disabled = true;
            } else if (canBuy) {
                btn.textContent = '购买';
                btn.onclick = () => {
                    const result = this.buy(item.id, player);
                    if (result.success) {
                        soundManager.playUpgrade();
                        this.render(player);
                        if (window.game && window.game.ui) {
                            window.game.ui.updateStats(player);
                            window.game.ui.checkAchievements(player);
                        }
                    }
                    alert(result.message);
                };
            } else {
                btn.textContent = '金币不足';
                btn.disabled = true;
            }
            
            div.appendChild(infoDiv);
            div.appendChild(btn);
            sectionDiv.appendChild(div);
        }
        
        container.appendChild(sectionDiv);
    }

    createCompareDiv(player, item, isOwned, isNext) {
        const compareDiv = document.createElement('div');
        compareDiv.className = 'stat-compare';
        
        const currentLevel = player.pickaxeLevel;
        const currentPickaxe = PICKAXE_LEVELS[currentLevel];
        const nextPickaxe = PICKAXE_LEVELS[item.level];
        
        if (isOwned) {
            const currentDiv = document.createElement('div');
            currentDiv.className = 'compare-column owned-column';
            currentDiv.innerHTML = `
                <div class="compare-header">当前装备</div>
                <div class="compare-name" style="color: ${currentPickaxe.color}">${currentPickaxe.name}</div>
                <div class="compare-stats">
                    <div class="stat-row">
                        <span class="stat-label">挖掘力:</span>
                        <span class="stat-value">${currentPickaxe.digPower}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">可挖硬度:</span>
                        <span class="stat-value">${currentPickaxe.maxHardness}</span>
                    </div>
                </div>
            `;
            compareDiv.appendChild(currentDiv);
        } else if (isNext) {
            const currentDiv = document.createElement('div');
            currentDiv.className = 'compare-column current-column';
            currentDiv.innerHTML = `
                <div class="compare-header">当前装备</div>
                <div class="compare-name" style="color: ${currentPickaxe.color}">${currentPickaxe.name}</div>
                <div class="compare-stats">
                    <div class="stat-row">
                        <span class="stat-label">挖掘力:</span>
                        <span class="stat-value">${currentPickaxe.digPower}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">可挖硬度:</span>
                        <span class="stat-value">${currentPickaxe.maxHardness}</span>
                    </div>
                </div>
            `;
            
            const arrowDiv = document.createElement('div');
            arrowDiv.className = 'compare-arrow';
            arrowDiv.innerHTML = '→';
            
            const nextDiv = document.createElement('div');
            nextDiv.className = 'compare-column next-column';
            
            const digDiff = (nextPickaxe.digPower - currentPickaxe.digPower).toFixed(1);
            const hardDiff = nextPickaxe.maxHardness - currentPickaxe.maxHardness;
            
            nextDiv.innerHTML = `
                <div class="compare-header">升级后</div>
                <div class="compare-name" style="color: ${nextPickaxe.color}">${nextPickaxe.name}</div>
                <div class="compare-stats">
                    <div class="stat-row">
                        <span class="stat-label">挖掘力:</span>
                        <span class="stat-value">${nextPickaxe.digPower}</span>
                        <span class="stat-diff positive">(+${digDiff})</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">可挖硬度:</span>
                        <span class="stat-value">${nextPickaxe.maxHardness}</span>
                        <span class="stat-diff positive">(+${hardDiff})</span>
                    </div>
                </div>
            `;
            
            compareDiv.appendChild(currentDiv);
            compareDiv.appendChild(arrowDiv);
            compareDiv.appendChild(nextDiv);
        } else {
            const lockedDiv = document.createElement('div');
            lockedDiv.className = 'compare-column locked-column';
            lockedDiv.innerHTML = `
                <div class="compare-header">未解锁</div>
                <div class="compare-name" style="color: ${nextPickaxe.color}">${nextPickaxe.name}</div>
                <div class="compare-stats">
                    <div class="stat-row">
                        <span class="stat-label">挖掘力:</span>
                        <span class="stat-value">${nextPickaxe.digPower}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">可挖硬度:</span>
                        <span class="stat-value">${nextPickaxe.maxHardness}</span>
                    </div>
                </div>
            `;
            compareDiv.appendChild(lockedDiv);
        }
        
        return compareDiv;
    }

    renderPreview(player) {
        const shopDisplay = document.getElementById('shop-display');
        if (!shopDisplay) return;
        
        shopDisplay.innerHTML = '';
        
        const nextLevel = player.pickaxeLevel + 1;
        if (nextLevel <= 6) {
            const nextPickaxe = PICKAXE_LEVELS[nextLevel];
            const div = document.createElement('div');
            div.className = 'shop-item-preview';
            div.innerHTML = `
                <strong style="color: ${nextPickaxe.color}">${nextPickaxe.name}</strong>
                <br>💰 ${nextPickaxe.cost} 金币
            `;
            shopDisplay.appendChild(div);
        } else {
            const div = document.createElement('div');
            div.className = 'shop-item-preview';
            div.innerHTML = '<strong>已满级！</strong>';
            shopDisplay.appendChild(div);
        }
    }
}
