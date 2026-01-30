// 春节烟花模拟器
class Firework {
    constructor(x, y, color = 'red') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = Math.random() * 3 + 2;
        this.angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.gravity = 0.05;
        this.friction = 0.99;
        this.particles = [];
        this.exploded = false;
        this.life = 100;
        this.size = 3;
    }

    update() {
        if (!this.exploded) {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            
            this.life--;
            
            // 随机爆炸
            if (this.life <= 0 || Math.random() < 0.02) {
                this.explode();
            }
        } else {
            // 更新粒子
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const particle = this.particles[i];
                particle.update();
                
                if (particle.life <= 0) {
                    this.particles.splice(i, 1);
                }
            }
        }
    }

    explode() {
        this.exploded = true;
        // 不同颜色的烟花有不同的粒子数量
        let particleCount = 100;
        switch(this.color) {
            case 'gold': particleCount = 150; break;
            case 'orange': particleCount = 120; break;
            case 'pink': particleCount = 130; break;
            case 'red': particleCount = 110; break;
            case 'blue': particleCount = 100; break;
        }
        
        for (let i = 0; i < particleCount; i++) {
            const speed = Math.random() * 3 + 1;
            const angle = Math.random() * Math.PI * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = Math.random() * 50 + 50;
            
            this.particles.push(new Particle(this.x, this.y, vx, vy, this.color, life));
        }
        
        // 播放爆炸音效
        this.playExplosionSound();
    }

    playExplosionSound() {
        try {
            // 创建音频元素
            const audio = new Audio('launching-fireworks-into-the-sky.mp3');
            
            // 根据颜色设置不同的播放速率和音量
            let playbackRate = 1.0;
            let volume = 0.3;
            
            switch(this.color) {
                case 'red': 
                    playbackRate = 1.0;
                    volume = 0.35;
                    break;
                case 'gold': 
                    playbackRate = 1.2;
                    volume = 0.4;
                    break;
                case 'orange': 
                    playbackRate = 0.95;
                    volume = 0.38;
                    break;
                case 'pink': 
                    playbackRate = 1.15;
                    volume = 0.36;
                    break;
                case 'blue': 
                    playbackRate = 1.1;
                    volume = 0.35;
                    break;
            }
            
            // 设置音频属性
            audio.playbackRate = playbackRate;
            audio.volume = volume;
            
            // 随机偏移播放位置，避免所有声音同时开始
            const randomOffset = Math.random() * 0.5;
            audio.currentTime = randomOffset;
            
            // 播放音频
            audio.play().catch(e => {
                console.log('音频播放失败:', e);
            });
            
            // 音频播放结束后移除引用
            audio.onended = () => {
                audio.remove();
            };
            
        } catch (e) {
            console.log('音频创建失败:', e);
            // 如果MP3播放失败，回退到原来的音效
            this.playFallbackSound();
        }
    }

    playFallbackSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            // 根据颜色设置不同的频率
            let frequency = 440;
            switch(this.color) {
                case 'red': frequency = 440; break;
                case 'gold': frequency = 523.25; break;
                case 'orange': frequency = 493.88; break; // B4
                case 'pink': frequency = 554.37; break; // C#5
                case 'blue': frequency = 659.25; break;
            }
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('备用音效播放失败:', e);
        }
    }

    draw(ctx) {
        if (!this.exploded) {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // 添加拖尾效果
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
            ctx.stroke();
            ctx.restore();
        } else {
            // 绘制所有粒子
            this.particles.forEach(particle => particle.draw(ctx));
        }
    }
}

class Particle {
    constructor(x, y, vx, vy, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.size = Math.random() * 3 + 1;
        this.gravity = 0.05;
        this.friction = 0.97;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.size *= 0.98;
    }

    draw(ctx) {
        const alpha = this.life / 100;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 烟花管理器
class FireworksManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.fireworks = [];
        this.isRunning = true;
        
        // 预加载音频
        this.preloadAudio();
        
        // 设置画布大小
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 点击画布发射烟花
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.launchRandomFirework(x, y);
        });
        
        // 开始动画循环
        this.animate();
    }

    preloadAudio() {
        // 预加载音频文件，提高播放响应速度
        try {
            this.audio = new Audio('launching-fireworks-into-the-sky.mp3');
            this.audio.preload = 'auto';
            this.audio.load();
        } catch (e) {
            console.log('音频预加载失败:', e);
        }
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    launchFirework(x, y, color) {
        const firework = new Firework(x, y, color);
        this.fireworks.push(firework);
    }

    launchRandomFirework(x, y) {
        const colors = ['red', 'gold', 'orange', 'pink', 'blue'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        this.launchFirework(x, y, color);
    }

    clearFireworks() {
        this.fireworks = [];
    }

    animate() {
        if (!this.isRunning) return;
        
        // 清空画布
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 添加背景星星
        this.drawStars();
        
        // 更新和绘制所有烟花
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const firework = this.fireworks[i];
            firework.update();
            firework.draw(this.ctx);
            
            // 移除已经消失的烟花
            if (firework.exploded && firework.particles.length === 0) {
                this.fireworks.splice(i, 1);
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }

    drawStars() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 23) % this.canvas.height;
            const size = Math.sin(Date.now() * 0.001 + i) * 1.5 + 1.5;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}

// 全局函数供按钮调用
let fireworksManager;

function initFireworks() {
    fireworksManager = new FireworksManager('fireworksCanvas');
}

function launchFirework(color) {
    const canvas = document.getElementById('fireworksCanvas');
    const x = Math.random() * canvas.width;
    const y = canvas.height;
    fireworksManager.launchFirework(x, y, color);
}

function launchMultipleFireworks() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const colors = ['red', 'gold', 'orange', 'pink', 'blue'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            launchFirework(color);
        }, i * 200);
    }
}

function clearFireworks() {
    fireworksManager.clearFireworks();
}

// 页面加载完成后初始化
window.addEventListener('load', initFireworks);