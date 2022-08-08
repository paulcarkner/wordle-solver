import React from "react";
import Style from "./App.module.css";

import Board from "./Board";
import Keyboard from "./Keyboard";

import * as processor from "./Utils/processor.js";

const alphabet = "abcdefghijklmnopqrstuvwxyz";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      words: [null, null, null, null, null, null],
      wordIsValid: null,
      wordPos: 0,
      correct: [null, null, null, null, null],
      present: [[], [], [], [], []],
      missing: [],
      colors: new Array(6).fill(new Array(5).fill("")),
      coloringIndex: "",
      placeholder: "*****",
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
    };
  }

  componentDidMount = () => {
    if (!this.keyListenerAdded) {
      //needed to prevent debugger from firing keyup a second time
      window.addEventListener("keyup", this.keyPressHandler);
      this.setState({ keyListenerAdded: true });
    }

    this.getSuggestions();
    console.log(this.state);
  };

  updateColors = () => {
    this.setState({
      colors: this.state.words.map((word) => {
        if (word === null) return new Array(5).fill("");
        return new Array(5).fill("").map((x, i) => {
          let letter = (word + "*****")[i];
          if (this.state.correct[i] === letter) return "correct";
          if (this.state.present[i].includes(letter)) return "present";
          if (this.state.missing.includes(letter)) return "missing";
          return "";
        });
      }),
    });
  };

  updatePossibleLetters = async () => {
    let stateCopy = this.state;
    for (let wordIndex = 0; wordIndex < this.state.wordPos; wordIndex++) {
      let word = this.state.words[wordIndex];
      let letterCount = {};
      for (let letterIndex = 0; letterIndex < 5; letterIndex++) {
        let letter = word[letterIndex];
        if (!letterCount[letter])
          letterCount[letter] = { count: 0, locations: [], colors: [] };
        letterCount[letter].count++;
        letterCount[letter].locations.push(letterIndex);
        let letterColor = this.state.colors[wordIndex][letterIndex];
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

    this.setState(stateCopy, () => {
      console.log("finished");
      console.log(this.state);
    });
  };

  getSuggestions = () => {
    let wordList = processor.wordList;

    const correctRegex = new RegExp(
      "^" +
        this.state.correct
          .map((letter) => {
            return letter === null ? "[a-z]" : "[" + letter + "]";
          })
          .join("") +
        "$"
    );
    //console.log(correctRegex);
    wordList = wordList.filter((word) => correctRegex.test(word));

    const missingRegex = new RegExp(
      "^" +
        new Array(5)
          .fill("")
          .map((x, i) => {
            return (
              "[^" +
              this.state.missing
                .filter(
                  (x) =>
                    x !== this.state.correct[i] &&
                    !this.state.present.flat().includes(x)
                )
                .join("") +
              "]"
            );
          })
          .join("") +
        "$"
    );
    //console.log(missingRegex);
    if (this.state.missing.length > 0)
      wordList = wordList.filter((word) => missingRegex.test(word));

    //wordList = wordList.filter(word => {word = word.split("").map((letter, i) => letter === this.state.correct[i] ? "*" : letter).join(""); return });
    console.log(wordList);
    this.setState({ placeholder: "hello" });
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
        wordClass:
          currentWord.length === 5
            ? this.setState({ wordIsValid: processor.checkWord(currentWord) })
            : null,
      },
      () => this.updateColors()
    );
  };

  removeLetter = () => {
    if (this.state.words[this.state.wordPos]?.length === 0) return;
    let wordsCopy = this.state.words;
    let currentWord = wordsCopy[this.state.wordPos];
    currentWord = currentWord.slice(0, -1);
    wordsCopy[this.state.wordPos] = currentWord;
    this.setState({ words: wordsCopy, wordIsValid: null }, () =>
      this.updateColors()
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
    await new Promise((resolve) => {
      this.setState({ step: "color" }, () => resolve());
    });
    for (let letterPos = 0; letterPos < 5; letterPos++) {
      if (this.state.colors[this.state.wordPos][letterPos] === "") {
        this.setState({ coloringIndex: this.state.wordPos + ":" + letterPos });
        return;
      }
    }
    this.setState(
      { step: "input", wordPos: this.state.wordPos + 1, coloringIndex: "" },
      () => {
        this.updatePossibleLetters();
        this.getSuggestions();
      }
    );
  };

  handleColorClick = (color) => {
    let colorIndex = this.state.coloringIndex.split(":");

    let colorsCopy = this.state.colors;
    colorsCopy[colorIndex[0]][colorIndex[1]] = color;

    let correctCopy = this.state.correct;
    if (color === "correct") {
      correctCopy[colorIndex[1]] =
        this.state.words[colorIndex[0]][colorIndex[1]];
    }

    let presentCopy = this.state.present;
    if (color === "present") {
      presentCopy[colorIndex[1]].push(
        this.state.words[colorIndex[0]][colorIndex[1]]
      );
    }

    let missingCopy = this.state.missing;
    if (color === "missing") {
      missingCopy.push(this.state.words[colorIndex[0]][colorIndex[1]]);
    }

    this.setState(
      {
        colors: colorsCopy,
        correct: correctCopy,
        present: presentCopy,
        missing: missingCopy,
      },
      () => this.initColoring()
    );
  };

  render = () => {
    return (
      <div className={Style.app}>
        <header>WordleSolver</header>
        <Board
          gameState={this.state}
          handleColorClick={this.handleColorClick}
        />
        <Keyboard gameState={this.state} />
      </div>
    );
  };
}
