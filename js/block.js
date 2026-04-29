const BLOCK_TYPES = {
    AIR: {
        id: 0,
        name: '空气',
        color: 'transparent',
        hardness: 0,
        value: 0,
        minDepth: 0,
        maxDepth: 100,
        rarity: 0
    },
    DIRT: {
        id: 1,
        name: '泥土',
        color: '#8B4513',
        hardness: 1,
        value: 1,
        minDepth: 0,
        maxDepth: 15,
        rarity: 0.8,
        icon: '🟤'
    },
    STONE: {
        id: 2,
        name: '石头',
        color: '#808080',
        hardness: 2,
        value: 2,
        minDepth: 10,
        maxDepth: 30,
        rarity: 0.7,
        icon: '⬜'
    },
    COPPER: {
        id: 3,
        name: '铜矿',
        color: '#CD7F32',
        hardness: 3,
        value: 5,
        minDepth: 25,
        maxDepth: 45,
        rarity: 0.4,
        icon: '🟠'
    },
    SILVER: {
        id: 4,
        name: '银矿',
        color: '#C0C0C0',
        hardness: 4,
        value: 10,
        minDepth: 40,
        maxDepth: 60,
        rarity: 0.3,
        icon: '⚪'
    },
    GOLD: {
        id: 5,
        name: '金矿',
        color: '#FFD700',
        hardness: 5,
        value: 20,
        minDepth: 55,
        maxDepth: 75,
        rarity: 0.2,
        icon: '🟡'
    },
    DIAMOND: {
        id: 6,
        name: '钻石',
        color: '#00CED1',
        hardness: 6,
        value: 50,
        minDepth: 70,
        maxDepth: 90,
        rarity: 0.1,
        icon: '💎'
    },
    RARE_GEM: {
        id: 7,
        name: '稀有宝石',
        color: '#9932CC',
        hardness: 7,
        value: 100,
        minDepth: 85,
        maxDepth: 100,
        rarity: 0.05,
        icon: '💜'
    },
    BEDROCK: {
        id: 8,
        name: '基岩',
        color: '#1a1a1a',
        hardness: 999,
        value: 0,
        minDepth: 99,
        maxDepth: 100,
        rarity: 1,
        icon: '⬛'
    },
    LADDER: {
        id: 9,
        name: '梯子',
        color: '#8B4513',
        hardness: 1,
        value: 0,
        minDepth: 0,
        maxDepth: 100,
        rarity: 0,
        icon: '🪜'
    }
};

class Block {
    constructor(type, gridX, gridY) {
        this.type = type;
        this.gridX = gridX;
        this.gridY = gridY;
        this.hardness = BLOCK_TYPES[type].hardness;
        this.value = BLOCK_TYPES[type].value;
        this.color = BLOCK_TYPES[type].color;
        this.name = BLOCK_TYPES[type].name;
        this.digProgress = 0;
        this.isDigging = false;
    }

    static getBlockTypeAtDepth(depth) {
        const possibleBlocks = [];
        
        for (const [key, blockType] of Object.entries(BLOCK_TYPES)) {
            if (blockType.id === 0 || blockType.id === 8) continue;
            
            if (depth >= blockType.minDepth && depth <= blockType.maxDepth) {
                possibleBlocks.push({
                    type: key,
                    rarity: blockType.rarity
                });
            }
        }
        
        if (possibleBlocks.length === 0) {
            return 'DIRT';
        }
        
        const rand = Math.random();
        let cumulativeRarity = 0;
        
        for (const block of possibleBlocks) {
            cumulativeRarity += block.rarity;
            if (rand < cumulativeRarity / possibleBlocks.length) {
                return block.type;
            }
        }
        
        return possibleBlocks[0].type;
    }

    draw(ctx, x, y, size) {
        if (this.type === 'AIR') return;
        
        ctx.fillStyle = this.color;
        ctx.fillRect(x, y, size, size);
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, size, size);
        
        if (this.digProgress > 0) {
            const alpha = this.digProgress / this.hardness;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            ctx.fillRect(x, y, size, size);
            
            const crackCount = Math.floor(this.digProgress / this.hardness * 5);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.lineWidth = 2;
            for (let i = 0; i < crackCount; i++) {
                const startX = x + Math.random() * size;
                const startY = y + Math.random() * size;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(startX + (Math.random() - 0.5) * size * 0.5, startY + (Math.random() - 0.5) * size * 0.5);
                ctx.stroke();
            }
        }
    }
}
