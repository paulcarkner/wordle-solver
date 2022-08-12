import React from "react";
import Style from "./SideBar.module.css";

export default class SideBar extends React.Component {
  render = () => {
    return (
      <div className={Style.sideBar}>
        <div className={Style.instructions}>
          <div className={Style.title}>Instructions</div>

          {this.props.step === "input" ? (
            <div>
              <p>Input letters of your guess then press enter.</p>
              <p>Click a tile to change its color.</p>
            </div>
          ) : (
            ""
          )}
          {this.props.step === "color" ? (
            <div>
              <p>Select the color for the tile.</p>
            </div>
          ) : (
            ""
          )}
          {this.props.step === "complete" ? (
            <div>
              <p>Word found. Refresh to start again.</p>
            </div>
          ) : (
            ""
          )}
        </div>
        <div>
          <div className={Style.title}>Possible Words</div>
          {this.props.words.map((word, i) => (
            <div key={i}>{word.word + " : " + word.count}</div>
          ))}
        </div>
      </div>
    );
  };
}
