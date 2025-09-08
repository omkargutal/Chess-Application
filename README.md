Chess Game Web Application

A modern, two-player chess game built with React, TypeScript, and Tailwind CSS. It features real-time scoring, timers, pawn promotion, check/checkmate detection, and a polished user interface with dark mode support.
### Features
	•	Fully functional chess game with standard rules.
	•	Real-time move validation and highlighting.
	•	Timer for each player with countdown.
	•	Check, checkmate, stalemate, and draw detection.
	•	Pawn promotion with user-selectable piece.
	•	Undo and new game functionality.
	•	Responsive UI using Tailwind CSS with custom theming.
	•	Dark mode support with custom CSS variables.


Installation
1.	Clone the repo:
git clone <repository-url>
cd <repository-folder>

2.	Install dependencies:
npm install

3.	Run the development server:
npm run dev

4.	Open your browser at `http://localhost:5173`


### Usage
	•	Click on a piece to select and view valid moves.
	•	Click on a destination square to move the piece.
	•	Pawn promotion modal appears when applicable.
	•	Timer counts down per player’s turn.
	•	Start a new game using the “New Game” button.


### Project Structure
	•	`src/` – Source files including React components and utilities.
	•	`utils/chess-logic.ts` – Chess rules, move generation, and games state logic.
	•	`components/` – UI components like board, modals, game status.
	•	`index.css` – Tailwind CSS with custom theming and CSS variables.
	•	`postcss.config.cjs` & `tailwind.config.js` – Tailwind CSS and PostCSS configurations.
	•	`App.tsx` – Main React component managing game state and logic.


### Technology Stack
	•	React 19 with TypeScript
	•	Tailwind CSS 4
	•	Vite for build and dev server
	•	PostCSS with `@tailwindcss/postcss` plugin
	•	Radix UI components (optional UI primitives)
	•	Motion for animation effects




