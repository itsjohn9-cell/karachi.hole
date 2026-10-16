import * as THREE from 'three';

// Procedurally generate authentic Karachi textures with Canvas 2D
export const TextureGenerator = {
  // Pakistani Truck Art Pattern (Kaleidoscopic floral motifs, bright yellow, orange, turquoise, pink)
  createTruckArtTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Vibrant background bands
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#ff1493'); // Deep pink
    gradient.addColorStop(0.35, '#ff8c00'); // Dark orange
    gradient.addColorStop(0.7, '#ffd700'); // Gold
    gradient.addColorStop(1, '#00ced1'); // Dark turquoise
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Decorative geometric border
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#fffb00';
    ctx.strokeRect(10, 10, 492, 492);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(18, 18, 476, 476);

    // Central floral medallion (classic truck art sunburst)
    const cx = 256;
    const cy = 256;
    const petals = 12;
    for (let i = 0; i < petals; i++) {
      const angle = (i * Math.PI * 2) / petals;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(80, 0, 60, 24, 0, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#00e5ff' : '#ffea00';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000';
      ctx.stroke();

      // Inner petal highlight
      ctx.beginPath();
      ctx.ellipse(80, 0, 40, 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#ff007f' : '#ff6f00';
      ctx.fill();
      ctx.restore();
    }

    // Inner medallion circle
    ctx.beginPath();
    ctx.arc(cx, cy, 45, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0055';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // Center eye motif
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#00f0ff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // Corner decorative rosettes
    const corners = [[60, 60], [452, 60], [60, 452], [452, 452]];
    corners.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 32, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ff0055';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#00e5ff';
      ctx.fill();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // Traditional Sindh Ajrak Pattern (Deep crimson, royal indigo blue, geometric floral grid)
  createAjrakTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Deep crimson red background
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(0, 0, 256, 256);

    // Navy indigo blue tiles
    const tileSize = 64;
    for (let x = 0; x < 256; x += tileSize) {
      for (let y = 0; y < 256; y += tileSize) {
        if ((x / tileSize + y / tileSize) % 2 === 0) {
          ctx.fillStyle = '#0c2340'; // Deep indigo blue
          ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
        }

        // Geometric star / floral motif in each tile
        const tcx = x + tileSize / 2;
        const tcy = y + tileSize / 2;

        // White floral star
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          const r = i % 2 === 0 ? 18 : 8;
          const px = tcx + Math.cos(a) * r;
          const py = tcy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Inner red dot
        ctx.beginPath();
        ctx.arc(tcx, tcy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#c00000';
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  },

  // Asphalt Road Texture with Lane Markings
  createRoadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Dark grey asphalt with subtle noise
    ctx.fillStyle = '#22252a';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle grain
    ctx.fillStyle = '#2d3137';
    for (let i = 0; i < 2000; i++) {
      const rx = Math.random() * 256;
      const ry = Math.random() * 256;
      ctx.fillRect(rx, ry, 1.5, 1.5);
    }

    // Yellow dashed center line
    ctx.fillStyle = '#f5c518';
    ctx.fillRect(123, 10, 10, 60);
    ctx.fillRect(123, 100, 10, 60);
    ctx.fillRect(123, 190, 10, 60);

    // White solid curb lines
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(8, 0, 6, 256);
    ctx.fillRect(242, 0, 6, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 4);
    return texture;
  },

  // Zebra Crossing Texture
  createZebraTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#22252a';
    ctx.fillRect(0, 0, 256, 128);

    ctx.fillStyle = '#f0f0f0';
    for (let x = 16; x < 256; x += 36) {
      ctx.fillRect(x, 8, 20, 112);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // Shop Signboards (Authentic Karachi shops)
  createShopSignTexture(text, subtext = '', bgColor = '#d32f2f', textColor = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 512, 128);

    // Outer border
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(6, 6, 500, 116);

    // Title
    ctx.fillStyle = textColor;
    ctx.font = 'bold 36px "Outfit", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, subtext ? 48 : 64);

    // Subtitle
    if (subtext) {
      ctx.fillStyle = '#ffe082';
      ctx.font = 'bold 20px "Outfit", "Segoe UI", sans-serif';
      ctx.fillText(subtext, 256, 92);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // Truck Art Crown (Taj) Texture
  createTruckTajTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Radiant orange-red gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, '#ff3d00');
    grad.addColorStop(0.5, '#ffea00');
    grad.addColorStop(1, '#00e5ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Peacock feather eye motifs
    for (let x = 80; x < 512; x += 110) {
      ctx.beginPath();
      ctx.ellipse(x, 128, 40, 70, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#00c853';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffd600';
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(x, 135, 25, 45, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#0091ea';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, 145, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#ff1744';
      ctx.fill();
    }

    // Urdu calligraphic flourishes
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ماشاءاللہ ★ KARACHI', 256, 50);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
};
