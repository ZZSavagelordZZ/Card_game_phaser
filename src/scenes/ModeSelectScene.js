import { createGradientBackground, ensureUnifiedCardBack, ensureUnifiedCardFront, lightenColor as utilLightenColor } from '../utils/ui.js';

export default class ModeSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ModeSelectScene' });
    this.cardLayers = [];
  }

  preload() {
    // Ensure unified card backs exist
    const colors = [0x4ecdc4, 0xff6b6b, 0x45b7d1, 0xf7dc6f, 0xbb8fce, 0x52be80];
    for (let i = 0; i < colors.length; i++) {
      ensureUnifiedCardBack(this, `cardBack${i}`, colors[i]);
    }
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
    const bgKey = createGradientBackground(this, 'gradientBgMode', width, height);
    this.bg = this.add.image(0, 0, bgKey);
    this.bg.setOrigin(0, 0);
    this.bg.setDisplaySize(width, height);
    this.bg.setDepth(-100);
    
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
    const mathsCard = this.createModeCard(leftCardX, centerY, cardWidth, cardHeight, 'Maths', 0x4ecdc4);
    
    // Synonym Game card
    const gkCard = this.createModeCard(rightCardX, centerY, cardWidth, cardHeight, 'Synonym Game', 0xff6b6b);
    
    // Make cards interactive
    this.makeCardInteractive(mathsCard, 'maths');
    this.makeCardInteractive(gkCard, 'general');
    // Handle mobile browser UI resize to keep background covering the screen
    this.scale.on('resize', (gameSize) => {
      const { width: w, height: h } = gameSize;
      const key = createGradientBackground(this, 'gradientBgMode', w, h);
      if (this.bg) {
        this.bg.setTexture(key);
        this.bg.setDisplaySize(w, h);
      }
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
    const borderWidth = 6;
    const cornerRadius = 15;
    const cardBackKey = ensureUnifiedCardBack(this, `mode_card_back_${color}`, color);
    const cardBg = this.add.image(0, 0, cardBackKey);
    cardBg.setDisplaySize(width, height);
    // Add soft shadow
    const shadow = this.add.image(6, 8, cardBackKey);
    shadow.setTint(0x000000);
    shadow.setAlpha(0.25);
    shadow.setDisplaySize(width, height);
    shadow.setDepth(-1);
    
    // Card label text (hidden initially, shown on flip)
    const isMobile = this.scale.width < 768;
    // Scale text relative to card size for legibility on mobile
    const fontSize = isMobile ? Math.min(height * 0.18, 40) : Math.min(height * 0.16, 44);
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
    
    // Use a dedicated interactive zone to avoid hit-area bugs with scaled images
    const hitZone = this.add.zone(0, 0, width, height);
    hitZone.setInteractive({ cursor: 'pointer' });
    
    // Add elements to container
    cardContainer.add([shadow, cardBg, cardText, hitZone]);
    cardContainer.setDepth(1500);
    
    // Store references
    cardContainer.cardBg = cardBg;
    cardContainer.cardText = cardText;
    cardContainer.hitZone = hitZone;
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
    const { cardBg, cardText, hitZone, originalWidth, originalHeight, borderWidth, cornerRadius, color } = cardContainer;
    
    const flipIn = () => {
      return new Promise((resolve) => {
        this.tweens.add({
          targets: cardContainer,
          scaleX: 0,
          duration: 150,
          ease: 'Power2',
          onComplete: () => resolve()
        });
      });
    };
    const flipOut = () => {
      return new Promise((resolve) => {
        this.tweens.add({
          targets: cardContainer,
          scaleX: 1,
          duration: 150,
          ease: 'Back.easeOut',
          onComplete: () => resolve()
        });
      });
    };
    const brighten = () => {
      const brighterColor = utilLightenColor(color, 0.2);
      const newKey = ensureUnifiedCardBack(this, `mode_card_back_${brighterColor}`, brighterColor);
      cardBg.setTexture(newKey);
    };
    const resetColor = () => {
      const resetKey = ensureUnifiedCardBack(this, `mode_card_back_${color}`, color);
      cardBg.setTexture(resetKey);
    };

    // Uniform click-to-flip behavior on both desktop and mobile to avoid hover bugs
    hitZone.on('pointerdown', async () => {
        if (!cardContainer.isFlipped) {
          cardContainer.isFlipped = true;
          await flipIn();
          cardText.setVisible(true);
          this.tweens.add({ targets: cardText, alpha: 1, duration: 100 });
          brighten();
          await flipOut();
        } else {
          const normalizedMode = mode === 'general' ? 'synonym' : mode;
          this.registry.set('selectedMode', normalizedMode);
          this.scene.start('RulesScene');
        }
    });

    // Gentle hover scale (no flip) for desktop only
    if (!isMobile) {
      hitZone.on('pointerover', () => {
        this.tweens.add({ targets: cardContainer, scaleX: 1.05, scaleY: 1.05, duration: 120, ease: 'Back.easeOut' });
      });
      hitZone.on('pointerout', () => {
        this.tweens.add({ targets: cardContainer, scaleX: 1, scaleY: 1, duration: 120, ease: 'Back.easeIn' });
      });
    }
  }
}

