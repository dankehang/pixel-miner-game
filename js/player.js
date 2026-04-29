const PICKAXE_LEVELS = {
    1: { name: '木镐', digPower: 0.5, maxHardness: 2, color: '#8B4513', cost: 0 },
    2: { name: '石镐', digPower: 0.8, maxHardness: 3, color: '#808080', cost: 100 },
    3: { name: '铜镐', digPower: 1.2, maxHardness: 4, color: '#CD7F32', cost: 300 },
    4: { name: '银镐', digPower: 1.8, maxHardness: 5, color: '#C0C0C0', cost: 600 },
    5: { name: '金镐', digPower: 2.5, maxHardness: 6, color: '#FFD700', cost: 1200 },
    6: { name: '钻石镐', digPower: 4, maxHardness: 7, color: '#00CED1', cost: 3000 }
};

class Player {
    constructor(gridX, gridY, blockSize) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.blockSize = blockSize;
        this.x = gridX * blockSize;
        this.y = gridY * blockSize;
        
        this.gold = 0;
        this.totalGoldEarned = 0;
        this.pickaxeLevel = 1;
        this.inventory = {};
        
        this.moveSpeed = blockSize;
        this.facingDirection = 'down';
        this.isDigging = false;
        this.digTarget = null;
        
        this.fallSpeed = 0;
        this.maxFallSpeed = 3;
        this.gravity = 0.5;
        this.isOnGround = false;
        this.isFalling = false;
        this.fallStartY = 0;
        
        this.color = '#32CD32';
        this.eyeColor = '#fff';
        this.hatColor = '#4169E1';
        
        this.ladders = 0;
    }

    get digPower() {
        return PICKAXE_LEVELS[this.pickaxeLevel].digPower;
    }

    get maxHardness() {
        return PICKAXE_LEVELS[this.pickaxeLevel].maxHardness;
    }

    get pickaxeName() {
        return PICKAXE_LEVELS[this.pickaxeLevel].name;
    }

    get depth() {
        return this.gridY;
    }

    move(dx, dy, gameMap) {
        if (this.isDigging) return false;
        
        const newGridX = this.gridX + dx;
        const newGridY = this.gridY + dy;
        
        if (newGridX < 0 || newGridX >= gameMap.width || 
            newGridY < 0 || newGridY >= gameMap.maxDepth) {
            return false;
        }
        
        if (dx > 0) this.facingDirection = 'right';
        else if (dx < 0) this.facingDirection = 'left';
        else if (dy > 0) this.facingDirection = 'down';
        else if (dy < 0) this.facingDirection = 'up';
        
        const targetBlock = gameMap.getBlock(newGridX, newGridY);
        
        if (dy < 0) {
            const currentBlock = gameMap.getBlock(this.gridX, this.gridY);
            if (currentBlock && currentBlock.type === 'LADDER') {
                if (!targetBlock || targetBlock.type === 'AIR') {
                    this.gridX = newGridX;
                    this.gridY = newGridY;
                    this.x = this.gridX * this.blockSize;
                    this.y = this.gridY * this.blockSize;
                    return true;
                }
            }
        }
        
        if (targetBlock && targetBlock.type === 'AIR') {
            this.gridX = newGridX;
            this.gridY = newGridY;
            this.x = this.gridX * this.blockSize;
            this.y = this.gridY * this.blockSize;
            return true;
        }
        
        return false;
    }
    
    isOnLadder(gameMap) {
        const currentBlock = gameMap.getBlock(this.gridX, this.gridY);
        return currentBlock && currentBlock.type === 'LADDER';
    }
    
    placeLadder(gameMap) {
        if (this.ladders <= 0) {
            return { success: false, message: '没有梯子了！' };
        }
        
        const blockBelow = gameMap.getBlock(this.gridX, this.gridY + 1);
        if (!blockBelow || blockBelow.type === 'AIR') {
            return { success: false, message: '需要站在方块上放置梯子！' };
        }
        
        const currentBlock = gameMap.getBlock(this.gridX, this.gridY);
        if (currentBlock && currentBlock.type !== 'AIR') {
            return { success: false, message: '当前位置有方块！' };
        }
        
        gameMap.setBlock(this.gridX, this.gridY, 'LADDER');
        this.ladders--;
        return { success: true, message: '梯子放置成功！' };
    }

    checkGround(gameMap) {
        const belowY = this.gridY + 1;
        if (belowY >= gameMap.maxDepth) {
            this.isOnGround = true;
            return true;
        }
        
        const blockBelow = gameMap.getBlock(this.gridX, belowY);
        this.isOnGround = blockBelow && blockBelow.type !== 'AIR';
        return this.isOnGround;
    }

    startFall() {
        if (!this.isFalling) {
            this.isFalling = true;
            this.fallStartY = this.gridY;
            this.fallSpeed = 0;
        }
    }

    applyGravity(gameMap) {
        if (this.isDigging) return false;
        
        if (this.isOnLadder(gameMap)) {
            if (this.isFalling) {
                this.isFalling = false;
                this.fallSpeed = 0;
            }
            return false;
        }
        
        if (!this.checkGround(gameMap)) {
            if (!this.isFalling) {
                this.startFall();
            }
            
            this.fallSpeed = Math.min(this.fallSpeed + this.gravity, this.maxFallSpeed);
            
            const targetGridY = this.gridY + 1;
            if (targetGridY < gameMap.maxDepth) {
                const blockBelow = gameMap.getBlock(this.gridX, targetGridY);
                if (!blockBelow || blockBelow.type === 'AIR') {
                    this.gridY = targetGridY;
                    this.y = this.gridY * this.blockSize;
                    return true;
                }
            }
        } else {
            if (this.isFalling) {
                this.isFalling = false;
                this.fallSpeed = 0;
            }
        }
        
        return false;
    }

    dig(gameMap) {
        if (this.isDigging) return null;
        
        let targetGridX = this.gridX;
        let targetGridY = this.gridY;
        
        switch (this.facingDirection) {
            case 'right': targetGridX++; break;
            case 'left': targetGridX--; break;
            case 'down': targetGridY++; break;
            case 'up': targetGridY--; break;
        }
        
        const targetBlock = gameMap.getBlock(targetGridX, targetGridY);
        if (!targetBlock || targetBlock.type === 'AIR' || targetBlock.type === 'BEDROCK') {
            return null;
        }
        
        if (targetBlock.hardness > this.maxHardness) {
            return { success: false, message: '镐子等级不足！' };
        }
        
        this.isDigging = true;
        this.digTarget = { gridX: targetGridX, gridY: targetGridY };
        
        const result = gameMap.digBlock(targetGridX, targetGridY, this.digPower);
        
        if (result.success) {
            this.collect(result.block);
            this.isDigging = false;
            this.digTarget = null;
            
            this.gridX = targetGridX;
            this.gridY = targetGridY;
            this.x = this.gridX * this.blockSize;
            this.y = this.gridY * this.blockSize;
        }
        
        return result;
    }

    collect(block) {
        if (!block || !block.type) return;
        
        if (!this.inventory[block.type]) {
            this.inventory[block.type] = {
                name: block.name,
                count: 0,
                value: block.value,
                icon: BLOCK_TYPES[block.type].icon || '📦'
            };
        }
        
        this.inventory[block.type].count++;
        this.gold += block.value;
        this.totalGoldEarned += block.value;
    }

    getTotalOres() {
        let total = 0;
        for (const type in this.inventory) {
            total += this.inventory[type].count;
        }
        return total;
    }

    hasCollected(blockType) {
        return this.inventory[blockType] && this.inventory[blockType].count > 0;
    }

    sellAll() {
        let totalSold = 0;
        for (const type in this.inventory) {
            const item = this.inventory[type];
            totalSold += item.count * item.value;
            item.count = 0;
        }
        
        this.gold += totalSold;
        this.cleanInventory();
        return totalSold;
    }

    cleanInventory() {
        for (const type in this.inventory) {
            if (this.inventory[type].count <= 0) {
                delete this.inventory[type];
            }
        }
    }

    upgradePickaxe() {
        const nextLevel = this.pickaxeLevel + 1;
        if (nextLevel > 6) return { success: false, message: '已达最高等级！' };
        
        const cost = PICKAXE_LEVELS[nextLevel].cost;
        if (this.gold < cost) {
            return { success: false, message: `金币不足！需要 ${cost} 金币` };
        }
        
        this.gold -= cost;
        this.pickaxeLevel = nextLevel;
        return { success: true, message: `升级成功！获得 ${PICKAXE_LEVELS[nextLevel].name}` };
    }

    canUpgrade() {
        const nextLevel = this.pickaxeLevel + 1;
        if (nextLevel > 6) return false;
        return this.gold >= PICKAXE_LEVELS[nextLevel].cost;
    }

    draw(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        const size = this.blockSize;
        
        ctx.save();
        
        if (this.isFalling) {
            const stretchFactor = 1 + this.fallSpeed * 0.05;
            ctx.translate(screenX + size / 2, screenY);
            ctx.scale(1 / stretchFactor, stretchFactor);
            ctx.translate(-(screenX + size / 2), -screenY);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            for (let i = 0; i < 3; i++) {
                const trailY = screenY - (i + 1) * (size * 0.3);
                const alpha = 0.3 - i * 0.1;
                ctx.fillStyle = `rgba(50, 205, 50, ${alpha})`;
                ctx.fillRect(screenX + 4, trailY + 4, size - 8, size - 8);
            }
        }
        
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX + 2, screenY + 2, size - 4, size - 4);
        
        ctx.fillStyle = this.hatColor;
        ctx.fillRect(screenX + 4, screenY + 2, size - 8, size / 3);
        
        ctx.fillStyle = this.eyeColor;
        const eyeSize = 4;
        const eyeY = screenY + size / 2 - 2;
        
        if (this.isFalling) {
            ctx.fillRect(screenX + size / 3, eyeY - 2, eyeSize, eyeSize + 2);
            ctx.fillRect(screenX + size * 2 / 3 - eyeSize, eyeY - 2, eyeSize, eyeSize + 2);
        } else {
            switch (this.facingDirection) {
                case 'right':
                    ctx.fillRect(screenX + size - eyeSize - 6, eyeY, eyeSize, eyeSize);
                    ctx.fillRect(screenX + size - eyeSize - 12, eyeY, eyeSize, eyeSize);
                    break;
                case 'left':
                    ctx.fillRect(screenX + 6, eyeY, eyeSize, eyeSize);
                    ctx.fillRect(screenX + 12, eyeY, eyeSize, eyeSize);
                    break;
                case 'up':
                    ctx.fillRect(screenX + size / 3, eyeY, eyeSize, eyeSize);
                    ctx.fillRect(screenX + size * 2 / 3 - eyeSize, eyeY, eyeSize, eyeSize);
                    break;
                case 'down':
                default:
                    ctx.fillRect(screenX + size / 3, eyeY, eyeSize, eyeSize);
                    ctx.fillRect(screenX + size * 2 / 3 - eyeSize, eyeY, eyeSize, eyeSize);
                    break;
            }
        }
        
        const pickaxeColor = PICKAXE_LEVELS[this.pickaxeLevel].color;
        ctx.fillStyle = pickaxeColor;
        
        if (this.isDigging) {
            ctx.save();
            ctx.translate(screenX + size / 2, screenY + size / 2);
            ctx.rotate(Math.sin(Date.now() / 50) * 0.5);
            ctx.fillRect(size / 4, -2, size / 2, 4);
            ctx.restore();
        } else if (!this.isFalling) {
            ctx.fillRect(screenX + size - 6, screenY + size / 2 - 2, size / 3, 4);
        }
        
        ctx.restore();
    }

    save() {
        return {
            gridX: this.gridX,
            gridY: this.gridY,
            gold: this.gold,
            totalGoldEarned: this.totalGoldEarned,
            pickaxeLevel: this.pickaxeLevel,
            inventory: this.inventory,
            ladders: this.ladders
        };
    }

    load(data) {
        this.gridX = data.gridX || 10;
        this.gridY = data.gridY || 0;
        this.gold = data.gold || 0;
        this.totalGoldEarned = data.totalGoldEarned || 0;
        this.pickaxeLevel = data.pickaxeLevel || 1;
        this.inventory = data.inventory || {};
        this.ladders = data.ladders || 0;
        this.x = this.gridX * this.blockSize;
        this.y = this.gridY * this.blockSize;
    }
}
