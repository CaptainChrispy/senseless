export class SnowEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.enabled = false;
    this.particles = [];
    this.particleCount = 500;
    this.time = 0;
    
    this.density = 1.0;
    this.fallSpeed = 0.01;
    this.swayAmount = 2.0; 
    this.swaySpeed = 3; 
  }

  initialize(player) {
    this.particles = [];
    const playerAngle = player.direction * Math.PI / 2;
    
    for (let i = 0; i < this.particleCount; i++) {
      const angleOffset = (Math.random() - 0.5) * Math.PI * 2;
      const angle = playerAngle + angleOffset;
      const distance = 0.5 + Math.random() * 7.5;
      
      this.particles.push({
        x: player.x + Math.cos(angle) * distance,
        y: player.y + Math.sin(angle) * distance,
        z: -0.5 + Math.random() * 3,
        size: 0.5 + Math.random() * 1.5,
        speed: 0.8 + Math.random() * 0.4,
        swayPhase: Math.random() * Math.PI * 2,
        swayFrequency: 0.8 + Math.random() * 0.4,
        opacity: 0.5 + Math.random() * 0.5
      });
    }
    
    this.lastPlayerX = player.x;
    this.lastPlayerY = player.y;
  }

  createParticle(player) {
    return {
      x: player.x + (Math.random() - 0.5) * 16,
      y: player.y + (Math.random() - 0.5) * 16,
      z: -0.5 + Math.random() * 3,
      size: 0.5 + Math.random() * 1.5,
      speed: 0.8 + Math.random() * 0.4,
      swayPhase: Math.random() * Math.PI * 2,
      swayFrequency: 0.8 + Math.random() * 0.4,
      opacity: 0.5 + Math.random() * 0.5
    };
  }

  update(player, deltaTime = 1/60) {
    if (!this.enabled) return;
    
    this.time += deltaTime;
    
    const playerMovedX = this.lastPlayerX !== undefined ? player.x - this.lastPlayerX : 0;
    const playerMovedY = this.lastPlayerY !== undefined ? player.y - this.lastPlayerY : 0;
    const playerMoved = Math.abs(playerMovedX) > 0.01 || Math.abs(playerMovedY) > 0.01;
    
    this.lastPlayerX = player.x;
    this.lastPlayerY = player.y;
    
    for (let particle of this.particles) {
      particle.z -= this.fallSpeed * particle.speed * deltaTime * 60;
      
      const sway = Math.sin(this.time * this.swaySpeed * particle.swayFrequency + particle.swayPhase);
      const swayDelta = sway * this.swayAmount * deltaTime * 60;
      particle.x += swayDelta * 0.01;
      
      if (particle.z < -0.5) {
        particle.z = 2.5 + Math.random() * 0.5;
        const angle = Math.random() * Math.PI * 2;
        const radius = 2 + Math.random() * 6;
        particle.x = player.x + Math.cos(angle) * radius;
        particle.y = player.y + Math.sin(angle) * radius;
      }
      
      const dx = particle.x - player.x;
      const dy = particle.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 8) {
        const playerAngle = player.direction * Math.PI / 2;
        const spreadAngle = (Math.random() - 0.5) * Math.PI;
        const spawnAngle = playerAngle + spreadAngle;
        const spawnDist = 3 + Math.random() * 4;
        
        particle.x = player.x + Math.cos(spawnAngle) * spawnDist;
        particle.y = player.y + Math.sin(spawnAngle) * spawnDist;
        particle.z = Math.random() * 2;
      }
      
      if (playerMoved && Math.random() < 0.3) {
        const moveAngle = Math.atan2(playerMovedY, playerMovedX);
        
        if (dist > 6 || Math.random() < 0.1) {
          const spawnDist = 5 + Math.random() * 3;
          const spawnSpread = (Math.random() - 0.5) * Math.PI * 1.5;
          
          particle.x = player.x + Math.cos(moveAngle + spawnSpread) * spawnDist;
          particle.y = player.y + Math.sin(moveAngle + spawnSpread) * spawnDist;
          particle.z = -0.5 + Math.random() * 3;
        }
      }
    }
  }

  render(player, fov = Math.PI / 3) {
    if (!this.enabled || this.particles.length === 0) return;
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    const halfHeight = height / 2;
    
    const playerAngle = player.direction * Math.PI / 2;
    const cosAngle = Math.cos(playerAngle);
    const sinAngle = Math.sin(playerAngle);
    
    const particlesWithDepth = this.particles.map(particle => {
      const dx = particle.x - player.x;
      const dy = particle.y - player.y;
      const relY = dx * cosAngle + dy * sinAngle;
      return { particle, depth: relY };
    }).filter(p => p.depth > 0.1)
      .sort((a, b) => b.depth - a.depth);
    
    for (let {particle, depth} of particlesWithDepth) {
      const dx = particle.x - player.x;
      const dy = particle.y - player.y;
      
      const relX = dx * sinAngle - dy * cosAngle;
      const relY = depth;
      
      const distance = relY;
      const screenX = width / 2 + (relX / relY) * (width / 2) / Math.tan(fov / 2);
      
      const projectionDist = halfHeight / Math.tan(fov / 2);
      const verticalScale = 2.5;
      const verticalOffset = ((particle.z - 0.5) * projectionDist * verticalScale) / distance;
      const screenY = halfHeight - verticalOffset;
      
      if (screenX < -20 || screenX > width + 20 || screenY < -20 || screenY > height + 20) {
        continue;
      }
      
      const baseSize = (particle.size * 100) / Math.max(0.5, distance);
      const size = Math.min(baseSize, 3);
      
      let opacity = particle.opacity * this.density;
      
      if (distance > 4) {
        opacity *= Math.max(0, 1 - (distance - 4) / 3);
      }
      
      if (distance < 0.5) {
        opacity *= distance / 0.5;
      }
      
      const motionBlur = distance < 1.5 ? (1.5 - distance) / 1.5 : 0;
      
      this.drawSnowflake(screenX, screenY, size, opacity, motionBlur);
    }
  }

  drawSnowflake(x, y, size, opacity, motionBlur = 0) {
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    
    if (motionBlur > 0.1) {
      const blurHeight = 3 + motionBlur * 15;
      const gradient = this.ctx.createLinearGradient(x, y - blurHeight/2, x, y + blurHeight/2);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x - size/2, y - blurHeight/2, size, blurHeight);
    } else {
      const brightness = 200 + Math.random() * 55;
      this.ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
      
      const pixelSize = Math.max(1, Math.ceil(size));
      this.ctx.fillRect(x - pixelSize/2, y - pixelSize/2, pixelSize, pixelSize);
    }
    
    this.ctx.restore();
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  toggle() {
    this.enabled = !this.enabled;
  }

  setDensity(density) {
    this.density = Math.max(0, Math.min(1, density));
  }

  setFallSpeed(speed) {
    this.fallSpeed = speed;
  }

  setSwayAmount(amount) {
    this.swayAmount = amount;
  }
}
