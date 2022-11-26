import React from "react";
import Style from "./App.module.css";

import Board from "./Board";
import Keyboard from "./Keyboard";
import SideBar from "./SideBar";

import * as processor from "./Utils/processor.js";

const alphabet = "abcdefghijklmnopqrstuvwxyz";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      words: [null, null, null, null, null, null],
      wordIsValid: null,
      wordPos: 0,
      colors: [
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
      ],
      coloringIndex: "",
      placeholder: "     ",
      step: "input",
      keyListenerAdded: false,

      possibleLetters: new Array(5).fill(alphabet),
      minMaxLetters: Object.fromEntries(
        new Map(
          new Array(26).fill("").map((x, i) => {
            return [alphabet[i], { min: 0, max: 5 }];
          })
        )
      ),
      possibleWords: [],
    };
  }

  componentDidMount = () => {
    //console.log({name: arguments.callee.name, args: arguments});
    if (!this.keyListenerAdded) {
      //needed to prevent debugger from firing keyup a second time
      window.addEventListener("keyup", this.keyPressHandler);
      this.setState({ keyListenerAdded: true });
    }

    //this.getSuggestions();
  };

  updatePossibleLetters = async () => {
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

    for (
      let wordIndex = 0;
      wordIndex < this.state.words.filter((word) => word !== null).length;
      wordIndex++
    ) {
      let word = this.state.words[wordIndex];
      let letterCount = {};
      for (let letterIndex = 0; letterIndex < 5; letterIndex++) {
        let letter = word[letterIndex];
        if (!letterCount[letter])
          letterCount[letter] = { count: 0, locations: [], colors: [] };
        letterCount[letter].count++;
        letterCount[letter].locations.push(letterIndex);
        const letterColor = this.state.colors[wordIndex][letterIndex];
        letterCount[letter].colors.push(letterColor);
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

        if (letterColor === "correct")
          stateCopy.possibleLetters = stateCopy.possibleLetters.map(
            (possibleLetter, i) => (i === letterIndex ? letter : possibleLetter)
          );
      }
      Object.keys(letterCount).forEach(async (letter) => {
        //remove letter from unknow positions if "missing" and no "present"
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

    this.setState(stateCopy, () => {
      this.getSuggestions();
    });
  };

  getSuggestions = () => {
    const letterLocationRegex = new RegExp(
      "^" +
        this.state.possibleLetters
          .map((letters) => "[" + letters + "]")
          .join("") +
        "$"
    );
    const wordList = processor.wordList
      .filter((word) => letterLocationRegex.test(word))
      .filter((word) => {
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
      .sort((a, b) => (a.count > b.count ? -1 : 1));

    //console.log(wCount);
    this.setState({
      placeholder: wCount.length === 0 ? "" : wCount[0].word,
      possibleWords: wCount,
    });
  };

  keyPressHandler = (e) => {
    //console.log(e);
    if (this.state.step !== "input") return;

    if (/^[a-zA-Z]$/.test(e.key)) {
      //letter pressed
      //console.log("letter");
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
      //console.log("delete");
      this.removeLetter();
      return;
    }
  };

  addLetter = (letter) => {
    //console.log(letter);
    if (this.state.words[this.state.wordPos]?.length === 5) return;
    let wordsCopy = this.state.words;
    let currentWord = wordsCopy[this.state.wordPos];
    currentWord = (currentWord || "") + letter;
    wordsCopy[this.state.wordPos] = currentWord;
    this.setState(
      {
        words: wordsCopy,
        wordIsValid:
          currentWord.length === 5 ? processor.checkWord(currentWord) : null,
      } //,
      //() => this.updateColors()
    );
  };

  removeLetter = () => {
    if (this.state.words[this.state.wordPos]?.length === 0) return;
    let wordsCopy = this.state.words;
    let currentWord = wordsCopy[this.state.wordPos];
    currentWord = currentWord.slice(0, -1);
    wordsCopy[this.state.wordPos] = currentWord;
    this.setState(
      { words: wordsCopy, wordIsValid: null } //, () =>
      //this.updateColors()
    );
  };

  submitWord = () => {
    //let gameState = this.state;
    if (
      this.state.words[this.state.wordPos]?.length !== 5 ||
      !this.state.wordIsValid
    )
      return;

    this.initColoring();
  };

  initColoring = async () => {
    //console.log("initColoring");
    //console.log(this.state.colors);
    await new Promise((resolve) => {
      this.setState({ step: "color" }, () => resolve());
    });
    for (
      let wordPos = 0;
      wordPos < this.state.words.filter((word) => word !== null).length;
      wordPos++
    ) {
      for (let letterPos = 0; letterPos < 5; letterPos++) {
        if (this.state.colors[wordPos][letterPos] === "") {
          this.setState({
            coloringIndex: wordPos + ":" + letterPos,
          });
          return;
        }
      }
    }
    this.setState(
      {
        step: "input",
        wordPos: this.state.words.filter((word) => word !== null).length,
        coloringIndex: "",
      },
      () => {
        this.updatePossibleLetters();
        //this.getSuggestions();
      }
    );
  };

  handleColorClick = (color) => {
    //console.log("handleColorClick");
    const colorIndex = this.state.coloringIndex.split(":");
    let colorsCopy = this.state.colors;
    //console.log(colorIndex);
    //console.log(colorsCopy);
    colorsCopy[colorIndex[0]][colorIndex[1]] = color;

    //console.log(colorsCopy);
    //console.log("thing" + colorsCopy[0][0] + ":" + colorsCopy[1][0] + ":" + color);
    this.setState(
      {
        colors: colorsCopy,
        // correct: correctCopy,
        // present: presentCopy,
        // missing: missingCopy,
      },
      () => this.initColoring()
    );
  };

  handleTileClick = (tileIndexKey) => {
    if (this.state.step === "color") return;
    const tileIndex = tileIndexKey.split(":");
    if (this.state.colors[tileIndex[0]][tileIndex[1]] === "") return;
    let colorsCopy = this.state.colors;
    colorsCopy[tileIndex[0]][tileIndex[1]] = "";
    let wordsCopy = this.state.words;
    wordsCopy[this.state.wordPos] = null;
    this.setState({ words: wordsCopy, colors: colorsCopy }, () =>
      this.initColoring()
    );
  };

  render = () => {
    return (
      <div className={Style.app}>
        <header>WordleSolver</header>
        <SideBar step={this.state.step} words={this.state.possibleWords} />
        <Board
          gameState={this.state}
          handleColorClick={this.handleColorClick}
          handleTileClick={this.handleTileClick}
        />
        <Keyboard gameState={this.state} />
      </div>
    );
  };
}
