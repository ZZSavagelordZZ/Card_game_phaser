// Shared UI utilities for gradients, textures, and cards
export function drawDiamondPattern(ctx, width, height) {
  const diamondSize = 75;
  const spacing = diamondSize * 0.75;
  const cols = Math.ceil(width / spacing) + 3;
  const rows = Math.ceil(height / spacing) + 4;
  const colors = [
    'rgba(255, 255, 255, 0.3)',
    'rgba(240, 240, 255, 0.25)',
    'rgba(255, 240, 240, 0.25)',
    'rgba(240, 255, 240, 0.2)'
  ];
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  const startOffset = -spacing * 1.5;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = (row % 2 === 0) ? 0 : spacing / 2;
      const x = startOffset + col * spacing + offsetX;
      const y = startOffset + row * spacing;
      const colorIndex = (row + col) % colors.length;
      ctx.fillStyle = colors[colorIndex];
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.moveTo(0, -diamondSize / 2);
      ctx.lineTo(diamondSize / 2, 0);
      ctx.lineTo(0, diamondSize / 2);
      ctx.lineTo(-diamondSize / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
  // Accent diamonds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 0.5;
  const accentSize = diamondSize * 0.45;
  const accentSpacing = spacing * 0.6;
  const accentRows = Math.ceil(height / accentSpacing) + 4;
  const accentCols = Math.ceil(width / accentSpacing) + 4;
  for (let row = 0; row < accentRows; row++) {
    for (let col = 0; col < accentCols; col++) {
      const offsetX = (row % 2 === 0) ? 0 : accentSpacing / 2;
      const x = -accentSpacing * 1.5 + col * accentSpacing + offsetX;
      const y = -accentSpacing * 1.5 + row * accentSpacing;
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.moveTo(0, -accentSize / 2);
      ctx.lineTo(accentSize / 2, 0);
      ctx.lineTo(0, accentSize / 2);
      ctx.lineTo(-accentSize / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
}

export function createGradientBackground(scene, texKey, width, height) {
  if (scene.textures.exists(texKey)) {
    scene.textures.remove(texKey);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  drawDiamondPattern(ctx, width, height);
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'rgba(220, 53, 69, 0.7)');
  gradient.addColorStop(1, 'rgba(0, 123, 255, 0.7)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  scene.textures.addCanvas(texKey, canvas);
  return texKey;
}

export function lightenColor(color, amount) {
  const r = Math.min(255, ((color >> 16) & 0xff) + Math.floor(255 * amount));
  const g = Math.min(255, ((color >> 8) & 0xff) + Math.floor(255 * amount));
  const b = Math.min(255, (color & 0xff) + Math.floor(255 * amount));
  return (r << 16) | (g << 8) | b;
}

export function darkenColor(color, amount) {
  const r = Math.max(0, ((color >> 16) & 0xff) - Math.floor(255 * amount));
  const g = Math.max(0, ((color >> 8) & 0xff) - Math.floor(255 * amount));
  const b = Math.max(0, (color & 0xff) - Math.floor(255 * amount));
  return (r << 16) | (g << 8) | b;
}

// Unified card textures (front and back)
export function ensureUnifiedCardBack(scene, key, bgColor = 0x4ecdc4) {
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  const w = 80, h = 120, border = 6, radius = 12;
  g.fillStyle(0xffffff, 1);
  g.fillRoundedRect(0, 0, w, h, radius);
  g.fillStyle(bgColor, 1);
  g.fillRoundedRect(border, border, w - border * 2, h - border * 2, radius - 2);
  // simple pattern
  g.fillStyle(lightenColor(bgColor, 0.2), 0.5);
  g.fillCircle(w / 2, h / 2, 16);
  g.generateTexture(key, w, h);
  g.destroy();
  return key;
}

export function ensureUnifiedCardFront(scene, key, label = '', color = 0xffffff) {
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  const w = 80, h = 120, border = 6, radius = 12;
  g.fillStyle(0xffffff, 1);
  g.fillRoundedRect(0, 0, w, h, radius);
  g.fillStyle(color, 1);
  g.fillRoundedRect(border, border, w - border * 2, h - border * 2, radius - 2);
  g.generateTexture(key, w, h);
  g.destroy();
  return key;
}

export function drawSectionTexture(scene, key, width, height) {
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  const bg = scene.add.graphics();
  // subtle diagonal lines
  const baseColor = 0x000000;
  const stripe = 0xffffff;
  bg.fillStyle(0x000000, 0.25);
  bg.fillRect(0, 0, width, height);
  g.lineStyle(1, 0xffffff, 0.1);
  const step = 10;
  for (let x = -height; x < width + height; x += step) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + height, height);
    g.strokePath();
  }
  const rtKey = `${key}__rt`;
  const rt = scene.make.renderTexture({ x: 0, y: 0, width, height, add: false });
  rt.draw(bg, 0, 0);
  rt.draw(g, 0, 0);
  rt.saveTexture(key);
  g.destroy();
  bg.destroy();
  rt.destroy();
  return key;
}


