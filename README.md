# Task 32: Offline Chess Game (ReactJS)

**Author:** D P Rithvik Kumar

## How to Run
To run this project locally on your machine, follow these steps:
1. Open your terminal in the project folder.
2. Install the necessary packages by running: `npm install`
3. Start the local development server by running: `npm run dev`
4. Open the `localhost` link provided in your terminal in your web browser.

## Development Process
Building this chess logic from scratch without any libraries was a major challenge. I had to break it down piece by piece. 
- First, I created the initial 8x8 board array.
- Next, I implemented the pawn movements (which are the hardest because they move forward but capture diagonally).
- Then, I added the other pieces (Rooks, Bishops, Queens) using `while` loops to check for blocked paths.
- Checking for "check" was the trickiest part. I realized I had to simulate every pseudo-legal move on a fake/temporary board to see if the king would be attacked after the move.