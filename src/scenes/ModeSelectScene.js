export default class ModeSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ModeSelectScene' });
    this.cardLayers = [];
  }

  preload() {
    // Create colorful card back textures with white borders (same as StartScene)
    const cardColors = [
      0xff6b6b, // Coral red
      0x4ecdc4, // Turquoise
      0x45b7d1, // Sky blue
      0xffa07a, // Light salmon
      0x98d8c8, // Mint green
      0xf7dc6f, // Yellow
      0xbb8fce, // Purple
      0x85c1e2, // Light blue
      0xf1948a, // Pink
      0x52be80, // Green
      0xf39c12, // Orange
      0xe74c3c, // Red
    ];
    
    // Create multiple card back variants
    for (let i = 0; i < 12; i++) {
      this.createCardBackTexture(`cardBack${i}`, cardColors[i % cardColors.length]);
    }
  }

  createCardBackTexture(key, bgColor) {
    const cardGraphics = this.add.graphics();
    const cardWidth = 60;
    const cardHeight = 90;
    const borderWidth = 4;
    const cornerRadius = 5;
    
    // White border (outer border)
    cardGraphics.fillStyle(0xffffff, 1);
    cardGraphics.fillRoundedRect(0, 0, cardWidth, cardHeight, cornerRadius);
    
    // Colorful card back (inner area)
    cardGraphics.fillStyle(bgColor, 1);
    cardGraphics.fillRoundedRect(
      borderWidth, 
      borderWidth, 
      cardWidth - borderWidth * 2, 
      cardHeight - borderWidth * 2, 
      cornerRadius - 1
    );
    
    // Add decorative pattern elements
    this.addCardBackPattern(cardGraphics, cardWidth, cardHeight, bgColor);
    
    cardGraphics.generateTexture(key, cardWidth, cardHeight);
    cardGraphics.destroy();
  }

  addCardBackPattern(graphics, width, height, baseColor) {
    // Create a decorative pattern with geometric shapes
    const patternType = Math.floor(Math.random() * 3);
    
    // Adjust color brightness for pattern elements
    const lighterColor = this.lightenColorForCard(baseColor, 0.2);
    const darkerColor = this.darkenColorForCard(baseColor, 0.2);
    
    graphics.fillStyle(lighterColor, 0.6);
    
    if (patternType === 0) {
      // Circular pattern
      graphics.fillCircle(width / 2, height / 2, 15);
      graphics.fillCircle(width / 4, height / 4, 8);
      graphics.fillCircle(width * 3 / 4, height / 4, 8);
      graphics.fillCircle(width / 4, height * 3 / 4, 8);
      graphics.fillCircle(width * 3 / 4, height * 3 / 4, 8);
    } else if (patternType === 1) {
      // Diamond/star pattern
      graphics.fillStyle(darkerColor, 0.4);
      graphics.fillTriangle(width / 2, height / 4, width / 4, height / 2, width * 3 / 4, height / 2);
      graphics.fillTriangle(width / 2, height * 3 / 4, width / 4, height / 2, width * 3 / 4, height / 2);
      graphics.fillTriangle(width / 4, height / 2, width / 2, height / 2, width / 2, height / 4);
      graphics.fillTriangle(width * 3 / 4, height / 2, width / 2, height / 2, width / 2, height / 4);
    } else {
      // Striped pattern
      graphics.fillStyle(lighterColor, 0.3);
      for (let i = 0; i < 5; i++) {
        graphics.fillRect(8, 10 + i * 15, width - 16, 3);
      }
      graphics.fillStyle(darkerColor, 0.3);
      for (let i = 0; i < 4; i++) {
        graphics.fillRect(12, 17 + i * 15, width - 24, 2);
      }
    }
  }

  lightenColorForCard(color, amount) {
    const r = Math.min(255, ((color >> 16) & 0xff) + Math.floor(255 * amount));
    const g = Math.min(255, ((color >> 8) & 0xff) + Math.floor(255 * amount));
    const b = Math.min(255, (color & 0xff) + Math.floor(255 * amount));
    return (r << 16) | (g << 8) | b;
  }

  darkenColorForCard(color, amount) {
    const r = Math.max(0, ((color >> 16) & 0xff) - Math.floor(255 * amount));
    const g = Math.max(0, ((color >> 8) & 0xff) - Math.floor(255 * amount));
    const b = Math.max(0, (color & 0xff) - Math.floor(255 * amount));
    return (r << 16) | (g << 8) | b;
  }

  create() {
    const { width, height } = this.scale;
    
    // Create gradient background with diamond pattern
    this.createGradientBackground(width, height);
    
    // Add background card parallax layers (only the slower, further away ones)
    this.createCardLayer(width, height, 0.5, 0.2); // Slowest layer (background)
    this.createCardLayer(width, height, 0.8, 0.35); // Medium-slow layer
    
    // Title
    const isMobile = width < 768;
    const titleSize = isMobile ? Math.min(width * 0.12, 60) : Math.min(width * 0.10, 100);
    const title = this.add.text(width / 2, isMobile ? height * 0.12 : height * 0.15, 'Select Mode', {
      fontSize: `${titleSize}px`,
      fontFamily: '"Comic Neue", cursive',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: Math.max(4, titleSize / 15),
      shadow: {
        offsetX: 4,
        offsetY: 4,
        color: '#000000',
        blur: 10,
        stroke: true,
        fill: true
      }
    });
    title.setOrigin(0.5);
    title.setDepth(2000);
    
    // Create mode selection cards - fully dynamic to screen size
    const cardWidth = isMobile ? width * 0.4 : width * 0.22;
    const cardHeight = isMobile ? height * 0.4 : height * 0.45;
    const spacing = isMobile ? width * 0.05 : width * 0.08;
    const centerX = width / 2;
    const centerY = isMobile ? height / 2 : height / 2 + height * 0.05; // Slightly lower for better visual balance
    
    // Calculate card positions (centered with spacing between them)
    const totalWidth = cardWidth * 2 + spacing;
    const leftCardX = centerX - totalWidth / 2 + cardWidth / 2;
    const rightCardX = centerX + totalWidth / 2 - cardWidth / 2;
    
    // Maths card
    const mathsCard = this.createModeCard(
      leftCardX,
      centerY,
      cardWidth,
      cardHeight,
      'Maths',
      0x4ecdc4 // Turquoise
    );
    
    // General Knowledge card
    const gkCard = this.createModeCard(
      rightCardX,
      centerY,
      cardWidth,
      cardHeight,
      'General Knowledge',
      0xff6b6b // Coral red
    );
    
    // Make cards interactive
    this.makeCardInteractive(mathsCard, 'maths');
    this.makeCardInteractive(gkCard, 'general');
  }

  createGradientBackground(width, height) {
    // Remove texture if it already exists
    if (this.textures.exists('gradientBgMode')) {
      this.textures.remove('gradientBgMode');
    }
    
    // Create canvas for background
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // First, draw diamond pattern covering the background
    this.drawDiamondPattern(ctx, width, height);
    
    // Then, overlay gradient from red (top-left) to blue (bottom-right)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(220, 53, 69, 0.7)');  // Red at top-left with transparency
    gradient.addColorStop(1, 'rgba(0, 123, 255, 0.7)');  // Blue at bottom-right with transparency
    
    // Apply gradient overlay
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Create Phaser texture from canvas
    this.textures.addCanvas('gradientBgMode', canvas);
    
    // Add background image
    const bg = this.add.image(0, 0, 'gradientBgMode');
    bg.setOrigin(0, 0);
    bg.setDisplaySize(width, height);
    bg.setDepth(-100);
  }

  drawDiamondPattern(ctx, width, height) {
    // Create a tiled diamond pattern covering the entire background
    const diamondSize = 75; // Increased size for bigger diamonds
    const spacing = diamondSize * 0.75; // Spacing between diamond centers
    
    // Calculate how many diamonds we need with extra padding to ensure full coverage
    // Add extra rows/cols to cover edges and beyond
    const cols = Math.ceil(width / spacing) + 3;
    const rows = Math.ceil(height / spacing) + 4;
    
    // Base colors for diamonds (lighter colors so gradient shows through)
    const colors = [
      'rgba(255, 255, 255, 0.3)',
      'rgba(240, 240, 255, 0.25)',
      'rgba(255, 240, 240, 0.25)',
      'rgba(240, 255, 240, 0.2)'
    ];
    
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    
    // Draw diamonds in a grid pattern
    // Start from negative position to ensure top-left coverage
    const startOffset = -spacing * 1.5;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Offset every other row for diamond pattern
        const offsetX = (row % 2 === 0) ? 0 : spacing / 2;
        const x = startOffset + col * spacing + offsetX;
        // Use vertical spacing that accounts for diamond height
        const y = startOffset + row * spacing;
        
        // Alternate colors for visual interest
        const colorIndex = (row + col) % colors.length;
        ctx.fillStyle = colors[colorIndex];
        
        // Draw diamond (rotated square)
        ctx.save();
        ctx.translate(x, y);
        
        ctx.beginPath();
        ctx.moveTo(0, -diamondSize / 2);      // top
        ctx.lineTo(diamondSize / 2, 0);       // right
        ctx.lineTo(0, diamondSize / 2);       // bottom
        ctx.lineTo(-diamondSize / 2, 0);      // left
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }
    
    // Add some smaller accent diamonds
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
        const x = startOffset + col * accentSpacing + offsetX;
        const y = startOffset + row * accentSpacing;
        
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

  createCardLayer(width, height, speed, alpha) {
    const layer = [];
    const cardsPerRow = Math.floor(width / 80);
    const spacing = width / cardsPerRow;
    const cardTypes = ['cardBack0', 'cardBack1', 'cardBack2', 'cardBack3', 'cardBack4', 'cardBack5', 
                       'cardBack6', 'cardBack7', 'cardBack8', 'cardBack9', 'cardBack10', 'cardBack11'];
    
    // Create initial cards - reduced amount for cleaner look
    const rows = 2; // Reduced from 3 to 2 rows
    for (let i = 0; i < cardsPerRow * rows; i++) {
      const x = (i % cardsPerRow) * spacing + spacing / 2 + Phaser.Math.Between(-20, 20);
      const y = (Math.floor(i / cardsPerRow) - 1) * 150 + Phaser.Math.Between(-50, 50);
      const rotation = Phaser.Math.Between(-15, 15) * Math.PI / 180;
      const cardType = Phaser.Math.RND.pick(cardTypes);
      
      const card = this.add.image(x, y, cardType);
      card.setAlpha(alpha);
      card.setRotation(rotation);
      card.speed = speed;
      card.originalX = x;
      card.setInteractive(false); // Disable pointer events on cards
      card.disableInteractive(); // Ensure cards don't block button
      // Set depth based on layer (lower numbers = behind, higher = in front)
      // Cards should be behind the mode selection cards (which are at depth 500+)
      card.setDepth(alpha * 100); // Use alpha to determine depth
      layer.push(card);
    }
    
    this.cardLayers.push(layer);
  }

  update() {
    const { height } = this.scale;
    
    // Update each layer at different speeds for parallax effect
    this.cardLayers.forEach((layer) => {
      layer.forEach((card) => {
        card.y += card.speed;
        
        // Reset card to top when it goes off screen
        if (card.y > height + 100) {
          card.y = -100;
          card.x = card.originalX + Phaser.Math.Between(-20, 20);
          card.rotation = Phaser.Math.Between(-15, 15) * Math.PI / 180;
        }
      });
    });
  }

  createModeCard(x, y, width, height, label, color) {
    // Create card container
    const cardContainer = this.add.container(x, y);
    
    // Card background with white border (back of card - no text initially)
    const cardBg = this.add.graphics();
    const borderWidth = 6;
    const cornerRadius = 15;
    
    // White border (outer)
    cardBg.fillStyle(0xffffff, 1);
    cardBg.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
    
    // Colored card back (inner)
    cardBg.fillStyle(color, 1);
    cardBg.fillRoundedRect(
      -width / 2 + borderWidth,
      -height / 2 + borderWidth,
      width - borderWidth * 2,
      height - borderWidth * 2,
      cornerRadius - 2
    );
    
    // Add decorative pattern
    this.addCardPattern(cardBg, width, height, color);
    
    // Card label text (hidden initially, shown on flip)
    const isMobile = width < 768;
    const fontSize = isMobile ? Math.min(width * 0.06, 28) : Math.min(width * 0.08, 40);
    const cardText = this.add.text(0, 0, label, {
      fontSize: `${fontSize}px`,
      fontFamily: '"Comic Neue", cursive',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 5,
        stroke: true,
        fill: true
      },
      wordWrap: { width: width - borderWidth * 4 },
      align: 'center'
    });
    cardText.setOrigin(0.5);
    cardText.setVisible(false); // Hidden initially
    cardText.setAlpha(0); // Start with 0 alpha for smooth transition
    
    // Make card background interactive directly (like start game button)
    cardBg.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    cardBg.input.cursor = 'pointer';
    
    // Add elements to container
    cardContainer.add([cardBg, cardText]);
    cardContainer.setDepth(500);
    
    // Store references
    cardContainer.cardBg = cardBg;
    cardContainer.cardText = cardText;
    cardContainer.originalWidth = width;
    cardContainer.originalHeight = height;
    cardContainer.borderWidth = borderWidth;
    cardContainer.cornerRadius = cornerRadius;
    cardContainer.color = color;
    cardContainer.label = label;
    cardContainer.isFlipped = false;
    
    return cardContainer;
  }

  addCardPattern(graphics, width, height, baseColor) {
    // Add subtle pattern to card
    const patternType = Math.floor(Math.random() * 2);
    const lighterColor = this.lightenColor(baseColor, 0.15);
    const darkerColor = this.darkenColor(baseColor, 0.15);
    
    graphics.fillStyle(lighterColor, 0.4);
    
    if (patternType === 0) {
      // Circular pattern
      graphics.fillCircle(0, -height * 0.2, width * 0.15);
      graphics.fillCircle(-width * 0.25, height * 0.1, width * 0.1);
      graphics.fillCircle(width * 0.25, height * 0.1, width * 0.1);
    } else {
      // Star/diamond pattern
      graphics.fillStyle(darkerColor, 0.3);
      graphics.fillTriangle(0, -height * 0.25, -width * 0.2, 0, width * 0.2, 0);
      graphics.fillTriangle(0, height * 0.25, -width * 0.2, 0, width * 0.2, 0);
    }
  }

  lightenColor(color, amount) {
    const r = Math.min(255, ((color >> 16) & 0xff) + Math.floor(255 * amount));
    const g = Math.min(255, ((color >> 8) & 0xff) + Math.floor(255 * amount));
    const b = Math.min(255, (color & 0xff) + Math.floor(255 * amount));
    return (r << 16) | (g << 8) | b;
  }

  darkenColor(color, amount) {
    const r = Math.max(0, ((color >> 16) & 0xff) - Math.floor(255 * amount));
    const g = Math.max(0, ((color >> 8) & 0xff) - Math.floor(255 * amount));
    const b = Math.max(0, (color & 0xff) - Math.floor(255 * amount));
    return (r << 16) | (g << 8) | b;
  }

  makeCardInteractive(cardContainer, mode) {
    const { width } = this.scale;
    const isMobile = width < 768;
    const { cardBg, cardText, originalWidth, originalHeight, borderWidth, cornerRadius, color } = cardContainer;
    
    if (isMobile) {
      // Mobile: First click flips, second click launches
      cardBg.on('pointerdown', () => {
        if (!cardContainer.isFlipped) {
          // First click: Flip card
          cardContainer.isFlipped = true;
          
          // Flip animation: scale X to 0 then back to 1
          this.tweens.add({
            targets: cardContainer,
            scaleX: 0,
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
              // Show text and brighten card
              cardText.setVisible(true);
              const brighterColor = this.lightenColor(color, 0.2);
              
              cardBg.clear();
              cardBg.fillStyle(0xffffff, 1);
              cardBg.fillRoundedRect(-originalWidth / 2, -originalHeight / 2, originalWidth, originalHeight, cornerRadius);
              cardBg.fillStyle(brighterColor, 1);
              cardBg.fillRoundedRect(
                -originalWidth / 2 + borderWidth,
                -originalHeight / 2 + borderWidth,
                originalWidth - borderWidth * 2,
                originalHeight - borderWidth * 2,
                cornerRadius - 2
              );
              this.addCardPattern(cardBg, originalWidth, originalHeight, brighterColor);
              
              // Fade in text
              this.tweens.add({
                targets: cardText,
                alpha: 1,
                duration: 100
              });
              
              // Scale back up with text visible
              this.tweens.add({
                targets: cardContainer,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Back.easeOut'
              });
            }
          });
        } else {
          // Second click: Launch game mode
          this.registry.set('selectedMode', mode);
          this.scene.start('GameScene');
        }
      });
    } else {
      // Desktop: Hover to flip, click to launch
      cardBg.on('pointerover', () => {
        if (!cardContainer.isFlipped) {
          cardContainer.isFlipped = true;
          
          // Flip animation: scale X to 0 then back to 1.15
          this.tweens.add({
            targets: cardContainer,
            scaleX: 0,
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
              // Show text and brighten card
              cardText.setVisible(true);
              const brighterColor = this.lightenColor(color, 0.2);
              
              cardBg.clear();
              cardBg.fillStyle(0xffffff, 1);
              cardBg.fillRoundedRect(-originalWidth / 2, -originalHeight / 2, originalWidth, originalHeight, cornerRadius);
              cardBg.fillStyle(brighterColor, 1);
              cardBg.fillRoundedRect(
                -originalWidth / 2 + borderWidth,
                -originalHeight / 2 + borderWidth,
                originalWidth - borderWidth * 2,
                originalHeight - borderWidth * 2,
                cornerRadius - 2
              );
              this.addCardPattern(cardBg, originalWidth, originalHeight, brighterColor);
              
              // Fade in text
              this.tweens.add({
                targets: cardText,
                alpha: 1,
                duration: 100
              });
              
              // Scale back up with text visible
              this.tweens.add({
                targets: cardContainer,
                scaleX: 1.15,
                scaleY: 1.15,
                duration: 150,
                ease: 'Back.easeOut'
              });
            }
          });
        } else {
          // Already flipped, just scale up
          this.tweens.add({
            targets: cardContainer,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 200,
            ease: 'Back.easeOut'
          });
        }
      });
      
      cardBg.on('pointerout', () => {
        if (cardContainer.isFlipped) {
          cardContainer.isFlipped = false;
          
          // Flip back: scale X to 0 then back to 1
          this.tweens.add({
            targets: cardContainer,
            scaleX: 0,
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
              // Hide text and reset card color
              this.tweens.add({
                targets: cardText,
                alpha: 0,
                duration: 100,
                onComplete: () => {
                  cardText.setVisible(false);
                }
              });
              
              cardBg.clear();
              cardBg.fillStyle(0xffffff, 1);
              cardBg.fillRoundedRect(-originalWidth / 2, -originalHeight / 2, originalWidth, originalHeight, cornerRadius);
              cardBg.fillStyle(color, 1);
              cardBg.fillRoundedRect(
                -originalWidth / 2 + borderWidth,
                -originalHeight / 2 + borderWidth,
                originalWidth - borderWidth * 2,
                originalHeight - borderWidth * 2,
                cornerRadius - 2
              );
              this.addCardPattern(cardBg, originalWidth, originalHeight, color);
              
              // Scale back to normal
              this.tweens.add({
                targets: cardContainer,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Back.easeIn'
              });
            }
          });
        } else {
          // Not flipped, just scale back down
          this.tweens.add({
            targets: cardContainer,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Back.easeIn'
          });
        }
      });
      
      cardBg.on('pointerdown', () => {
        // Store selected mode and transition to game
        this.registry.set('selectedMode', mode);
        this.scene.start('GameScene');
      });
    }
  }
}

