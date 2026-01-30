// 接红包游戏
class RedPacketGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.basket = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            width: 100,
            height: 30,
            speed: 8
        };
        this.items = [];
        this.score = 0;
        this.lives = 3;
        this.gameSpeed = 2;
        this.spawnRate = 60; // 每60帧生成一个物品
        this.frameCount = 0;
        this.isRunning = false;
        this.gameOver = false;
        
        // 设置画布大小
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 鼠标控制
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isRunning || this.gameOver) return;
            const rect = this.canvas.getBoundingClientRect();
            this.basket.x = e.clientX - rect.left;
            
            // 限制篮子不超出画布
            if (this.basket.x < this.basket.width / 2) {
                this.basket.x = this.basket.width / 2;
            }
            if (this.basket.x > this.canvas.width - this.basket.width / 2) {
                this.basket.x = this.canvas.width - this.basket.width / 2;
            }
        });
        
        // 加载图像
        this.loadImages();
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.basket.y = this.canvas.height - 50;
    }

    loadImages() {
        // 创建红包图像
        this.redPacketImg = this.createRedPacketImage();
        this.firecrackerImg = this.createFirecrackerImage();
        this.basketImg = this.createBasketImage();
    }

    createRedPacketImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        
        // 绘制红包
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(5, 0, 30, 50);
        
        // 金色边框
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(5, 0, 30, 50);
        
        // 金色装饰
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(5, 0, 30, 10);
        
        // "福"字
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('福', 20, 30);
        
        return canvas;
    }

    createFirecrackerImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 30;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        
        // 绘制鞭炮
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(10, 0, 10, 50);
        
        // 金色装饰
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(10, 0, 10, 10);
        ctx.fillRect(10, 20, 10, 5);
        ctx.fillRect(10, 35, 10, 5);
        
        // 引线
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(15, -10);
        ctx.stroke();
        
        return canvas;
    }

    createBasketImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 30;
        const ctx = canvas.getContext('2d');
        
        // 绘制篮子
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, 100, 20);
        
        // 篮子边缘
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 100, 20);
        
        // 篮子内部
        ctx.fillStyle = '#D2691E';
        ctx.fillRect(5, 5, 90, 10);
        
        // 篮子把手
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(50, -5, 15, 0, Math.PI, true);
        ctx.stroke();
        
        return canvas;
    }

    start() {
        if (this.gameOver) {
            this.reset();
        }
        this.isRunning = true;
        this.gameOver = false;
        this.animate();
    }

    pause() {
        this.isRunning = false;
    }

    reset() {
        this.items = [];
        this.score = 0;
        this.lives = 3;
        this.gameSpeed = 2;
        this.spawnRate = 60;
        this.frameCount = 0;
        this.gameOver = false;
        this.updateScoreDisplay();
    }

    spawnItem() {
        const type = Math.random() < 0.7 ? 'redPacket' : 'firecracker';
        const x = Math.random() * (this.canvas.width - 50) + 25;
        const speed = Math.random() * 2 + this.gameSpeed;
        
        this.items.push({
            x: x,
            y: -50,
            type: type,
            speed: speed,
            width: type === 'redPacket' ? 40 : 30,
            height: 60,
            rotation: 0,
            rotationSpeed: Math.random() * 0.1 - 0.05
        });
    }

    update() {
        if (!this.isRunning || this.gameOver) return;
        
        this.frameCount++;
        
        // 生成新物品
        if (this.frameCount % this.spawnRate === 0) {
            this.spawnItem();
            
            // 随着时间增加难度
            if (this.frameCount % 600 === 0) {
                this.gameSpeed += 0.5;
                this.spawnRate = Math.max(30, this.spawnRate - 5);
            }
        }
        
        // 更新物品位置
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            
            // 跳过爆炸粒子，它们在drawExplosion中更新
            if (item.type === 'explosion') {
                continue;
            }
            
            item.y += item.speed;
            item.rotation += item.rotationSpeed;
            
            // 检查碰撞
            if (this.checkCollision(item)) {
                if (item.type === 'redPacket') {
                    this.score += 10;
                    this.playSound('collect');
                    
                    // 每接住10个红包获得额外生命
                    if (this.score % 100 === 0) {
                        this.lives = Math.min(5, this.lives + 1);
                    }
                } else {
                    this.lives--;
                    this.playSound('explode');
                    
                    // 添加爆炸效果
                    this.createExplosion(item.x, item.y);
                    
                    if (this.lives <= 0) {
                        this.gameOver = true;
                        this.isRunning = false;
                        this.showGameOver();
                    }
                }
                
                this.items.splice(i, 1);
                this.updateScoreDisplay();
                continue;
            }
            
            // 移除超出屏幕的物品（只处理红包和鞭炮）
            if (item.y > this.canvas.height + 50) {
                this.items.splice(i, 1);
            }
        }
    }

    checkCollision(item) {
        const basketLeft = this.basket.x - this.basket.width / 2;
        const basketRight = this.basket.x + this.basket.width / 2;
        const basketTop = this.basket.y - this.basket.height / 2;
        const basketBottom = this.basket.y + this.basket.height / 2;
        
        const itemLeft = item.x - item.width / 2;
        const itemRight = item.x + item.width / 2;
        const itemTop = item.y - item.height / 2;
        const itemBottom = item.y + item.height / 2;
        
        return !(itemLeft > basketRight || 
                itemRight < basketLeft || 
                itemTop > basketBottom || 
                itemBottom < basketTop);
    }

    createExplosion(x, y) {
        // 创建爆炸粒子
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 30;
            
            this.items.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                type: 'explosion',
                life: life,
                size: Math.random() * 5 + 2,
                color: `hsl(${Math.random() * 60}, 100%, 50%)`
            });
        }
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景装饰
        this.drawBackground();
        
        // 绘制所有物品
        this.items.forEach(item => {
            if (item.type === 'explosion') {
                this.drawExplosion(item);
            } else {
                this.drawItem(item);
            }
        });
        
        // 绘制篮子
        this.drawBasket();
        
        // 绘制游戏状态
        this.drawGameStatus();
    }

    drawBackground() {
        // 绘制星星
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 20; i++) {
            const x = (i * 79) % this.canvas.width;
            const y = (i * 47) % (this.canvas.height / 2);
            const size = Math.sin(Date.now() * 0.001 + i) * 1 + 1;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 绘制云朵
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 3; i++) {
            const x = (Date.now() * 0.01 + i * 200) % (this.canvas.width + 200) - 100;
            const y = 50 + i * 40;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20, 0, Math.PI * 2);
            this.ctx.arc(x + 25, y - 10, 25, 0, Math.PI * 2);
            this.ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawItem(item) {
        this.ctx.save();
        this.ctx.translate(item.x, item.y);
        this.ctx.rotate(item.rotation);
        
        if (item.type === 'redPacket') {
            this.ctx.drawImage(this.redPacketImg, -20, -30);
        } else {
            this.ctx.drawImage(this.firecrackerImg, -15, -30);
        }
        
        this.ctx.restore();
    }

    drawExplosion(particle) {
        const alpha = particle.life / 30;
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        // 更新爆炸粒子
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1;
        particle.life--;
        particle.size *= 0.95;
    }

    drawBasket() {
        this.ctx.save();
        this.ctx.translate(this.basket.x, this.basket.y);
        this.ctx.drawImage(this.basketImg, -50, -15);
        this.ctx.restore();
    }

    drawGameStatus() {
        // 绘制分数和生命值
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`得分: ${this.score}`, 20, 40);
        this.ctx.fillText(`生命: ${this.lives}`, 20, 70);
        
        // 绘制游戏状态提示
        if (!this.isRunning && !this.gameOver) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('点击"开始游戏"按钮开始', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    showGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText(`最终得分: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('点击"重新开始"按钮再试一次', this.canvas.width / 2, this.canvas.height / 2 + 70);
    }

    playSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            if (type === 'collect') {
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
            } else if (type === 'explode') {
                oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.5);
            }
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
        } catch (e) {
            console.log('音频播放失败:', e);
        }
    }

    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
    }

    animate() {
        if (!this.isRunning) return;
        
        this.update();
        this.draw();
        
        // 更新爆炸粒子
        for (let i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i].type === 'explosion' && this.items[i].life <= 0) {
                this.items.splice(i, 1);
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// 全局游戏实例
let redPacketGame;

function initRedPacketGame() {
    redPacketGame = new RedPacketGame('redPacketCanvas');
}

function startGame() {
    redPacketGame.start();
}

function pauseGame() {
    redPacketGame.pause();
}

function resetGame() {
    redPacketGame.reset();
    redPacketGame.start();
}

// 页面加载完成后初始化
window.addEventListener('load', initRedPacketGame);