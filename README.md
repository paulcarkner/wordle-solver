# WordleSolver
React page where you can enter your guesses and color hints from Wordle and the page will suggest the best words for your next guess.

All algorithms used in this page are written by the author without reference to existing Wordle solving algorithms. All suggested words meet the restrictions of color hints provided and are sorted by the word whose letters are most frequent in the remaining potential word list.

## How to use
Open a Wordle game in another window and submit your first guess. Enter the same word into the WordleSolver and select the color hints provided by Wordle. The WordleSovler will show a list of potential remaining words and suggest the highest. Enter your second guess into Wordle and repeat the process until the solution is found.

## How it works
The algorithm has two arrays, one which tracks which letters are allowed in each position, and one which tracks the minimum and maximum number of each letter the word must have. As color hints are entered these two arrays reduce/narrow in options which restrict the number of potential words shown from the master word list of all possible words.
