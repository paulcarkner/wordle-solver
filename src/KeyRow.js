import React from "react";
import Style from "./KeyRow.module.css";
import StateStyle from "./StateColors.module.css";

class KeyRow extends React.Component {
  keyHandler = (key) => {
    //console.log(key);
    window.dispatchEvent(
      new KeyboardEvent("keyup", {
        key: key,
      })
    );
  };

  render() {
    return (
      <div className={Style.keyRow}>
        {this.props.prepend ? (
          <div
            className={Style.key + " " + Style.funcKey}
            onClick={() =>
              window.dispatchEvent(
                new KeyboardEvent("keyup", {
                  keyCode: 13,
                })
              )
            }
          >
            ENTER
          </div>
        ) : null}
        {this.props.keys.split("").map((k, index) => (
          <div
            key={index}
            className={
              Style.key +
              (this.props.gameState.possibleLetters.includes(k)
                ? " " + StateStyle.correct
                : this.props.gameState.possibleLetters.join("").indexOf(k) === -1
                ? " " + StateStyle.missing
                : this.props.gameState.words.join("").indexOf(k) !== -1
                ? " " + StateStyle.present
                : "")
            }
            onClick={() => this.keyHandler(k)}
          >
            {k}
          </div>
        ))}
        {this.props.append ? (
          <div
            className={Style.key + " " + Style.funcKey}
            onClick={() =>
              window.dispatchEvent(
                new KeyboardEvent("keyup", {
                  keyCode: 8,
                })
              )
            }
          >
            <span className="material-symbols-outlined">backspace</span>
          </div>
        ) : null}
      </div>
    );
  }
}

export default KeyRow;
