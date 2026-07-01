(function() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = 0;
  let mouseY = 0;
  let animationId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.hue = Math.random() * 60 + 240;
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.life = Math.random() * 200 + 100;
      this.maxLife = this.life;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life--;

      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const force = (150 - dist) / 150 * 0.3;
        this.x += (dx / dist) * force;
        this.y += (dy / dist) * force;
      }

      this.pulse += this.pulseSpeed;
      const pulseOpacity = Math.sin(this.pulse) * 0.3 + 0.5;

      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height || this.life <= 0) {
        this.reset();
        this.life = this.maxLife;
      }

      this.currentOpacity = this.opacity * pulseOpacity;
    }

    draw() {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
      gradient.addColorStop(0, `hsla(${this.hue}, 80%, 70%, ${this.currentOpacity})`);
      gradient.addColorStop(1, `hsla(${this.hue}, 80%, 70%, 0)`);

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(255, 100%, 90%, ${this.currentOpacity * 0.8})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    const count = Math.min(Math.floor(canvas.width * canvas.height / 8000), 120);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    animationId = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    particles.forEach(p => {
      p.x = Math.random() * canvas.width;
      p.y = Math.random() * canvas.height;
    });
  });

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  });

  init();
  animate();
})();
