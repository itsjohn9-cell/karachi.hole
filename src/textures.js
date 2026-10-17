import * as THREE from 'three';

// Procedurally generate authentic Karachi textures with Canvas 2D
export const TextureGenerator = {
  // 1. Authentic Karachi Open Gutter / Manhole Texture (کھلا گٹر / KMC Sewer Manhole)
  createManholeGutterTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Outer dark broken asphalt / road surround
    ctx.fillStyle = '#1c1f24';
    ctx.fillRect(0, 0, 512, 512);

    const cx = 256;
    const cy = 256;

    // Outer concrete chipped collar
    ctx.beginPath();
    ctx.arc(cx, cy, 240, 0, Math.PI * 2);
    ctx.fillStyle = '#616771';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#2d3239';
    ctx.stroke();

    // Rusted cast iron manhole rim ring
    ctx.beginPath();
    ctx.arc(cx, cy, 218, 0, Math.PI * 2);
    ctx.fillStyle = '#2b2927';
    ctx.fill();
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#8d6e63'; // Rust orange-brown tone
    ctx.stroke();

    // Heavy iron radial cleats & bolt rivets around the rim
    const cleats = 24;
    for (let i = 0; i < cleats; i++) {
      const angle = (i * Math.PI * 2) / cleats;
      const rx = cx + Math.cos(angle) * 205;
      const ry = cy + Math.sin(angle) * 205;

      ctx.beginPath();
      ctx.arc(rx, ry, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd54f'; // Rusted metal bolt
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#3e2723';
      ctx.stroke();
    }

    // Embossed circular text: "KMC • SEWERAGE BOARD KARACHI • DANGER"
    ctx.fillStyle = '#d7ccc8';
    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★ KMC SEWERAGE KARACHI ★', cx, 80);
    ctx.fillText('DANGER • خطرہ • OPEN GUTTER', cx, 435);

    // Inner open sewer void: Dark murky black-green sludge with ripples
    const sewerGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 185);
    sewerGrad.addColorStop(0, '#020503'); // Total darkness center
    sewerGrad.addColorStop(0.65, '#0a160d'); // Murky greenish sewer water
    sewerGrad.addColorStop(0.92, '#142718'); // Oily green scum rim
    sewerGrad.addColorStop(1, '#332415'); // Wet iron lip
    ctx.beginPath();
    ctx.arc(cx, cy, 185, 0, Math.PI * 2);
    ctx.fillStyle = sewerGrad;
    ctx.fill();

    // Subtle murky sludge ripples & bubbles
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.4)';
    ctx.lineWidth = 3;
    for (let r = 40; r <= 150; r += 35) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
  },

  // 2. High-Definition Crisp Asphalt Road with Sharp Markings (Zero Moiré Blur)
  createCrispRoadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Clean matte dark asphalt foundation (no random noise specks that cause moiré blur)
    ctx.fillStyle = '#22262e';
    ctx.fillRect(0, 0, 512, 512);

    // Curbside concrete storm drainage gutters (both sides)
    ctx.fillStyle = '#2d333c';
    ctx.fillRect(0, 0, 20, 512);
    ctx.fillRect(492, 0, 20, 512);

    // Sewer iron drain grates along gutters every 128px
    ctx.fillStyle = '#14181d';
    for (let y = 30; y < 512; y += 128) {
      // Left drain grate
      ctx.fillRect(4, y, 14, 36);
      ctx.strokeStyle = '#4e5661';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(4, y, 14, 36);

      // Right drain grate
      ctx.fillRect(494, y, 14, 36);
      ctx.strokeRect(494, y, 14, 36);
    }

    // Crisp white solid shoulder lines
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(24, 0, 8, 512);
    ctx.fillRect(480, 0, 8, 512);

    // Vibrant Yellow Center Dashed Divider Line (Sharp, clean, well-spaced)
    ctx.fillStyle = '#ffca28';
    for (let y = 16; y < 512; y += 128) {
      ctx.fillRect(250, y, 12, 68);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 20); // 20 crisp repeats across 200m = 10m clean dash intervals
    texture.anisotropy = 16;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  },

  // 3. Pakistani Truck Art Pattern
  createTruckArtTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#ff1493');
    gradient.addColorStop(0.35, '#ff8c00');
    gradient.addColorStop(0.7, '#ffd700');
    gradient.addColorStop(1, '#00ced1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    ctx.lineWidth = 12;
    ctx.strokeStyle = '#fffb00';
    ctx.strokeRect(10, 10, 492, 492);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(18, 18, 476, 476);

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

      ctx.beginPath();
      ctx.ellipse(80, 0, 40, 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#ff007f' : '#ff6f00';
      ctx.fill();
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 45, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0055';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
  },

  // 4. Traditional Sindh Ajrak Pattern
  createAjrakTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8b0000';
    ctx.fillRect(0, 0, 256, 256);

    const tileSize = 64;
    for (let x = 0; x < 256; x += tileSize) {
      for (let y = 0; y < 256; y += tileSize) {
        if ((x / tileSize + y / tileSize) % 2 === 0) {
          ctx.fillStyle = '#0c2340';
          ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
        }

        const tcx = x + tileSize / 2;
        const tcy = y + tileSize / 2;

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

        ctx.beginPath();
        ctx.arc(tcx, tcy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#c00000';
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
  },

  // 5. Lyari Nullah Toxic Slime Rim Pattern
  createLyariSlimeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#1b5e20');
    grad.addColorStop(0.5, '#76ff03');
    grad.addColorStop(1, '#00e676');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#003300';
    for (let i = 0; i < 200; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, 4 + Math.random() * 12, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
  },

  // 6. Shop Signboard
  createShopSignTexture(text, subtext = '', bgColor = '#d32f2f', textColor = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 512, 128);

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(6, 6, 500, 116);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 36px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, subtext ? 48 : 64);

    if (subtext) {
      ctx.fillStyle = '#ffe082';
      ctx.font = 'bold 20px "Outfit", sans-serif';
      ctx.fillText(subtext, 256, 92);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
  },

  // 7. Truck Art Taj
  createTruckTajTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, '#ff3d00');
    grad.addColorStop(0.5, '#ffea00');
    grad.addColorStop(1, '#00e5ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

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

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ماشاءاللہ ★ KARACHI', 256, 50);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
  }
};
