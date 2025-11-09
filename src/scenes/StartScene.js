export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
    this.cards = [];
    this.cardLayers = [];
  }

  preload() {
    // Create colorful card back textures with white borders
    // Using vibrant colors for the card backs
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
    const lighterColor = this.lightenColor(baseColor, 0.2);
    const darkerColor = this.darkenColor(baseColor, 0.2);
    
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

  createGradientBackground(width, height) {
    // Remove texture if it already exists
    if (this.textures.exists('gradientBg')) {
      this.textures.remove('gradientBg');
    }
    
    // Create gradient from red (top-left) to blue (bottom-right) using a canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Create linear gradient from top-left to bottom-right
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgb(220, 53, 69)');  // Red at top-left
    gradient.addColorStop(1, 'rgb(0, 123, 255)');  // Blue at bottom-right
    
    // Fill canvas with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add diamond shapes to canvas
    this.drawDiamondsOnCanvas(ctx, width, height);
    
    // Create Phaser texture from canvas
    this.textures.addCanvas('gradientBg', canvas);
    
    // Add background image
    const bg = this.add.image(0, 0, 'gradientBg');
    bg.setOrigin(0, 0);
    bg.setDisplaySize(width, height);
    bg.setDepth(-100);
  }

  drawDiamondsOnCanvas(ctx, width, height) {
    // Add decorative diamond shapes across the background
    const diamondCount = 30;
    const diamondSize = Math.min(width, height) / 15;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < diamondCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = diamondSize * (0.5 + Math.random() * 0.5);
      const rotation = Math.random() * Math.PI * 2;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      // Draw diamond shape (rotated square)
      ctx.beginPath();
      ctx.moveTo(-size / 2, 0);      // left
      ctx.lineTo(0, -size / 2);      // top
      ctx.lineTo(size / 2, 0);       // right
      ctx.lineTo(0, size / 2);       // bottom
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    
    // Add some smaller diamonds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < diamondCount * 2; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = diamondSize * 0.3 * (0.5 + Math.random());
      const rotation = Math.random() * Math.PI * 2;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.beginPath();
      ctx.moveTo(-size / 2, 0);
      ctx.lineTo(0, -size / 2);
      ctx.lineTo(size / 2, 0);
      ctx.lineTo(0, size / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }


  create() {
    const { width, height } = this.scale;
    
    // Create gradient background with diamond shapes
    this.createGradientBackground(width, height);
    
    // Create multiple layers of cards for parallax effect
    this.createCardLayer(width, height, 0.5, 0.3); // Slowest layer (background)
    this.createCardLayer(width, height, 1, 0.5);   // Medium layer
    this.createCardLayer(width, height, 1.5, 0.7); // Fastest layer (foreground)
    
    // Game Title - responsive font size with playful font
    const titleSize = Math.min(width * 0.12, 120);
    const title = this.add.text(width / 2, height / 3, 'Qalam', {
      fontSize: `${titleSize}px`,
      fontFamily: '"Comic Neue", cursive',
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
    title.setDepth(2000); // Bring title to the very front, above everything else
    
    // Start Game Button - responsive size
    const buttonWidth = Math.min(width * 0.25, 250);
    const buttonHeight = Math.min(height * 0.08, 70);
    const buttonX = width / 2;
    const buttonY = height / 2 + Math.min(height * 0.15, 120);
    
    // Store button properties for scaling
    this.buttonWidth = buttonWidth;
    this.buttonHeight = buttonHeight;
    this.buttonX = buttonX;
    this.buttonY = buttonY;
    
    // Create button container for scaling
    const buttonContainer = this.add.container(buttonX, buttonY);
    
    // Button background
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x4a90e2, 1);
    buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
    buttonBg.lineStyle(3, 0xffffff, 1);
    buttonBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
    
    // Button text - responsive font size with playful font
    const buttonFontSize = Math.min(width * 0.035, 32);
    const buttonText = this.add.text(0, 0, 'Start Game', {
      fontSize: `${buttonFontSize}px`,
      fontFamily: '"Comic Neue", cursive',
      fontWeight: 'bold',
      color: '#ffffff'
    });
    buttonText.setOrigin(0.5);
    
    // Make button background interactive directly
    // Set hit area to match the button shape
    buttonBg.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    buttonBg.input.cursor = 'pointer';
    
    // Add elements to container
    buttonContainer.add([buttonBg, buttonText]);
    
    // Set button container depth to be above cards
    buttonContainer.setDepth(500);
    buttonBg.setDepth(500);
    buttonText.setDepth(501);
    
    // Store references for hover effects
    this.buttonBg = buttonBg;
    this.buttonContainer = buttonContainer;
    this.buttonText = buttonText;
    
    // Handle button interactions on the graphics object
    buttonBg.on('pointerover', () => {
      // Change color
      buttonBg.clear();
      buttonBg.fillStyle(0x5aa0f2, 1);
      buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
      buttonBg.lineStyle(3, 0xffffff, 1);
      buttonBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
      
      // Scale up with smooth animation
      this.tweens.add({
        targets: buttonContainer,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 200,
        ease: 'Back.easeOut'
      });
    });
    
    buttonBg.on('pointerout', () => {
      // Reset color
      buttonBg.clear();
      buttonBg.fillStyle(0x4a90e2, 1);
      buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
      buttonBg.lineStyle(3, 0xffffff, 1);
      buttonBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
      
      // Scale back down
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
      // Cards should be behind the button (which is at depth 500+) and title (depth 2000+)
      card.setDepth(alpha * 100); // Use alpha to determine depth (0.3, 0.5, 0.7 layers)
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
}

