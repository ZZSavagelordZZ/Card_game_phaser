export default class RulesScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RulesScene' });
  }

  create() {
    const { width, height } = this.scale;
    const mode = this.registry.get('selectedMode') || 'maths';
    const isMobile = width < 768;

    // Background: same gradient as other scenes + textured overlay like GameScene
    // Use or create gradient texture
    const bgKey = 'rulesGradient';
    if (this.textures.exists(bgKey)) this.textures.remove(bgKey);
    // Create via Start/Mode utils (replicate to avoid import cycle)
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    // simple diamond pattern + gradient
    // Reuse similar logic lightly for no import overhead
    const diamondSize = 60;
    const spacing = diamondSize * 0.75;
    const cols = Math.ceil(width / spacing) + 3;
    const rows = Math.ceil(height / spacing) + 4;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    const startOffset = -spacing * 1.5;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const offsetX = (r % 2 === 0) ? 0 : spacing / 2;
        const x = startOffset + c * spacing + offsetX;
        const y = startOffset + r * spacing;
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.moveTo(0, -diamondSize / 2);
        ctx.lineTo(diamondSize / 2, 0);
        ctx.lineTo(0, diamondSize / 2);
        ctx.lineTo(-diamondSize / 2, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
    }
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(220, 53, 69, 0.7)');
    gradient.addColorStop(1, 'rgba(0, 123, 255, 0.7)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    this.textures.addCanvas(bgKey, canvas);
    this.bg = this.add.image(0, 0, bgKey).setOrigin(0, 0);
    this.bg.setDisplaySize(width, height);
    this.bg.setDepth(-100);

    // Overlay texture covering entire screen
    this.overlay = this.add.graphics();
    this.overlay.fillStyle(0x000000, 0.15);
    this.overlay.fillRect(0, 0, width, height);
    this.overlay.setDepth(-50);
    this.overlayWidth = width;
    this.overlayHeight = height;
    // Resize handler to keep background covering full screen on mobile
    this.scale.on('resize', (gameSize) => {
      const { width: w, height: h } = gameSize;
      const regenKey = 'rulesGradient';
      if (this.textures.exists(regenKey)) this.textures.remove(regenKey);
      const c2 = document.createElement('canvas');
      c2.width = w; c2.height = h;
      const cx = c2.getContext('2d');
      // simple diamonds + gradient
      const dS = 60, sp = dS * 0.75;
      const cols = Math.ceil(w / sp) + 3, rows = Math.ceil(h / sp) + 4;
      cx.lineWidth = 1.5; cx.strokeStyle = 'rgba(255,255,255,0.35)';
      const start = -sp * 1.5;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const off = (r % 2 === 0) ? 0 : sp / 2;
          const x = start + c * sp + off;
          const y = start + r * sp;
          cx.save();
          cx.translate(x, y);
          cx.beginPath();
          cx.moveTo(0, -dS / 2); cx.lineTo(dS / 2, 0);
          cx.lineTo(0, dS / 2); cx.lineTo(-dS / 2, 0);
          cx.closePath(); cx.stroke();
          cx.restore();
        }
      }
      const g = cx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, 'rgba(220,53,69,0.7)'); g.addColorStop(1, 'rgba(0,123,255,0.7)');
      cx.fillStyle = g; cx.fillRect(0, 0, w, h);
      this.textures.addCanvas(regenKey, c2);
      if (this.bg) {
        this.bg.setTexture(regenKey);
        this.bg.setDisplaySize(w, h);
      }
      if (this.overlay) {
        this.overlay.clear();
        this.overlay.fillStyle(0x000000, 0.15);
        this.overlay.fillRect(0, 0, w, h);
      }
    });

    const titleText = mode === 'maths' ? 'Maths - How to Play' : 'Synonym Game - How to Play';
    const rules = mode === 'maths'
      ? [
          'Form equations using number and operand cards.',
          'Match the target number at the top.',
          'Fewer operations = more points (3,2,1).',
          'Submit your answer with the Submit button.',
          '3 wrong answers in a row loses the game.',
          'Reach 20 points to win.',
        ]
      : [
          'Answer the current synonym question using the cards in your hand.',
          '3 points for getting it correct on the first try, -1 point for each wrong answer.',
          'New questions appear after you answer all 5 in a set.',
          '3 wrong answers in a row loses the game.',
          'Reach 20 points to win.',
        ];

    const title = this.add.text(width / 2, height * 0.2, titleText, {
      fontSize: isMobile ? '26px' : '36px',
      fontFamily: '"Comic Neue", cursive',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);

    const listY = height * 0.35;
    let y = listY;
    rules.forEach((line) => {
      const t = this.add.text(width / 2, y, `• ${line}`, {
        fontSize: isMobile ? '18px' : '22px',
        fontFamily: '"Comic Neue", cursive',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
        wordWrap: { width: width * 0.8 }
      });
      t.setOrigin(0.5, 0);
      // Space based on actual text height to avoid overlap
      y += t.height + (isMobile ? 10 : 12);
    });

    // Start button - match StartScene style
    const btnW = isMobile ? 160 : 220;
    const btnH = isMobile ? 48 : 60;
    const btnY = height * 0.8;
    const buttonContainer = this.add.container(width / 2, btnY);
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x4a90e2, 1);
    buttonBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12);
    buttonBg.lineStyle(3, 0xffffff, 1);
    buttonBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12);
    const startText = this.add.text(0, 0, 'Start', {
      fontSize: isMobile ? '22px' : '28px',
      fontFamily: '"Comic Neue", cursive',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    startText.setOrigin(0.5);
    buttonContainer.add([buttonBg, startText]);
    buttonContainer.setDepth(2000);

    // Make interactive with rectangular hit area
    buttonBg.setInteractive(
      new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH),
      Phaser.Geom.Rectangle.Contains
    );
    buttonBg.input.cursor = 'pointer';

    // Hover animations (match StartScene behavior)
    buttonBg.on('pointerover', () => {
      this.tweens.add({
        targets: buttonContainer,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 200,
        ease: 'Back.easeOut'
      });
    });
    buttonBg.on('pointerout', () => {
      this.tweens.add({
        targets: buttonContainer,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Back.easeIn'
      });
    });
    buttonBg.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}


