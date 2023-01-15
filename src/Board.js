import React from "react";
import Style from "./Board.module.css";
import StateStyle from "./StateColors.module.css";

import BoardTile from "./BoardTile";

export default class Board extends React.Component {
  render = () => {
    const gs = this.props.gameState;
    return (
      <div id="board" className={Style.board}>
        {new Array(6).fill("").map((x, wordIndex) => { //create 6 word rows
          const word = gs.words[wordIndex];
          const isPlaceholder =
            (word === "" || word === null) && wordIndex === gs.wordPos;
          return new Array(5).fill("").map((y, letterIndex) => { //create 5 tiles in each row
            return (
              <BoardTile
                className={
                  Style.letter +
                  (gs.wordIsValid === false && wordIndex === gs.wordPos //style if word is invalid
                    ? " " + Style.invalid
                    : "") +
                  (isPlaceholder ? " " + Style.placeholder : "") + //style if word is suggestion
                  (gs.colors[wordIndex][letterIndex] !== "" //style if letter is coloured
                    ? " " + StateStyle[gs.colors[wordIndex][letterIndex]]
                    : "") +
                  ""
                }
                key={wordIndex + ":" + letterIndex}
                dataKey={wordIndex + ":" + letterIndex}
                isColoring={gs.coloringIndex === wordIndex + ":" + letterIndex}
                handleColorClick={this.props.handleColorClick}
                handleTileClick={this.props.handleTileClick}
              >
                {isPlaceholder //get letter from either suggested word or entered word
                  ? gs.placeholder[letterIndex]
                  : (word ?? "")[letterIndex]}
              </BoardTile>
            );
          });
        })}
      </div>
    );
  };
}
