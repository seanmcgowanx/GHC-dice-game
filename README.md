# Golden Hills Casino Dice Game

## Overview
Golden Hills Casino Dice Game is a simple dice game where the objective is to roll the dice until all of them show the same value. This repository contains the code for the web application implementing the game.

## Technologies Used
- HTML
- CSS
- JavaScript (React)
- Firebase Authentication
- Firestore Database

## Files Included
- `index.html`: The main HTML file containing the structure of the web page.
- `index.jsx`: The main JavaScript file using React to render the application.
- `index.css`: The CSS file styling the application.
- `App.jsx`: React component defining the logic and UI for the game.
- `components/Die.jsx`: React component representing a single die in the game
- `components/Leaderboard.jsx`: React component defining the leaderboard

## How to Run
To run the application locally, follow these steps:

1. Clone this repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Install dependencies by running:

npm install

or 

yarn install

4. Start the development server by running:

npm run dev

or

yarn run dev

## How to Play
1. Click the "Roll" button to roll the dice.
2. Click on individual dice to hold them at their current value.
3. Continue rolling until all dice show the same value.
4. Your score is calculated based on the number of rolls and time taken to complete the game.

## Features
- Dynamic dice rolling and holding functionality.
- Real-time updates for count, time, and score.
- High score tracking using browser's local storage.
- Live leaderboard updates from Firestore database
- Responsive design for various screen sizes.

## Live Demo

[click here](https://ghc-dice-game.netlify.app)



