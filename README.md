# Task 32: Offline Chess Game (ReactJS)

**Author:** D P Rithvik Kumar

## Core Architectural Decisions & Rules Validation
1. **Zero Library Execution Strategy:** To adhere strictly to requirements, I wrote pure JavaScript geometric matrix calculations to map piece movements without calling external dependencies like `chess.js` or pre-built boards.
2. **Move Validation Matrix:** 
   - *Sliding Pieces (Rook, Bishop, Queen):* Use directional stepping vectors combined with dynamic boundary collision tracking to check for obstructions.
   - *Stepping/Leaping Pieces (Knight, King, Pawn):* Use absolute indexing offsets checked against destination coordinate state properties.
3. **King Check Prevention:** Every pseudo-legal step executes a temporary grid-clone trial check. If the test matrix reveals that the move leaves or places the King under check conditions, it is removed from the array before highlight options are rendered.
4. **Algebraic Notation Generation:** Indices are converted dynamically using standard file column letters (`a` to `h`) and rank row numbers (`1` to `8`) appending specialized trigger indicators like captures (`x`) and checks (`+`, `#`).
5. **State-Locked Countdown Engine:** Active turn triggers execute synchronized native hook loops tracking remaining times independently while pausing processing for inactive players.