import React from "react";
import Style from "./Keyboard.module.css";

import KeyRow from "./KeyRow";

class Keyboard extends React.Component {
  render() {
    return (
      <div className={Style.keyboard}>
        <KeyRow keys="qwertyuiop" gameState={this.props.gameState} />
        <KeyRow keys="asdfghjkl" gameState={this.props.gameState} />
        <KeyRow
          prepend="enter"
          append="del"
          keys="zxcvbnm"
          gameState={this.props.gameState}
        />
      </div>
    );
  }
}

export default Keyboard;
