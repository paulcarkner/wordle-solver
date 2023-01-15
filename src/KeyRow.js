import React from "react";
import Style from "./KeyRow.module.css";
import StateStyle from "./StateColors.module.css";

class KeyRow extends React.Component {
  keyHandler = (key) => {
    //use keypress events to lift letter click to app
    window.dispatchEvent(
      new KeyboardEvent("keyup", {
        key: key,
      })
    );
  };

  render() {
    return (
      <div className={Style.keyRow}>
        {this.props.prepend ? ( //add prepended ENTER keys
          <div
            className={Style.key + " " + Style.funcKey} //style as function key
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
        {this.props.keys.split("").map((k, index) => ( //add each letter to row
          <div
            key={index}
            className={
              Style.key +
              (this.props.gameState.possibleLetters.includes(k)
                ? " " + StateStyle.correct //if letter is known to correct
                : this.props.gameState.possibleLetters.join("").indexOf(k) ===
                  -1
                ? " " + StateStyle.missing //if letter is known to be missing
                : this.props.gameState.words.join("").indexOf(k) !== -1
                ? " " + StateStyle.present //if letter is known to be present
                : "")
            }
            onClick={() => this.keyHandler(k)}
          >
            {k}
          </div>
        ))}
        {this.props.append ? ( //add appended DEL keys
          <div
            className={Style.key + " " + Style.funcKey} //style as function key
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
