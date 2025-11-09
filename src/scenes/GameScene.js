export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.selectedMode = null;
    this.score = 0;
    this.handCards = [];
    this.playZoneCards = [];
    this.deckCards = [];
    this.operandCards = [];
    this.draggedCard = null;
    this.feedbackOverlay = null;
    
    // Loss tracking
    this.consecutiveWrongAnswers = 0;
    this.lossCrosses = [];
    
    // Maths mode
    this.targetNumber = 0;
    this.currentFormula = [];
    
    // General Knowledge mode
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.currentQuestion = null;
    this.availableAnswers = [];
    this.pointsForCurrentQuestion = 3;
  }

  preload() {
    // Create card textures
    this.createCardTextures();
  }

  createCardTextures() {
    // Create number cards (1-10) for maths mode
    for (let i = 1; i <= 10; i++) {
      this.createNumberCard(`numberCard${i}`, i);
    }
    
    // Create operand cards (+, -, ×, ÷)
    this.createOperandCard('operandPlus', '+', 0x4ecdc4);
    this.createOperandCard('operandMinus', '-', 0xff6b6b);
    this.createOperandCard('operandMultiply', '×', 0xf7dc6f);
    this.createOperandCard('operandDivide', '÷', 0xbb8fce);
    
    // Create deck card back
    this.createDeckCardBack('deckCardBack');
    
    // Create answer card template (will be customized per answer)
    this.createAnswerCardTemplate('answerCard');
  }

  createNumberCard(key, number) {
    const cardGraphics = this.add.graphics();
    const cardWidth = 80;
    const cardHeight = 120;
    const borderWidth = 5;
    const cornerRadius = 8;
    
    // White background
    cardGraphics.fillStyle(0xffffff, 1);
    cardGraphics.fillRoundedRect(0, 0, cardWidth, cardHeight, cornerRadius);
    
    // Colorful border
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf7dc6f, 0xbb8fce];
    cardGraphics.fillStyle(colors[(number - 1) % colors.length], 1);
    cardGraphics.fillRoundedRect(0, 0, cardWidth, cardHeight, cornerRadius);
    cardGraphics.fillStyle(0xffffff, 1);
    cardGraphics.fillRoundedRect(borderWidth, borderWidth, cardWidth - borderWidth * 2, cardHeight - borderWidth * 2, cornerRadius - 2);
    
    // Number text (will be added as text object later, but create texture for now)
    cardGraphics.generateTexture(key, cardWidth, cardHeight);
    cardGraphics.destroy();
  }

  createOperandCard(key, symbol, color) {
    const cardGraphics = this.add.graphics();
    const cardWidth = 80;
    const cardHeight = 120;
    const borderWidth = 5;
    const cornerRadius = 8;
    
    // White background
    cardGraphics.fillStyle(0xffffff, 1);
    cardGraphics.fillRoundedRect(0, 0, cardWidth, cardHeight, cornerRadius);
    
    // Colorful border
    cardGraphics.fillStyle(color, 1);
    cardGraphics.fillRoundedRect(0, 0, cardWidth, cardHeight, cornerRadius);
    cardGraphics.fillStyle(0xffffff, 1);
    cardGraphics.fillRoundedRect(borderWidth, borderWidth, cardWidth - borderWidth * 2, cardHeight - borderWidth * 2, cornerRadius - 2);
    
    cardGraphics.generateTexture(key, cardWidth, cardHeight);
    cardGraphics.destroy();
  }

  createDeckCardBack(key) {
    const cardGraphics = this.add.graphics();
    const cardWidth = 60;
    const cardHeight = 90;
    const borderWidth = 4;
    const cornerRadius = 5;
    
    // White border
    cardGraphics.fillStyle(0xffffff, 1);
    cardGraphics.fillRoundedRect(0, 0, cardWidth, cardHeight, cornerRadius);
    
    // Colorful back
    cardGraphics.fillStyle(0x4ecdc4, 1);
    cardGraphics.fillRoundedRect(
      borderWidth, 
      borderWidth, 
      cardWidth - borderWidth * 2, 
      cardHeight - borderWidth * 2, 
      cornerRadius - 1
    );
    
    cardGraphics.generateTexture(key, cardWidth, cardHeight);
    cardGraphics.destroy();
  }

  createAnswerCardTemplate(key) {
    const cardGraphics = this.add.graphics();
    const cardWidth = 80;
    const cardHeight = 120;
    const borderWidth = 5;
    const cornerRadius = 8;
    
    // White background
    cardGraphics.fillStyle(0xffffff, 1);
    cardGraphics.fillRoundedRect(0, 0, cardWidth, cardHeight, cornerRadius);
    
    // Colorful border (will be customized per card)
    cardGraphics.fillStyle(0x4ecdc4, 1);
    cardGraphics.fillRoundedRect(0, 0, cardWidth, cardHeight, cornerRadius);
    cardGraphics.fillStyle(0xffffff, 1);
    cardGraphics.fillRoundedRect(borderWidth, borderWidth, cardWidth - borderWidth * 2, cardHeight - borderWidth * 2, cornerRadius - 2);
    
    cardGraphics.generateTexture(key, cardWidth, cardHeight);
    cardGraphics.destroy();
  }

  create() {
    const { width, height } = this.scale;
    
    // Reset game state
    this.score = 0;
    this.consecutiveWrongAnswers = 0;
    this.handCards = [];
    this.playZoneCards = [];
    this.draggedCard = null;
    
    // Get selected mode
    this.selectedMode = this.registry.get('selectedMode') || 'maths';
    
    // Create gradient background
    this.createGradientBackground(width, height);
    
    // Create UI layout
    this.createUILayout(width, height);
    
    // Create loss crosses display
    this.createLossCrosses(width, height);
    
    // Initialize game mode
    if (this.selectedMode === 'maths') {
      this.initMathsMode();
    } else {
      this.initGeneralKnowledgeMode();
    }
  }

  createGradientBackground(width, height) {
    if (this.textures.exists('gradientBgGame')) {
      this.textures.remove('gradientBgGame');
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    this.drawDiamondPattern(ctx, width, height);
    
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(220, 53, 69, 0.7)');
    gradient.addColorStop(1, 'rgba(0, 123, 255, 0.7)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    this.textures.addCanvas('gradientBgGame', canvas);
    
    const bg = this.add.image(0, 0, 'gradientBgGame');
    bg.setOrigin(0, 0);
    bg.setDisplaySize(width, height);
    bg.setDepth(-100);
  }

  drawDiamondPattern(ctx, width, height) {
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
  }

  createUILayout(width, height) {
    // Create texture for section backgrounds
    this.createSectionTexture('sectionBg', 200, 200);
    
    // Calculate responsive sizes
    const isMobile = width < 768;
    
    // Create single large texture overlay covering entire screen
    const fullOverlay = this.add.tileSprite(width / 2, height / 2, width, height, 'sectionBg');
    fullOverlay.setDepth(999);
    
    if (isMobile) {
      // Mobile layout: Top bar with target, operands, score | Play area 95% width | Cards below
      const topHeight = height * 0.15;
      const operandAreaHeight = height * 0.08; // Space for operands
      const playZoneWidth = width * 0.95;
      const playZoneHeight = height * 0.35; // Shorter height
      const playZoneY = topHeight + operandAreaHeight + playZoneHeight / 2 + height * 0.03; // Positioned below operands
      const submitButtonHeight = 35;
      const submitButtonY = playZoneY + playZoneHeight / 2 + 25; // Submit button position
      const handStartY = submitButtonY + submitButtonHeight / 2 + height * 0.12; // Cards much further below submit button
      
      // Play zone (centered, 95% width)
      this.playZone = this.add.zone(width / 2, playZoneY, playZoneWidth, playZoneHeight);
      this.playZone.setDepth(100);
      
      // Top section zone (for target/question) - left side
      this.topSection = this.add.zone(width * 0.15, topHeight / 2, width * 0.25, topHeight);
      this.topSection.setDepth(1000);
      
      // Operands below top bar (between target and play zone)
      const operandY = topHeight + height * 0.02; // Slightly below top bar
      this.deckArea = this.add.zone(width / 2, operandY, width * 0.6, height * 0.08);
      this.deckArea.setDepth(500);
      
      // Score in top bar (right side, more to the right)
      this.scoreText = this.add.text(width * 0.88, topHeight / 2, 'Score: 0', {
        fontSize: '16px',
        fontFamily: '"Comic Neue", cursive',
        fontWeight: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      });
      this.scoreText.setOrigin(0.5);
      this.scoreText.setDepth(1000);
      
      // Hand area (below play zone)
      this.handArea = this.add.zone(width / 2, handStartY, width * 0.95, height - handStartY - 10);
      this.handArea.setDepth(500);
      
      // Store hand start Y for card creation
      this.handStartY = handStartY;
    } else {
      // Desktop layout: Original layout
      const topHeight = height * 0.15;
      const rightWidth = width * 0.15;
      const bottomHeight = height * 0.15;
      const leftWidth = width * 0.15;
      
      // Calculate play zone (smaller and centered)
      const playZoneWidth = width * 0.45;
      const playZoneHeight = height * 0.45;
      const centerX = width / 2;
      const centerY = (topHeight + (height - bottomHeight)) / 2;
      
      this.playZone = this.add.zone(centerX, centerY, playZoneWidth, playZoneHeight);
      this.playZone.setDepth(100);
      
      // Top section zone
      this.topSection = this.add.zone(width / 2, topHeight / 2, width - rightWidth, topHeight);
      this.topSection.setDepth(1000);
      
      // Right side - Score display
      const rightStartY = topHeight;
      const rightHeight = height * 0.12;
      this.scoreText = this.add.text(width - rightWidth / 2, rightStartY + rightHeight / 2, 'Score: 0', {
        fontSize: '28px',
        fontFamily: '"Comic Neue", cursive',
        fontWeight: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      });
      this.scoreText.setOrigin(0.5);
      this.scoreText.setDepth(1000);
      
      // Left side - Operand area (no deck)
      const leftStartY = topHeight;
      const leftHeight = height - topHeight - bottomHeight;
      this.deckArea = this.add.zone(leftWidth / 2, leftStartY + leftHeight / 2, leftWidth * 0.8, leftHeight * 0.8);
      this.deckArea.setDepth(500);
      
      // Bottom - Hand area
      this.handArea = this.add.zone(width / 2, height - bottomHeight / 2, width - leftWidth - rightWidth, bottomHeight * 0.8);
      this.handArea.setDepth(500);
      
      // Store hand start Y for card creation
      this.handStartY = height - bottomHeight / 2;
    }
    
    // Visual play zone indicator with white background (above overlay)
    const playZoneGraphics = this.add.graphics();
    playZoneGraphics.fillStyle(0xffffff, 0.95);
    playZoneGraphics.fillRoundedRect(
      this.playZone.x - this.playZone.width / 2,
      this.playZone.y - this.playZone.height / 2,
      this.playZone.width,
      this.playZone.height,
      15
    );
    playZoneGraphics.lineStyle(4, 0x000000, 0.3);
    playZoneGraphics.strokeRoundedRect(
      this.playZone.x - this.playZone.width / 2,
      this.playZone.y - this.playZone.height / 2,
      this.playZone.width,
      this.playZone.height,
      15
    );
    playZoneGraphics.setDepth(1000); // Above overlay
    this.playZoneIndicator = playZoneGraphics;
    
    // Feedback overlay (initially hidden)
    this.feedbackOverlay = this.add.rectangle(width / 2, height / 3, width, height / 3, 0x000000, 0);
    this.feedbackOverlay.setDepth(2000);
    this.feedbackOverlay.setAlpha(0);
  }

  createSectionTexture(key, width, height) {
    if (this.textures.exists(key)) {
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Create a subtle pattern texture
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    gradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 200, 200, 0.15)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle diagonal lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = -height; i < width + height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }
    
    // Add border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
    
    this.textures.addCanvas(key, canvas);
  }

  createLossCrosses(width, height) {
    const isMobile = width < 768;
    
    if (isMobile) {
      // Mobile: Loss crosses below score in top bar
      const topHeight = height * 0.15;
      const crossY = topHeight / 2 + 12; // Below score text
      const crossSpacing = 12;
      const startX = width * 0.88; // Aligned with score
      
      this.lossCrosses = [];
      for (let i = 0; i < 3; i++) {
        const cross = this.add.text(startX + i * crossSpacing, crossY, '✕', {
          fontSize: '14px',
          fontFamily: 'Arial',
          color: '#666666',
          stroke: '#000000',
          strokeThickness: 2
        });
        cross.setOrigin(0.5);
        cross.setDepth(1000);
        this.lossCrosses.push(cross);
      }
    } else {
      // Desktop: Original layout
      const topHeight = height * 0.15;
      const rightHeight = height * 0.12;
      const rightWidth = width * 0.15;
      const rightStartY = topHeight;
      const crossY = rightStartY + rightHeight + 25; // Below score section
      const crossSpacing = 28;
      const startX = width - rightWidth / 2 - crossSpacing;
      
      this.lossCrosses = [];
      for (let i = 0; i < 3; i++) {
        const cross = this.add.text(startX + i * crossSpacing, crossY, '✕', {
          fontSize: '28px',
          fontFamily: 'Arial',
          color: '#666666',
          stroke: '#000000',
          strokeThickness: 2
        });
        cross.setOrigin(0.5);
        cross.setDepth(1000);
        this.lossCrosses.push(cross);
      }
    }
  }

  updateLossCrosses() {
    for (let i = 0; i < 3; i++) {
      if (i < this.consecutiveWrongAnswers) {
        this.lossCrosses[i].setColor('#ff0000');
        this.lossCrosses[i].setStroke('#000000', 2);
      } else {
        this.lossCrosses[i].setColor('#666666');
        this.lossCrosses[i].setStroke('#000000', 2);
      }
    }
  }

  initMathsMode() {
    // Generate target number (achievable in max 4 operations)
    this.targetNumber = this.generateAchievableNumber();
    
    // Display target number
    this.updateTopDisplay(`Target: ${this.targetNumber}`);
    
    // Create number cards in hand (1-5)
    this.createMathsHand();
    
    // Create operand cards on left side
    this.createOperandCards();
    
    // Create submit button
    this.createSubmitButton();
    
    // No deck visualization
  }

  createSubmitButton() {
    const { width, height } = this.scale;
    const isMobile = width < 768;
    const buttonWidth = isMobile ? 100 : 150;
    const buttonHeight = isMobile ? 35 : 50;
    
    let buttonX, buttonY;
    
    if (isMobile) {
      // Mobile: Button below play zone
      const topHeight = height * 0.15;
      const operandAreaHeight = height * 0.08;
      const playZoneHeight = height * 0.35;
      const playZoneY = topHeight + operandAreaHeight + playZoneHeight / 2 + height * 0.03;
      buttonX = width / 2;
      buttonY = playZoneY + playZoneHeight / 2 + 25; // Below play zone
    } else {
      // Desktop: Original position
      const topHeight = height * 0.15;
      const bottomHeight = height * 0.15;
      const playZoneHeight = height * 0.45;
      const centerY = (topHeight + (height - bottomHeight)) / 2;
      buttonX = width / 2;
      buttonY = centerY + playZoneHeight * 0.35; // Position below play zone center
    }
    
    // Button container
    const buttonContainer = this.add.container(buttonX, buttonY);
    
    // Button background
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x4a90e2, 1);
    buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
    buttonBg.lineStyle(3, 0xffffff, 1);
    buttonBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
    
    // Button text
    const buttonFontSize = isMobile ? '18px' : '24px';
    const buttonText = this.add.text(0, 0, 'Submit', {
      fontSize: buttonFontSize,
      fontFamily: '"Comic Neue", cursive',
      fontWeight: 'bold',
      color: '#ffffff'
    });
    buttonText.setOrigin(0.5);
    
    buttonContainer.add([buttonBg, buttonText]);
    buttonContainer.setDepth(700);
    
    // Make interactive
    buttonBg.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    buttonBg.input.cursor = 'pointer';
    
    this.submitButton = buttonContainer;
    this.submitButtonBg = buttonBg;
    
    buttonBg.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x5aa0f2, 1);
      buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
      buttonBg.lineStyle(3, 0xffffff, 1);
      buttonBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
    });
    
    buttonBg.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x4a90e2, 1);
      buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
      buttonBg.lineStyle(3, 0xffffff, 1);
      buttonBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
    });
    
    buttonBg.on('pointerdown', () => {
      this.checkMathsFormula();
    });
  }

  initGeneralKnowledgeMode() {
    // Initialize questions
    this.questions = this.generateQuestions();
    this.currentQuestionSetIndex = 0; // Index of current set of 5 questions
    this.questionsAnsweredInSet = 0; // How many questions answered correctly in current set
    this.currentQuestionIndex = 0; // Index within current set (0-4)
    this.currentQuestionSet = []; // Current set of 5 questions
    this.loadNextQuestionSet();
    
    // No deck visualization
  }

  generateAchievableNumber() {
    // Generate all non-prime numbers from 5 to 50
    const primes = [5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const achievableNumbers = [];
    for (let i = 5; i <= 50; i++) {
      if (!primes.includes(i)) {
        achievableNumbers.push(i);
      }
    }
    return Phaser.Math.RND.pick(achievableNumbers);
  }

  generateQuestions() {
    // Generate 20 general knowledge questions
    return [
      { question: 'What is the capital of France?', answer: 'Paris', wrong: ['London', 'Berlin', 'Madrid', 'Rome'] },
      { question: 'What is 2 + 2?', answer: '4', wrong: ['3', '5', '6', '7'] },
      { question: 'What planet is known as the Red Planet?', answer: 'Mars', wrong: ['Venus', 'Jupiter', 'Saturn', 'Mercury'] },
      { question: 'How many continents are there?', answer: '7', wrong: ['5', '6', '8', '9'] },
      { question: 'What is the largest ocean?', answer: 'Pacific', wrong: ['Atlantic', 'Indian', 'Arctic', 'Southern'] },
      { question: 'What is the smallest prime number?', answer: '2', wrong: ['1', '3', '5', '7'] },
      { question: 'What is the capital of Japan?', answer: 'Tokyo', wrong: ['Osaka', 'Kyoto', 'Seoul', 'Beijing'] },
      { question: 'How many sides does a triangle have?', answer: '3', wrong: ['2', '4', '5', '6'] },
      { question: 'What is the chemical symbol for water?', answer: 'H2O', wrong: ['CO2', 'O2', 'NaCl', 'Fe'] },
      { question: 'What is the largest mammal?', answer: 'Blue Whale', wrong: ['Elephant', 'Giraffe', 'Hippo', 'Rhino'] },
      { question: 'What is the capital of Australia?', answer: 'Canberra', wrong: ['Sydney', 'Melbourne', 'Perth', 'Brisbane'] },
      { question: 'How many days are in a week?', answer: '7', wrong: ['5', '6', '8', '10'] },
      { question: 'What is the fastest land animal?', answer: 'Cheetah', wrong: ['Lion', 'Tiger', 'Leopard', 'Jaguar'] },
      { question: 'What is the capital of Canada?', answer: 'Ottawa', wrong: ['Toronto', 'Vancouver', 'Montreal', 'Calgary'] },
      { question: 'How many legs does a spider have?', answer: '8', wrong: ['6', '10', '12', '4'] },
      { question: 'What is the largest planet?', answer: 'Jupiter', wrong: ['Saturn', 'Neptune', 'Uranus', 'Earth'] },
      { question: 'What is the capital of Brazil?', answer: 'Brasilia', wrong: ['Rio', 'Sao Paulo', 'Buenos Aires', 'Lima'] },
      { question: 'How many minutes are in an hour?', answer: '60', wrong: ['30', '45', '90', '100'] },
      { question: 'What is the smallest country?', answer: 'Vatican', wrong: ['Monaco', 'San Marino', 'Liechtenstein', 'Malta'] },
      { question: 'What is the capital of Egypt?', answer: 'Cairo', wrong: ['Alexandria', 'Luxor', 'Giza', 'Aswan'] }
    ];
  }

  loadNextQuestionSet() {
    // Check win condition
    if (this.score >= 20) {
      this.showGameOver(true);
      return;
    }
    
    // Get next set of 5 questions
    const startIndex = this.currentQuestionSetIndex * 5;
    if (startIndex >= this.questions.length) {
      // Cycle back to beginning
      this.currentQuestionSetIndex = 0;
      this.loadNextQuestionSet();
      return;
    }
    
    // Get 5 questions for this set
    this.currentQuestionSet = [];
    for (let i = 0; i < 5 && (startIndex + i) < this.questions.length; i++) {
      this.currentQuestionSet.push(this.questions[startIndex + i]);
    }
    
    // If we don't have 5 questions left, cycle back
    if (this.currentQuestionSet.length < 5) {
      // Fill from beginning
      let fillIndex = 0;
      while (this.currentQuestionSet.length < 5) {
        this.currentQuestionSet.push(this.questions[fillIndex % this.questions.length]);
        fillIndex++;
      }
    }
    
    // Reset set progress
    this.currentQuestionIndex = 0;
    this.questionsAnsweredInSet = 0;
    this.currentQuestion = this.currentQuestionSet[0];
    this.pointsForCurrentQuestion = 3;
    
    // Create answer cards from all 5 questions in set
    // Hand must contain all 5 correct answers (one for each question in the set)
    this.availableAnswers = [];
    
    // Add all 5 correct answers (these MUST be in hand)
    this.currentQuestionSet.forEach(q => {
      this.availableAnswers.push(q.answer);
    });
    
    // Shuffle the answers
    this.availableAnswers = Phaser.Utils.Array.Shuffle(this.availableAnswers);
    
    // Display current question
    this.updateTopDisplay(this.currentQuestion.question);
    
    // Create hand with answer cards (all 5 correct answers)
    this.createGeneralKnowledgeHand();
  }

  createMathsHand() {
    const { width, height } = this.scale;
    const isMobile = width < 768;
    const numCards = 10;
    
    if (isMobile) {
      // Mobile: Two rows if needed, otherwise single row
      const handY = this.handStartY || (height * 0.7);
      const availableWidth = width * 0.95;
      const cardBaseWidth = 80;
      const cardBaseHeight = 120;
      const minSpacing = 5;
      
      // Check if we need two rows
      const maxCardWidth = (availableWidth - (minSpacing * (numCards - 1))) / numCards;
      const singleRowScale = Math.min(0.7, maxCardWidth / cardBaseWidth);
      const singleRowCardWidth = cardBaseWidth * singleRowScale;
      const needsTwoRows = (singleRowCardWidth + minSpacing) * numCards > availableWidth;
      
      if (needsTwoRows) {
        // Two rows layout
        const cardsPerRow = Math.ceil(numCards / 2);
        const maxCardWidthTwoRows = (availableWidth - (minSpacing * (cardsPerRow - 1))) / cardsPerRow;
        const cardScale = Math.min(0.7, maxCardWidthTwoRows / cardBaseWidth);
        const cardSpacing = (cardBaseWidth * cardScale) + minSpacing;
        const rowSpacing = (cardBaseHeight * cardScale) + 10;
        
        const totalWidth = (cardsPerRow - 1) * cardSpacing;
        const startX = width / 2 - totalWidth / 2;
        
        this.handCards = [];
        for (let i = 1; i <= numCards; i++) {
          const row = Math.floor((i - 1) / cardsPerRow);
          const col = (i - 1) % cardsPerRow;
          const cardY = handY + (row - 0.5) * rowSpacing;
          const cardX = startX + col * cardSpacing;
          
          const card = this.createDraggableCard(
            cardX,
            cardY,
            `numberCard${i}`,
            i.toString(),
            'number',
            i,
            cardScale
          );
          this.handCards.push(card);
        }
      } else {
        // Single row layout
        const cardScale = singleRowScale;
        const cardSpacing = (cardBaseWidth * cardScale) + minSpacing;
        const totalWidth = (numCards - 1) * cardSpacing;
        const startX = width / 2 - totalWidth / 2;
        
        this.handCards = [];
        for (let i = 1; i <= numCards; i++) {
          const card = this.createDraggableCard(
            startX + (i - 1) * cardSpacing,
            handY,
            `numberCard${i}`,
            i.toString(),
            'number',
            i,
            cardScale
          );
          this.handCards.push(card);
        }
      }
    } else {
      // Desktop: Two rows if needed, otherwise single row
      const bottomHeight = height * 0.15;
      const topHeight = height * 0.15;
      const playZoneHeight = height * 0.45;
      const centerY = (topHeight + (height - bottomHeight)) / 2;
      const submitButtonY = centerY + playZoneHeight * 0.35; // Submit button position
      const submitButtonHeight = 50;
      const handY = submitButtonY + submitButtonHeight / 2 + 80; // Cards much further below submit button
      const leftWidth = width * 0.15;
      const rightWidth = width * 0.15;
      const availableWidth = width - leftWidth - rightWidth;
      
      const cardBaseWidth = 80;
      const cardBaseHeight = 120;
      const minSpacing = 10;
      
      // Check if we need two rows
      const maxCardWidth = (availableWidth - (minSpacing * (numCards - 1))) / numCards;
      const singleRowScale = Math.min(1.0, maxCardWidth / cardBaseWidth);
      const singleRowCardWidth = cardBaseWidth * singleRowScale;
      const needsTwoRows = (singleRowCardWidth + minSpacing) * numCards > availableWidth;
      
      if (needsTwoRows) {
        // Two rows layout
        const cardsPerRow = Math.ceil(numCards / 2);
        const maxCardWidthTwoRows = (availableWidth - (minSpacing * (cardsPerRow - 1))) / cardsPerRow;
        const cardScale = Math.min(1.0, maxCardWidthTwoRows / cardBaseWidth);
        const cardSpacing = (cardBaseWidth * cardScale) + minSpacing;
        const rowSpacing = (cardBaseHeight * cardScale) + 15;
        
        const totalWidth = (cardsPerRow - 1) * cardSpacing;
        const startX = width / 2 - totalWidth / 2;
        
        this.handCards = [];
        for (let i = 1; i <= numCards; i++) {
          const row = Math.floor((i - 1) / cardsPerRow);
          const col = (i - 1) % cardsPerRow;
          const cardY = handY + (row - 0.5) * rowSpacing;
          const cardX = startX + col * cardSpacing;
          
          const card = this.createDraggableCard(
            cardX,
            cardY,
            `numberCard${i}`,
            i.toString(),
            'number',
            i,
            cardScale
          );
          this.handCards.push(card);
        }
      } else {
        // Single row layout
        const cardScale = singleRowScale;
        const cardSpacing = (cardBaseWidth * cardScale) + minSpacing;
        const totalWidth = (numCards - 1) * cardSpacing;
        const startX = width / 2 - totalWidth / 2;
        
        this.handCards = [];
        for (let i = 1; i <= numCards; i++) {
          const card = this.createDraggableCard(
            startX + (i - 1) * cardSpacing,
            handY,
            `numberCard${i}`,
            i.toString(),
            'number',
            i,
            cardScale
          );
          this.handCards.push(card);
        }
      }
    }
  }

  createGeneralKnowledgeHand() {
    const { width, height } = this.scale;
    const isMobile = width < 768;
    
    // Clear existing hand
    this.handCards.forEach(card => card.destroy());
    this.handCards = [];
    
    // Create cards for all available answers (should be 5)
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf7dc6f, 0xbb8fce];
    const numCards = Math.min(5, this.availableAnswers.length);
    
    if (isMobile) {
      // Mobile: Two rows if needed, otherwise single row
      const handY = this.handStartY || (height * 0.7);
      const availableWidth = width * 0.95;
      const cardBaseWidth = 80;
      const cardBaseHeight = 120;
      const mobileScaleMultiplier = 1.2; // From createDraggableAnswerCard
      const minSpacing = 12; // Increased spacing to prevent overlap
      
      // Check if we need two rows (account for mobile scale multiplier)
      const maxCardWidth = (availableWidth - (minSpacing * (numCards - 1))) / numCards;
      const singleRowScale = Math.min(0.7, maxCardWidth / (cardBaseWidth * mobileScaleMultiplier));
      const singleRowCardWidth = cardBaseWidth * singleRowScale * mobileScaleMultiplier;
      const needsTwoRows = (singleRowCardWidth + minSpacing) * numCards > availableWidth;
      
      if (needsTwoRows) {
        // Two rows layout
        const cardsPerRow = Math.ceil(numCards / 2);
        const maxCardWidthTwoRows = (availableWidth - (minSpacing * (cardsPerRow - 1))) / cardsPerRow;
        const cardScale = Math.min(0.7, maxCardWidthTwoRows / (cardBaseWidth * mobileScaleMultiplier));
        const actualCardWidth = cardBaseWidth * cardScale * mobileScaleMultiplier;
        const cardSpacing = actualCardWidth + minSpacing;
        const rowSpacing = (cardBaseHeight * cardScale * mobileScaleMultiplier) + 15;
        
        const totalWidth = (cardsPerRow - 1) * cardSpacing;
        const startX = width / 2 - totalWidth / 2;
        
        for (let i = 0; i < numCards; i++) {
          const row = Math.floor(i / cardsPerRow);
          const col = i % cardsPerRow;
          const cardY = handY + (row - 0.5) * rowSpacing;
          const cardX = startX + col * cardSpacing;
          const answer = this.availableAnswers[i];
          const card = this.createDraggableAnswerCard(
            cardX,
            cardY,
            answer,
            colors[i % colors.length],
            cardScale
          );
          this.handCards.push(card);
        }
      } else {
        // Single row layout
        const cardScale = singleRowScale;
        const actualCardWidth = cardBaseWidth * cardScale * mobileScaleMultiplier;
        const cardSpacing = actualCardWidth + minSpacing;
        const totalWidth = (numCards - 1) * cardSpacing;
        const startX = width / 2 - totalWidth / 2;
        
        for (let i = 0; i < numCards; i++) {
          const answer = this.availableAnswers[i];
          const card = this.createDraggableAnswerCard(
            startX + i * cardSpacing,
            handY,
            answer,
            colors[i % colors.length],
            cardScale
          );
          this.handCards.push(card);
        }
      }
    } else {
      // Desktop: Two rows if needed, otherwise single row
      const bottomHeight = height * 0.15;
      const handY = height - bottomHeight / 2;
      const leftWidth = width * 0.15;
      const rightWidth = width * 0.15;
      const availableWidth = width - leftWidth - rightWidth;
      
      const cardBaseWidth = 80;
      const cardBaseHeight = 120;
      const minSpacing = 15; // Increased spacing to prevent overlap
      
      // Check if we need two rows
      const maxCardWidth = (availableWidth - (minSpacing * (numCards - 1))) / numCards;
      const singleRowScale = Math.min(1.0, maxCardWidth / cardBaseWidth);
      const singleRowCardWidth = cardBaseWidth * singleRowScale;
      const needsTwoRows = (singleRowCardWidth + minSpacing) * numCards > availableWidth;
      
      if (needsTwoRows) {
        // Two rows layout
        const cardsPerRow = Math.ceil(numCards / 2);
        const maxCardWidthTwoRows = (availableWidth - (minSpacing * (cardsPerRow - 1))) / cardsPerRow;
        const cardScale = Math.min(1.0, maxCardWidthTwoRows / cardBaseWidth);
        const actualCardWidth = cardBaseWidth * cardScale;
        const cardSpacing = actualCardWidth + minSpacing;
        const rowSpacing = (cardBaseHeight * cardScale) + 20;
        
        const totalWidth = (cardsPerRow - 1) * cardSpacing;
        const startX = width / 2 - totalWidth / 2;
        
        for (let i = 0; i < numCards; i++) {
          const row = Math.floor(i / cardsPerRow);
          const col = i % cardsPerRow;
          const cardY = handY + (row - 0.5) * rowSpacing;
          const cardX = startX + col * cardSpacing;
          const answer = this.availableAnswers[i];
          const card = this.createDraggableAnswerCard(
            cardX,
            cardY,
            answer,
            colors[i % colors.length],
            cardScale
          );
          this.handCards.push(card);
        }
      } else {
        // Single row layout
        const cardScale = singleRowScale;
        const actualCardWidth = cardBaseWidth * cardScale;
        const cardSpacing = actualCardWidth + minSpacing;
        const totalWidth = (numCards - 1) * cardSpacing;
        const startX = width / 2 - totalWidth / 2;
        
        for (let i = 0; i < numCards; i++) {
          const answer = this.availableAnswers[i];
          const card = this.createDraggableAnswerCard(
            startX + i * cardSpacing,
            handY,
            answer,
            colors[i % colors.length],
            cardScale
          );
          this.handCards.push(card);
        }
      }
    }
  }

  createOperandCards() {
    const { width, height } = this.scale;
    const isMobile = width < 768;
    
    if (isMobile) {
      // Mobile: Operands below top bar, horizontal layout (between target and play zone)
      const topHeight = height * 0.15;
      const operandY = topHeight + height * 0.02; // Below top bar, above play zone
      const numOperands = 4;
      const availableWidth = width * 0.6; // Centered area
      const operandStartX = width * 0.2; // Start position
      
      // Calculate card size to fit 4 operands horizontally
      const cardBaseWidth = 80;
      const minSpacing = 8;
      const maxCardWidth = (availableWidth - (minSpacing * (numOperands - 1))) / numOperands;
      const cardScale = Math.min(0.65, maxCardWidth / cardBaseWidth); // Slightly bigger
      const cardSpacing = (cardBaseWidth * cardScale) + minSpacing;
      
      const totalWidth = (numOperands - 1) * cardSpacing;
      const startX = width / 2 - totalWidth / 2; // Centered
      
      const operands = [
        { key: 'operandPlus', symbol: '+', x: startX },
        { key: 'operandMinus', symbol: '-', x: startX + cardSpacing },
        { key: 'operandMultiply', symbol: '×', x: startX + cardSpacing * 2 },
        { key: 'operandDivide', symbol: '÷', x: startX + cardSpacing * 3 }
      ];
      
      this.operandCards = [];
      operands.forEach(op => {
        const card = this.createDraggableCard(
          op.x,
          operandY,
          op.key,
          op.symbol,
          'operand',
          op.symbol,
          cardScale
        );
        this.operandCards.push(card);
      });
    } else {
      // Desktop: Original vertical layout on left side
      const leftWidth = width * 0.15;
      const topHeight = height * 0.15;
      const bottomHeight = height * 0.15;
      const leftStartY = topHeight;
      const leftHeight = height - topHeight - bottomHeight;
      const operandX = leftWidth / 2;
      
      // Calculate spacing to fit all 4 operands evenly
      const numOperands = 4;
      const cardBaseHeight = 120;
      const minSpacing = 20;
      const availableHeight = leftHeight * 0.8; // Use 80% of available height
      const maxCardHeight = (availableHeight - (minSpacing * (numOperands - 1))) / numOperands;
      const cardScale = Math.min(1.4, maxCardHeight / cardBaseHeight); // Bigger on PC
      const spacing = (cardBaseHeight * cardScale) + minSpacing;
      const operandStartY = leftStartY + (leftHeight - (numOperands - 1) * spacing - cardBaseHeight * cardScale) / 2;
      
      const operands = [
        { key: 'operandPlus', symbol: '+', y: operandStartY },
        { key: 'operandMinus', symbol: '-', y: operandStartY + spacing },
        { key: 'operandMultiply', symbol: '×', y: operandStartY + spacing * 2 },
        { key: 'operandDivide', symbol: '÷', y: operandStartY + spacing * 3 }
      ];
      
      this.operandCards = [];
      operands.forEach(op => {
        const card = this.createDraggableCard(
          operandX,
          op.y,
          op.key,
          op.symbol,
          'operand',
          op.symbol,
          cardScale
        );
        this.operandCards.push(card);
      });
    }
  }

  createDraggableCard(x, y, textureKey, displayText, type, value, scale = 1.0) {
    const card = this.add.container(x, y);
    const { width } = this.scale;
    const isMobile = width < 768;
    // Don't apply extra mobile scaling here - scale is already calculated in calling functions
    const cardScale = scale;
    
    // Card image
    const cardImage = this.add.image(0, 0, textureKey);
    cardImage.setScale(cardScale);
    
    // Text on card
    const fontSize = isMobile ? '28px' : '36px';
    const text = this.add.text(0, 0, displayText, {
      fontSize: fontSize,
      fontFamily: '"Comic Neue", cursive',
      fontWeight: 'bold',
      color: '#000000'
    });
    text.setOrigin(0.5);
    text.setScale(cardScale);
    
    card.add([cardImage, text]);
    card.setDepth(600);
    
    // Make draggable
    const cardWidth = 80 * cardScale;
    const cardHeight = 120 * cardScale;
    card.setSize(cardWidth, cardHeight);
    card.setInteractive({ draggable: true });
    card.input.cursor = 'pointer';
    
    // Store card data
    card.cardType = type;
    card.cardValue = value;
    card.originalX = x;
    card.originalY = y;
    card.inPlayZone = false;
    card.textureKey = textureKey;
    card.displayText = displayText;
    card.cardScale = cardScale;
    
    // Drag events
    this.input.setDraggable(card);
    
    card.on('dragstart', (pointer) => {
      this.draggedCard = card;
      card.setDepth(1000);
      this.children.bringToTop(card);
    });
    
    card.on('drag', (pointer, dragX, dragY) => {
      card.x = dragX;
      card.y = dragY;
    });
    
    card.on('dragend', (pointer) => {
      // Check if dropped in play zone
      if (this.isInPlayZone(card.x, card.y)) {
        // Create a copy of the card for play zone (cards are reusable)
        const playCard = this.createPlayZoneCard(card.x, card.y, card.cardType, card.cardValue, card.textureKey, card.displayText, card.cardScale);
        playCard.inPlayZone = true;
        this.playZoneCards.push(playCard);
        
        // Return original card to hand
        this.tweens.add({
          targets: card,
          x: card.originalX,
          y: card.originalY,
          duration: 200,
          ease: 'Back.easeOut'
        });
        
        this.onCardAddedToPlayZone(playCard);
      } else {
        // Return to original position
        this.tweens.add({
          targets: card,
          x: card.originalX,
          y: card.originalY,
          duration: 200,
          ease: 'Back.easeOut'
        });
      }
      card.setDepth(600);
      this.draggedCard = null;
    });
    
    return card;
  }

  createPlayZoneCard(x, y, type, value, textureKey, displayText, scale = 1.0) {
    const card = this.add.container(x, y);
    const { width } = this.scale;
    const isMobile = width < 768;
    const cardScale = scale || (isMobile ? 1.2 : 1.0);
    
    const cardImage = this.add.image(0, 0, textureKey);
    cardImage.setScale(cardScale);
    const fontSize = isMobile ? '28px' : '36px';
    const text = this.add.text(0, 0, displayText, {
      fontSize: fontSize,
      fontFamily: '"Comic Neue", cursive',
      fontWeight: 'bold',
      color: '#000000'
    });
    text.setOrigin(0.5);
    text.setScale(cardScale);
    
    card.add([cardImage, text]);
    card.setDepth(1500); // Above play zone (which is at depth 1000)
    
    const cardWidth = 80 * cardScale;
    const cardHeight = 120 * cardScale;
    card.setSize(cardWidth, cardHeight);
    card.setInteractive({ draggable: true });
    card.input.cursor = 'pointer';
    
    card.cardType = type;
    card.cardValue = value;
    card.inPlayZone = true;
    card.cardScale = cardScale;
    card.textureKey = textureKey;
    card.displayText = displayText;
    
    // Allow dragging play zone cards to rearrange or remove
    this.input.setDraggable(card);
    
    card.on('dragstart', (pointer) => {
      this.draggedCard = card;
      card.setDepth(1000);
      this.children.bringToTop(card);
    });
    
    card.on('drag', (pointer, dragX, dragY) => {
      card.x = dragX;
      card.y = dragY;
    });
    
    card.on('dragend', (pointer) => {
      if (!this.isInPlayZone(card.x, card.y)) {
        // Removed from play zone - destroy it
        const index = this.playZoneCards.indexOf(card);
        if (index > -1) {
          this.playZoneCards.splice(index, 1);
        }
        card.destroy();
        this.updateMathsFormula();
      } else {
        // Still in play zone, just rearrange
        this.updateMathsFormula();
      }
      card.setDepth(600);
      this.draggedCard = null;
    });
    
    return card;
  }

  createDraggableAnswerCard(x, y, answerText, color, scale = 1.0) {
    const { width } = this.scale;
    const isMobile = width < 768;
    const cardScale = scale * (isMobile ? 1.2 : 1.0);
    
    // Create custom answer card with color
    const cardKey = `answerCard_${answerText}_${color}`;
    if (!this.textures.exists(cardKey)) {
      const cardGraphics = this.add.graphics();
      const cardWidth = 80;
      const cardHeight = 120;
      const borderWidth = 5;
      const cornerRadius = 8;
      
      cardGraphics.fillStyle(0xffffff, 1);
      cardGraphics.fillRoundedRect(0, 0, cardWidth, cardHeight, cornerRadius);
      cardGraphics.fillStyle(color, 1);
      cardGraphics.fillRoundedRect(0, 0, cardWidth, cardHeight, cornerRadius);
      cardGraphics.fillStyle(0xffffff, 1);
      cardGraphics.fillRoundedRect(borderWidth, borderWidth, cardWidth - borderWidth * 2, cardHeight - borderWidth * 2, cornerRadius - 2);
      
      cardGraphics.generateTexture(cardKey, cardWidth, cardHeight);
      cardGraphics.destroy();
    }
    
    const card = this.add.container(x, y);
    const cardImage = this.add.image(0, 0, cardKey);
    cardImage.setScale(cardScale);
    
    // Text on card (truncate if too long)
    const displayText = answerText.length > 8 ? answerText.substring(0, 8) + '...' : answerText;
    const fontSize = isMobile ? '18px' : '20px';
    const text = this.add.text(0, 0, displayText, {
      fontSize: fontSize,
      fontFamily: '"Comic Neue", cursive',
      fontWeight: 'bold',
      color: '#000000',
      wordWrap: { width: 70 },
      align: 'center'
    });
    text.setOrigin(0.5);
    text.setScale(cardScale);
    
    card.add([cardImage, text]);
    card.setDepth(600);
    
    const cardWidth = 80 * cardScale;
    const cardHeight = 120 * cardScale;
    card.setSize(cardWidth, cardHeight);
    card.setInteractive({ draggable: true });
    card.input.cursor = 'pointer';
    
    card.cardType = 'answer';
    card.cardValue = answerText;
    card.originalX = x;
    card.originalY = y;
    card.inPlayZone = false;
    card.cardScale = cardScale;
    
    this.input.setDraggable(card);
    
    card.on('dragstart', (pointer) => {
      this.draggedCard = card;
      card.setDepth(1000);
      this.children.bringToTop(card);
    });
    
    card.on('drag', (pointer, dragX, dragY) => {
      card.x = dragX;
      card.y = dragY;
    });
    
    card.on('dragend', (pointer) => {
      if (this.isInPlayZone(card.x, card.y)) {
        card.inPlayZone = true;
        this.playZoneCards.push(card);
        this.onAnswerCardPlayed(card);
      } else {
        this.tweens.add({
          targets: card,
          x: card.originalX,
          y: card.originalY,
          duration: 200,
          ease: 'Back.easeOut'
        });
        card.inPlayZone = false;
        const index = this.playZoneCards.indexOf(card);
        if (index > -1) {
          this.playZoneCards.splice(index, 1);
        }
      }
      card.setDepth(600);
      this.draggedCard = null;
    });
    
    return card;
  }


  isInPlayZone(x, y) {
    return x >= this.playZone.x - this.playZone.width / 2 &&
           x <= this.playZone.x + this.playZone.width / 2 &&
           y >= this.playZone.y - this.playZone.height / 2 &&
           y <= this.playZone.y + this.playZone.height / 2;
  }

  onCardAddedToPlayZone(card) {
    if (this.selectedMode === 'maths') {
      this.updateMathsFormula();
    }
  }

  updateMathsFormula() {
    // Arrange cards in play zone
    const cards = this.playZoneCards.filter(c => c.inPlayZone);
    if (cards.length === 0) return;
    
    const { width, height } = this.scale;
    const isMobile = width < 768;
    const playZoneWidth = this.playZone.width;
    const playZoneHeight = this.playZone.height;
    
    // Calculate card dimensions
    const cardBaseWidth = 80;
    const cardBaseHeight = 120;
    // Get scale from first card, or estimate based on screen size
    let cardScale = 1.0;
    if (cards.length > 0 && cards[0].cardScale) {
      cardScale = cards[0].cardScale;
    } else {
      // Estimate scale based on screen size
      cardScale = isMobile ? 1.2 : 1.0;
    }
    const cardWidth = cardBaseWidth * cardScale;
    const cardHeight = cardBaseHeight * cardScale;
    
    // Determine if we need two rows (if cards would overflow play zone width)
    const minSpacing = 10;
    const maxCardsPerRow = Math.floor((playZoneWidth - minSpacing) / (cardWidth + minSpacing));
    const needsTwoRows = cards.length > maxCardsPerRow;
    
    if (needsTwoRows) {
      // Two rows layout
      const cardsPerRow = Math.ceil(cards.length / 2);
      const rowSpacing = cardHeight + 15; // Vertical spacing between rows
      const cardSpacing = (playZoneWidth - cardWidth) / Math.max(1, cardsPerRow - 1);
      
      // Center rows vertically in play zone
      const totalRowsHeight = (2 - 1) * rowSpacing + cardHeight;
      const startY = this.playZone.y - totalRowsHeight / 2 + cardHeight / 2;
      
      cards.forEach((card, index) => {
        const row = Math.floor(index / cardsPerRow);
        const col = index % cardsPerRow;
        const cardX = this.playZone.x - playZoneWidth / 2 + cardWidth / 2 + col * cardSpacing;
        const cardY = startY + row * rowSpacing;
        
        this.tweens.add({
          targets: card,
          x: cardX,
          y: cardY,
          duration: 300,
          ease: 'Back.easeOut'
        });
      });
    } else {
      // Single row layout (original)
      const spacing = Math.min(100, (playZoneWidth - cardWidth) / Math.max(1, cards.length - 1));
      const startX = this.playZone.x - (cards.length - 1) * spacing / 2;
      
      cards.forEach((card, index) => {
        this.tweens.add({
          targets: card,
          x: startX + index * spacing,
          y: this.playZone.y,
          duration: 300,
          ease: 'Back.easeOut'
        });
      });
    }
    
    // No auto-check - user must click submit button
  }

  isValidMathsPattern(cards) {
    // Check if pattern alternates: number, operand, number, operand, number...
    for (let i = 0; i < cards.length; i++) {
      if (i % 2 === 0) {
        // Even indices should be numbers
        if (cards[i].cardType !== 'number') return false;
      } else {
        // Odd indices should be operands
        if (cards[i].cardType !== 'operand') return false;
      }
    }
    return true;
  }

  checkMathsFormula() {
    const cards = this.playZoneCards.filter(c => c.inPlayZone);
    if (cards.length < 3 || cards.length % 2 === 0) return;
    
    // Sort cards by x position (left to right)
    const sortedCards = [...cards].sort((a, b) => a.x - b.x);
    
    // Check if pattern is valid
    if (!this.isValidMathsPattern(sortedCards)) {
      this.showFeedback(false);
      this.recordWrongAnswer();
      this.clearPlayZone();
      return;
    }
    
    // Build formula string from sorted cards
    let formula = '';
    sortedCards.forEach(card => {
      if (card.cardType === 'number') {
        formula += card.cardValue;
      } else if (card.cardType === 'operand') {
        formula += card.cardValue === '×' ? '*' : card.cardValue === '÷' ? '/' : card.cardValue;
      }
    });
    
    try {
      const result = eval(formula);
      const isCorrect = Math.abs(result - this.targetNumber) < 0.001; // Use tolerance for floating point
      
      if (isCorrect) {
        // Correct! Calculate points based on number of operations
        // Shortest formula gets 3 points, longer formulas get less
        const operations = Math.floor(sortedCards.length / 2);
        let points = 0;
        if (operations === 1) points = 3;
        else if (operations === 2) points = 2;
        else if (operations === 3) points = 1;
        else points = 1; // 4 operations still gets 1 point
        
        this.addScore(points);
        this.consecutiveWrongAnswers = 0; // Reset wrong answer counter
        this.updateLossCrosses();
        
        // Show green feedback
        this.showFeedback(true);
        
        // Clear play zone first, then move to next round after a short delay
        this.clearPlayZone();
        
        // Wait for feedback to show, then move to next round
        this.time.delayedCall(800, () => {
          this.nextMathsRound();
        });
      } else {
        // Wrong
        this.showFeedback(false);
        this.recordWrongAnswer();
        this.clearPlayZone();
      }
    } catch (e) {
      // Invalid formula
      this.showFeedback(false);
      this.recordWrongAnswer();
      this.clearPlayZone();
    }
  }

  recordWrongAnswer() {
    this.consecutiveWrongAnswers++;
    this.updateLossCrosses();
    
    if (this.consecutiveWrongAnswers >= 3) {
      // Game over - 3 wrong answers in a row
      this.showGameOver(false, 'Try Again!');
    }
  }

  onAnswerCardPlayed(card) {
    // Check if answer is correct
    if (card.cardValue === this.currentQuestion.answer) {
      // Correct!
      this.addScore(this.pointsForCurrentQuestion);
      this.consecutiveWrongAnswers = 0; // Reset wrong answer counter
      this.updateLossCrosses();
      this.showFeedback(true);
      
      // Remove card from hand (only on correct answer)
      const index = this.handCards.indexOf(card);
      if (index > -1) {
        this.handCards.splice(index, 1);
        card.destroy();
      }
      
      // Remove from play zone
      const playIndex = this.playZoneCards.indexOf(card);
      if (playIndex > -1) {
        this.playZoneCards.splice(playIndex, 1);
      }
      
      // Check win condition
      if (this.score >= 20) {
        this.showGameOver(true);
        return;
      }
      
      // Move to next question in current set
      this.questionsAnsweredInSet++;
      this.currentQuestionIndex++;
      
      // Check if all 5 questions in set are answered
      if (this.questionsAnsweredInSet >= 5) {
        // All questions in set answered correctly - deal next set
        this.currentQuestionSetIndex++;
        this.loadNextQuestionSet();
      } else if (this.currentQuestionIndex < this.currentQuestionSet.length) {
        // Move to next question in current set
        this.currentQuestion = this.currentQuestionSet[this.currentQuestionIndex];
        this.pointsForCurrentQuestion = 3;
        this.updateTopDisplay(this.currentQuestion.question);
        // Don't reload hand - cards stay until all 5 are answered
      } else {
        // Shouldn't happen, but handle it
        this.currentQuestionSetIndex++;
        this.loadNextQuestionSet();
      }
    } else {
      // Wrong answer - reduce points (minimum 1)
      this.pointsForCurrentQuestion = Math.max(1, this.pointsForCurrentQuestion - 1);
      this.showFeedback(false);
      this.recordWrongAnswer();
      
      // Return card to hand (never remove on wrong answer)
      this.tweens.add({
        targets: card,
        x: card.originalX,
        y: card.originalY,
        duration: 300,
        ease: 'Back.easeOut'
      });
      card.inPlayZone = false;
      const playIndex = this.playZoneCards.indexOf(card);
      if (playIndex > -1) {
        this.playZoneCards.splice(playIndex, 1);
      }
    }
  }

  nextMathsRound() {
    // Clear play zone
    this.clearPlayZone();
    
    // Generate new target
    this.targetNumber = this.generateAchievableNumber();
    this.updateTopDisplay(`Target: ${this.targetNumber}`);
    
    // Check win condition
    if (this.score >= 20) {
      this.showGameOver(true);
    }
  }

  clearPlayZone() {
    // Destroy all play zone cards (they're copies, not originals)
    this.playZoneCards.forEach(card => {
      if (card && card.active) {
        card.destroy();
      }
    });
    this.playZoneCards = [];
  }

  showFeedback(isCorrect) {
    const { width, height } = this.scale;
    const color = isCorrect ? 0x00ff00 : 0xff0000;
    const alpha = 0.3;
    
    this.feedbackOverlay.setFillStyle(color, alpha);
    this.feedbackOverlay.setAlpha(1);
    
    this.tweens.add({
      targets: this.feedbackOverlay,
      alpha: 0,
      duration: 500,
      delay: 300
    });
  }

  addScore(points) {
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  updateTopDisplay(text) {
    if (this.topDisplayText) {
      this.topDisplayText.destroy();
    }
    
    const { width, height } = this.scale;
    const isMobile = width < 768;
    const topHeight = isMobile ? height * 0.15 : height * 0.15;
    
    if (isMobile) {
      // Mobile: Target/question in top bar, left side (centered in its zone)
      this.topDisplayText = this.add.text(width * 0.15, topHeight / 2, text, {
        fontSize: '14px',
        fontFamily: '"Comic Neue", cursive',
        fontWeight: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        wordWrap: { width: width * 0.2 },
        align: 'center'
      });
      this.topDisplayText.setOrigin(0.5);
      this.topDisplayText.setDepth(1000);
    } else {
      // Desktop: Original layout
      const rightWidth = width * 0.15;
      const leftWidth = width * 0.15;
      const availableWidth = width - leftWidth - rightWidth;
      
      this.topDisplayText = this.add.text(width / 2, topHeight / 2, text, {
        fontSize: '32px',
        fontFamily: '"Comic Neue", cursive',
        fontWeight: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        wordWrap: { width: availableWidth * 0.9 },
        align: 'center'
      });
      this.topDisplayText.setOrigin(0.5);
      this.topDisplayText.setDepth(1000);
    }
  }

  showGameOver(won, customMessage = null) {
    const { width, height } = this.scale;
    
    // Create game over overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setDepth(3000);
    
    const message = customMessage || (won ? 'You Win!' : 'Game Over');
    const finalScore = `Final Score: ${this.score}`;
    
    const titleText = this.add.text(width / 2, height / 2 - 50, message, {
      fontSize: '64px',
      fontFamily: '"Comic Neue", cursive',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5
    });
    titleText.setOrigin(0.5);
    titleText.setDepth(3001);
    
    const scoreText = this.add.text(width / 2, height / 2 + 20, finalScore, {
      fontSize: '48px',
      fontFamily: '"Comic Neue", cursive',
      fontWeight: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    scoreText.setOrigin(0.5);
    scoreText.setDepth(3001);
    
    // Return to start button
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = width / 2;
    const buttonY = height / 2 + 100;
    
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x4a90e2, 1);
    buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, 10);
    buttonBg.lineStyle(3, 0xffffff, 1);
    buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, 10);
    buttonBg.setDepth(3001);
    
    const buttonText = this.add.text(buttonX, buttonY, 'Back to Start', {
      fontSize: '24px',
      fontFamily: '"Comic Neue", cursive',
      fontWeight: 'bold',
      color: '#ffffff'
    });
    buttonText.setOrigin(0.5);
    buttonText.setDepth(3002);
    
    const buttonZone = this.add.zone(buttonX, buttonY, buttonWidth, buttonHeight);
    buttonZone.setInteractive({ useHandCursor: true });
    buttonZone.setDepth(3002);
    
    buttonZone.on('pointerdown', () => {
      // Reset registry to clear any stored state
      this.registry.set('selectedMode', null);
      this.scene.start('StartScene');
    });
  }
}
