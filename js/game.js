class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.blockSize = 32;
        this.mapWidth = 20;
        this.canvasWidth = this.mapWidth * this.blockSize;
        this.canvasHeight = 600;
        
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        this.map = new GameMap(this.mapWidth, this.canvasHeight, this.blockSize);
        this.player = new Player(Math.floor(this.mapWidth / 2), 0, this.blockSize);
        this.shop = new Shop();
        this.ui = new UI();
        this.particleSystem = new ParticleSystem();
        
        this.cameraX = 0;
        this.cameraY = 0;
        
        this.isRunning = false;
        this.isPaused = false;
        
        this.keys = {};
        this.lastMoveTime = 0;
        this.moveDelay = 150;
        this.lastDigTime = 0;
        this.digDelay = 100;
        this.lastGravityTime = 0;
        this.gravityDelay = 80;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('load-btn').addEventListener('click', () => this.loadGame());
        document.getElementById('shop-btn').addEventListener('click', () => this.toggleShop());
        document.getElementById('close-shop').addEventListener('click', () => this.toggleShop());
    }

    handleKeyDown(e) {
        if (!this.isRunning || this.isPaused) return;
        
        this.keys[e.code] = true;
        
        if (e.code === 'KeyE') {
            this.toggleShop();
            e.preventDefault();
        }
        
        if (e.code === 'KeyR') {
            this.returnToSurface();
            e.preventDefault();
        }
        
        if (e.code === 'KeyT') {
            const result = this.player.placeLadder(this.map);
            if (result) {
                this.ui.showMessage(result.message, result.success ? 'success' : 'warning');
                this.ui.updateAll(this.player);
            }
            e.preventDefault();
        }
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
        
        if (e.code === 'Space') {
            this.player.isDigging = false;
        }
    }

    toggleShop() {
        this.ui.toggleShop(this.shop, this.player);
        this.isPaused = this.shop.isOpen;
    }

    returnToSurface() {
        this.player.gridX = Math.floor(this.mapWidth / 2);
        this.player.gridY = 0;
        this.player.x = this.player.gridX * this.blockSize;
        this.player.y = this.player.gridY * this.blockSize;
        this.updateCamera();
        this.ui.showMessage('已返回地面！', 'info');
    }

    start() {
        this.ui.hideStartScreen();
        this.isRunning = true;
        this.isPaused = false;
        
        soundManager.init();
        soundManager.setVolume(this.ui.getVolume());
        
        this.ui.updateAll(this.player);
        this.ui.updateAchievementsList();
        this.shop.renderPreview(this.player);
        this.gameLoop();
    }

    startNew() {
        this.map = new GameMap(this.mapWidth, this.canvasHeight, this.blockSize);
        this.player = new Player(Math.floor(this.mapWidth / 2), 0, this.blockSize);
        this.shop = new Shop();
        this.start();
    }

    gameLoop() {
        if (!this.isRunning) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        if (this.isPaused) return;
        
        const now = Date.now();
        
        if (now - this.lastGravityTime > this.gravityDelay) {
            this.player.applyGravity(this.map);
            this.lastGravityTime = now;
        }
        
        if (now - this.lastMoveTime > this.moveDelay) {
            let moved = false;
            
            if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
                this.player.move(-1, 0, this.map);
                moved = true;
            } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
                this.player.move(1, 0, this.map);
                moved = true;
            } else if (this.keys['ArrowDown'] || this.keys['KeyS']) {
                this.player.move(0, 1, this.map);
                moved = true;
            } else if (this.keys['ArrowUp'] || this.keys['KeyW']) {
                this.player.move(0, -1, this.map);
                moved = true;
            }
            
            if (moved) {
                this.lastMoveTime = now;
                this.ui.checkAchievements(this.player);
            }
        }
        
        if (now - this.lastDigTime > this.digDelay) {
            if (this.keys['Space']) {
                soundManager.resume();
                const result = this.player.dig(this.map);
                if (result && result.success) {
                    const block = result.block;
                    const particleX = (block.gridX + 0.5) * this.blockSize;
                    const particleY = (block.gridY + 0.5) * this.blockSize;
                    this.particleSystem.emit(particleX, particleY, block.color, 15);
                    soundManager.playDig();
                    soundManager.playCollect();
                    this.ui.updateAll(this.player);
                    this.shop.renderPreview(this.player);
                    this.ui.checkAchievements(this.player);
                }
                this.lastDigTime = now;
            }
        }
        
        this.particleSystem.update();
        this.updateCamera();
    }

    updateCamera() {
        const targetCameraY = this.player.y - this.canvasHeight / 2;
        
        this.cameraY += (targetCameraY - this.cameraY) * 0.1;
        
        this.cameraY = Math.max(0, this.cameraY);
    }

    getTargetBlock() {
        let targetGridX = this.player.gridX;
        let targetGridY = this.player.gridY;
        
        switch (this.player.facingDirection) {
            case 'right': targetGridX++; break;
            case 'left': targetGridX--; break;
            case 'down': targetGridY++; break;
            case 'up': targetGridY--; break;
        }
        
        return { gridX: targetGridX, gridY: targetGridY };
    }

    render() {
        this.ctx.fillStyle = '#0a0a15';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        const depthGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        const depth = Math.floor(this.cameraY / this.blockSize);
        const depthRatio = Math.min(depth / 100, 1);
        
        depthGradient.addColorStop(0, `rgb(${26 - depthRatio * 15}, ${26 - depthRatio * 15}, ${46 - depthRatio * 25})`);
        depthGradient.addColorStop(1, `rgb(${15 - depthRatio * 10}, ${15 - depthRatio * 10}, ${35 - depthRatio * 20})`);
        
        this.ctx.fillStyle = depthGradient;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        this.map.draw(this.ctx, this.cameraX, this.cameraY, this.canvasWidth, this.canvasHeight);
        
        this.player.draw(this.ctx, this.cameraX, this.cameraY);
        
        this.drawTargetBlockHighlight();
        
        this.ui.drawDepthIndicator(this.ctx, this.player, this.canvasWidth);
    }

    drawTargetBlockHighlight() {
        const target = this.getTargetBlock();
        const targetBlock = this.map.getBlock(target.gridX, target.gridY);
        
        if (!targetBlock || targetBlock.type === 'AIR') return;
        
        const screenX = target.gridX * this.blockSize - this.cameraX;
        const screenY = target.gridY * this.blockSize - this.cameraY;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screenX, screenY, this.blockSize, this.blockSize);
        
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.15)';
        this.ctx.fillRect(screenX, screenY, this.blockSize, this.blockSize);
    }

    saveGame() {
        const saveData = {
            player: this.player.save(),
            timestamp: Date.now()
        };
        
        localStorage.setItem('pixelMinerSave', JSON.stringify(saveData));
        this.ui.showMessage('游戏已保存！', 'success');
    }

    loadGame() {
        const saveData = localStorage.getItem('pixelMinerSave');
        if (!saveData) {
            this.ui.showMessage('没有找到存档！', 'warning');
            return false;
        }
        
        try {
            const data = JSON.parse(saveData);
            this.player.load(data.player);
            this.ui.hideStartScreen();
            this.isRunning = true;
            this.isPaused = false;
            this.updateCamera();
            this.ui.updateAll(this.player);
            this.shop.renderPreview(this.player);
            this.gameLoop();
            this.ui.showMessage('游戏已加载！', 'success');
            return true;
        } catch (e) {
            this.ui.showMessage('存档损坏！', 'error');
            return false;
        }
    }

    autoSave() {
        if (this.isRunning && !this.isPaused) {
            this.saveGame();
        }
    }
}
