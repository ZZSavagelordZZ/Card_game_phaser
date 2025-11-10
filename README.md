# Phaser Card Game

## Overview
This project is a web-based card game built using Phaser, a popular HTML5 game framework. The game is structured to allow for easy expansion and modification.



## Setup Instructions


2. **Install Dependencies**
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Run the Development Server**
   Start the Vite development server:
   ```bash
   npm run dev
   ```

4. **Open the Game**
   Open your browser and navigate to `http://localhost:5173/` to play the game.

## Game Details
This card game allows players to engage in a fun and interactive experience. The game logic is handled in the `GameScene.ts` file, where it has two modes, maths and synonyms game that you can choose from before loading the game scene. game rules are explained after you select them and the logic behind them is quite straightforward:
for the maths game you need to use mathematic operations to get the target number, the less operations you use the higher the points.

for synonyms game, you must match each word to it's synonym, each wrong answer reduces the points you get from 3 to 1 and on 3 wrong answers you get stricked out.

