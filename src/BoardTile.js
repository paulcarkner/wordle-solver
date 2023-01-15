import React from "react";
import Style from "./BoardTile.module.css";

export default class BoardTile extends React.Component {
  handleTileClick = () => {
    this.props.handleTileClick(this.props.dataKey); //if tile is clicked send event with tile index to app
  };

  render() {
    return (
      <div className={this.props.className} onClick={this.handleTileClick}>
        {this.props.children}
        {this.props.isColoring ? ( //if tile is being coloured show options
          <div className={Style.coloringPopup}>
            <button
              className={Style.coloringPopupButton}
              style={{ backgroundColor: "var(--clr-letter-missing)" }}
              onClick={() => this.props.handleColorClick("missing")}
            ></button>
            <button
              className={Style.coloringPopupButton}
              style={{ backgroundColor: "var(--clr-letter-present)" }}
              onClick={() => this.props.handleColorClick("present")}
            ></button>
            <button
              className={Style.coloringPopupButton}
              style={{ backgroundColor: "var(--clr-letter-correct)" }}
              onClick={() => this.props.handleColorClick("correct")}
            ></button>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}
