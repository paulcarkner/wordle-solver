import React from "react";
import "reset-css";
import "./Assets/karnakcondensed-normal-700.woff2";
import Style from "./App.module.css";

import Board from "./Board";
import Keyboard from "./Keyboard";
import SideBar from "./SideBar";

import * as processor from "./Utils/processor.js";

const alphabet = "abcdefghijklmnopqrstuvwxyz";

//Styles set programatically so App can be used as sub-module in portfolio
const bodyStyles = {
  fontSize: "16px",
  lineHeight: "1em",
  margin: 0,
  color: "#000",
  fontFamily: "'Clear Sans', 'Helvetica Neue', Arial, sans-serif",
  fontWeight: "bold",
  userSelect: "none",
};

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //initial variables
      words: [null, null, null, null, null, null], //list of guessed words
      wordIsValid: null, //flag for error styling
      wordPos: 0, //current word index
      colors: [
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
      ], //table of letter colours/status
      coloringIndex: "", //current letter during colouring step
      placeholder: "     ", //placeholder of top suggestion shown as shadow in next word
      step: "input", //current step ["input" for typing, "color" for marking letter colours]
      keyListenerAdded: false, //flag to prevent debugger triggering letter press twice

      //solver variables
      possibleLetters: new Array(5).fill(alphabet), //list of remaining potential letters in each word
      minMaxLetters: Object.fromEntries(
        new Map(
          new Array(26).fill("").map((x, i) => {
            return [alphabet[i], { min: 0, max: 5 }];
          })
        )
      ), //list of minimum/maximum number of occurances in potential words of each letter from the alphabet, starts as min:0, max:5
      possibleWords: [], //list of potential words based on inputs
    };
  }

  componentDidMount = () => {
    //Set HTML and BODY styles programatically
    for (let key in bodyStyles) document.body.style[key] = bodyStyles[key];
    document.title = "WordleSolver";

    if (!this.keyListenerAdded) {
      //needed to prevent debugger from firing keyup a second time
      window.addEventListener("keyup", this.keyPressHandler);
      this.setState({ keyListenerAdded: true });
    }
  };

  updatePossibleLetters = async () => {
    //manipulate copy of current state the setState with updated values at end of function
    let stateCopy = this.state;

    //reset letter filters
    stateCopy.possibleLetters = new Array(5).fill(alphabet);
    stateCopy.minMaxLetters = Object.fromEntries(
      new Map(
        new Array(26).fill("").map((x, i) => {
          return [alphabet[i], { min: 0, max: 5 }];
        })
      )
    );

    //loop through each entered word reducing potential letter list and min/max letter counts
    for (
      let wordIndex = 0;
      wordIndex < this.state.words.filter((word) => word !== null).length;
      wordIndex++
    ) {
      let word = this.state.words[wordIndex];
      let letterCount = {};

      //look through word letters
      for (let letterIndex = 0; letterIndex < 5; letterIndex++) {
        let letter = word[letterIndex];
        if (!letterCount[letter])
          letterCount[letter] = { count: 0, locations: [], colors: [] }; //if letter is not in counter, add it
        letterCount[letter].count++; //increment letter count object
        letterCount[letter].locations.push(letterIndex); //add letter position to letter count object
        const letterColor = this.state.colors[wordIndex][letterIndex];
        letterCount[letter].colors.push(letterColor); //add letter colour to letter count object

        //if letter in not in current position, remove it from array of possible letters in this position
        if (letterColor === "missing" || letterColor === "present")
          stateCopy.possibleLetters = stateCopy.possibleLetters.map(
            (possibleLetter, i) =>
              i === letterIndex
                ? possibleLetter
                    .split("")
                    .filter((l) => l !== letter)
                    .join("")
                : possibleLetter
          );

        //if letter is correct remove all other letters from array of possible letters in this position
        if (letterColor === "correct")
          stateCopy.possibleLetters = stateCopy.possibleLetters.map(
            (possibleLetter, i) => (i === letterIndex ? letter : possibleLetter)
          );
      }

      Object.keys(letterCount).forEach(async (letter) => {
        //remove letter from unknow positions if "missing" and not "present"
        if (
          letterCount[letter].colors.includes("missing") &&
          !letterCount[letter].colors.includes("present")
        )
          stateCopy.possibleLetters = stateCopy.possibleLetters.map(
            (possibleLetter, i) =>
              letterCount[letter].locations.includes(i)
                ? possibleLetter
                : possibleLetter
                    .split("")
                    .filter((l) => l !== letter)
                    .join("")
          );

        //update min/max
        stateCopy.minMaxLetters = Object.assign(
          stateCopy.minMaxLetters,
          Object.fromEntries(
            new Map([
              [
                letter,
                {
                  min: Math.max(
                    stateCopy.minMaxLetters[letter].min,
                    letterCount[letter].colors.filter(
                      (color) => color !== "missing"
                    ).length
                  ),
                  max: Math.min(
                    stateCopy.minMaxLetters[letter].max,
                    letterCount[letter].colors.filter(
                      (color) => color === "missing"
                    ).length > 0
                      ? letterCount[letter].colors.filter(
                          (color) => color !== "missing"
                        ).length
                      : 5
                  ),
                },
              ],
            ])
          )
        );
      });
    }

    //end game if word found
    if (this.state.possibleLetters.join("").length === 5) {
      this.setState({
        placeholder: "     ",
        step: "complete",
        coloringIndex: "",
        wordPos: -1,
        possibleWords: [
          { word: this.state.words[this.state.wordPos - 1], count: 1 },
        ],
      });
      return;
    }

    //update state
    this.setState(stateCopy, () => {
      this.getSuggestions(); //get list of remaining potential words
    });
  };

  //generate list of remaining potential words
  getSuggestions = () => {
    //create regex to reduce master list based on possible letters
    const letterLocationRegex = new RegExp(
      "^" +
        this.state.possibleLetters
          .map((letters) => "[" + letters + "]")
          .join("") +
        "$"
    ); //regex has form "^[abc...xyz][abc...xyz][abc...xyz][abc...xyz][abc...xyz]$" with letter options removed

    const wordList = processor.wordList
      .filter((word) => letterLocationRegex.test(word)) //perform regex test on word list
      .filter((word) => {
        //further reduce list based on min/max number of letters allowed
        for (const letter of alphabet) {
          if (
            this.state.minMaxLetters[letter].min === 0 &&
            this.state.minMaxLetters[letter].max === 5
          )
            continue;
          const letterCount = word.split("").filter((l) => l === letter).length;
          if (
            letterCount < this.state.minMaxLetters[letter].min ||
            letterCount > this.state.minMaxLetters[letter].max
          )
            return false;
        }
        return true;
      });

    //for possible words, compare letters of word with possibles to count number of occurances
    const wCount = wordList
      .map((x) => {
        return {
          word: x,
          count:
            wordList.filter((y) => y.indexOf(x[0]) === 0).length +
            wordList.filter((y) => y.indexOf(x[1]) === 1).length +
            wordList.filter((y) => y.indexOf(x[2]) === 2).length +
            wordList.filter((y) => y.indexOf(x[3]) === 3).length +
            wordList.filter((y) => y.indexOf(x[4]) === 4).length,
        };
      })
      .sort((a, b) => (a.count > b.count ? -1 : 1)); //sort list by words with highest letter occurances

    //update word list
    this.setState({
      placeholder: wCount.length === 0 ? "" : wCount[0].word,
      possibleWords: wCount,
    });
  };

  keyPressHandler = (e) => {
    if (this.state.step !== "input") return; //only capture keypress during "input" step

    if (/^[a-zA-Z]$/.test(e.key)) {
      //check for valid letter
      //letter pressed
      this.addLetter(e.key.toLowerCase());
      return;
    }

    if (e.keyCode === 13) {
      //enter pressed
      this.submitWord();
      return;
    }

    if (e.keyCode === 46 || e.keyCode === 8) {
      //backpsace or delete pressed
      this.removeLetter();
      return;
    }
  };

  addLetter = (letter) => {
    //console.log(letter);
    if (this.state.words[this.state.wordPos]?.length === 5) return; //only allow 5 letters
    let wordsCopy = this.state.words;
    let currentWord = wordsCopy[this.state.wordPos];
    currentWord = (currentWord || "") + letter; //add letter to current word
    wordsCopy[this.state.wordPos] = currentWord;
    this.setState({
      words: wordsCopy,
      wordIsValid:
        currentWord.length === 5 ? processor.checkWord(currentWord) : null, //check if entered word is valid and set flag
    });
  };

  removeLetter = () => {
    if (this.state.words[this.state.wordPos]?.length === 0) return; //exit if word has no letters
    let wordsCopy = this.state.words;
    let currentWord = wordsCopy[this.state.wordPos];
    currentWord = currentWord.slice(0, -1); //remove last letter
    wordsCopy[this.state.wordPos] = currentWord;
    this.setState({ words: wordsCopy, wordIsValid: null });
  };

  submitWord = () => {
    //check if word is complete and valid
    if (
      this.state.words[this.state.wordPos]?.length !== 5 ||
      !this.state.wordIsValid
    )
      return;

    this.initColoring(); //initiate colouring step
  };

  initColoring = async () => {
    //set step to "color"
    await new Promise((resolve) => {
      this.setState({ step: "color" }, () => resolve());
    });

    //find first letter that is not coloured
    for (
      let wordPos = 0;
      wordPos < this.state.words.filter((word) => word !== null).length;
      wordPos++
    ) {
      for (let letterPos = 0; letterPos < 5; letterPos++) {
        if (this.state.colors[wordPos][letterPos] === "") {
          this.setState({
            coloringIndex: wordPos + ":" + letterPos, //set un-coloured letter index
          });
          return;
        }
      }
    }

    //if all letters coloured set step to "input" and go to next word line
    this.setState(
      {
        step: "input",
        wordPos: this.state.words.filter((word) => word !== null).length,
        coloringIndex: "",
      },
      () => {
        this.updatePossibleLetters();
      }
    );
  };

  handleColorClick = (color) => {
    //handles when a letter colour is selected
    const colorIndex = this.state.coloringIndex.split(":"); //get current colouring index
    let colorsCopy = this.state.colors; //get stored colours
    colorsCopy[colorIndex[0]][colorIndex[1]] = color; //update colour at currect index

    //store updated colours
    this.setState(
      {
        colors: colorsCopy,
      },
      () => this.initColoring() //find next un-coloured letter
    );
  };

  handleTileClick = (tileIndexKey) => {
    //allow user to change previously coloured letter colour
    if (this.state.step === "color") return; //only allow during "input" steo
    const tileIndex = tileIndexKey.split(":"); //get clicked tile index
    if (this.state.colors[tileIndex[0]][tileIndex[1]] === "") return; ///only allow on coloured tiles
    let colorsCopy = this.state.colors;
    colorsCopy[tileIndex[0]][tileIndex[1]] = ""; //clear stored colour for clicked tile
    let wordsCopy = this.state.words;
    wordsCopy[this.state.wordPos] = null; //clear current word
    this.setState({ words: wordsCopy, colors: colorsCopy }, () =>
      this.initColoring() //function will now find tile with missing colour
    );
  };

  render = () => {
    return (
      <div className={Style.app}>
        <header className={Style.header}>WordleSolver</header>
        <SideBar step={this.state.step} words={this.state.possibleWords} />
        <Board
          gameState={this.state}
          handleColorClick={this.handleColorClick}
          handleTileClick={this.handleTileClick}
        />
        <Keyboard gameState={this.state} />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0"
        />
      </div>
    );
  };
}
