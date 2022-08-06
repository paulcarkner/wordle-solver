import React from "react";
import Style from "./Board.module.css";
import StateStyle from "./StateColors.module.css";

import BoardTile from "./BoardTile";

export default class Board extends React.Component {
  render = () => {
    let gs = this.props.gameState;
    return (
      <div id="board" className={Style.board}>
        {new Array(6).fill("").map((x, wordIndex) => {
          let word = gs.words[wordIndex];
          let isPlaceholder =
            (word === "" || word === null) && wordIndex === gs.wordPos;
          return new Array(5).fill("").map((y, letterIndex) => {
            return (
              <BoardTile
                className={
                  Style.letter +
                  (gs.wordIsValid === false && wordIndex === gs.wordPos
                    ? " " + Style.invalid
                    : "") +
                  (isPlaceholder ? " " + Style.placeholder : "") +
                  (gs.colors[wordIndex][letterIndex] !== "" ? " " + StateStyle[gs.colors[wordIndex][letterIndex]]: "") +
                  ""
                }
                key={wordIndex + ":" + letterIndex}
                isColoring={
                  gs.coloringIndex === wordIndex + ":" + letterIndex
                }
                handleColorClick={this.props.handleColorClick}
              >
                {isPlaceholder
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
