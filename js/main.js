let game = null;

document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    window.game = game;
    
    setInterval(() => {
        if (game && game.isRunning) {
            game.autoSave();
        }
    }, 30000);
    
    window.addEventListener('beforeunload', () => {
        if (game && game.isRunning) {
            game.saveGame();
        }
    });
    
    console.log('⛏️ 像素矿工已加载！');
    console.log('操作说明：');
    console.log('- 方向键/WASD: 移动');
    console.log('- 空格键: 挖掘');
    console.log('- E: 打开商店');
    console.log('- R: 返回地面');
});
