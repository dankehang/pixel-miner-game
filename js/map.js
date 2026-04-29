class GameMap {
    constructor(width, height, blockSize) {
        this.width = width;
        this.height = height;
        this.blockSize = blockSize;
        this.blocks = [];
        this.maxDepth = 100;
        this.generateMap();
    }

    generateMap() {
        this.blocks = [];
        
        for (let y = 0; y < this.maxDepth; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                let blockType;
                
                if (y === 0) {
                    blockType = 'AIR';
                } else if (y >= this.maxDepth - 1) {
                    blockType = 'BEDROCK';
                } else {
                    blockType = Block.getBlockTypeAtDepth(y);
                }
                
                row.push(new Block(blockType, x, y));
            }
            this.blocks.push(row);
        }
    }

    getBlock(gridX, gridY) {
        if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.maxDepth) {
            return null;
        }
        return this.blocks[gridY][gridX];
    }

    setBlock(gridX, gridY, blockType) {
        if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.maxDepth) {
            return false;
        }
        this.blocks[gridY][gridX] = new Block(blockType, gridX, gridY);
        return true;
    }

    removeBlock(gridX, gridY) {
        return this.setBlock(gridX, gridY, 'AIR');
    }

    digBlock(gridX, gridY, digPower) {
        const block = this.getBlock(gridX, gridY);
        if (!block || block.type === 'AIR' || block.type === 'BEDROCK') {
            return { success: false, block: null };
        }
        
        block.digProgress += digPower;
        block.isDigging = true;
        
        if (block.digProgress >= block.hardness) {
            const collectedBlock = {
                type: block.type,
                name: block.name,
                value: block.value
            };
            this.removeBlock(gridX, gridY);
            return { success: true, block: collectedBlock };
        }
        
        return { success: false, block: null, progress: block.digProgress / block.hardness };
    }

    draw(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
        const startGridX = Math.max(0, Math.floor(cameraX / this.blockSize));
        const startGridY = Math.max(0, Math.floor(cameraY / this.blockSize));
        const endGridX = Math.min(this.width, Math.ceil((cameraX + canvasWidth) / this.blockSize) + 1);
        const endGridY = Math.min(this.maxDepth, Math.ceil((cameraY + canvasHeight) / this.blockSize) + 1);
        
        for (let y = startGridY; y < endGridY; y++) {
            for (let x = startGridX; x < endGridX; x++) {
                const block = this.blocks[y][x];
                const screenX = x * this.blockSize - cameraX;
                const screenY = y * this.blockSize - cameraY;
                
                block.draw(ctx, screenX, screenY, this.blockSize);
            }
        }
    }

    getDepthColor(depth) {
        const ratio = Math.min(depth / this.maxDepth, 1);
        const r = Math.floor(26 - ratio * 20);
        const g = Math.floor(26 - ratio * 20);
        const b = Math.floor(46 - ratio * 30);
        return `rgb(${r}, ${g}, ${b})`;
    }
}
