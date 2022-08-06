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
              (this.props.gameState.correct.includes(k)
                ? " " + StateStyle.correct
                : this.props.gameState.present.flat().includes(k)
                ? " " + StateStyle.present
                : this.props.gameState.missing.includes(k)
                ? " " + StateStyle.missing
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
