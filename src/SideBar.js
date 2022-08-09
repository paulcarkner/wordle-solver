import React from "react";
import Style from "./SideBar.module.css";

export default class SideBar extends React.Component {
    render = () => {
        return <div className={Style.sideBar}>
            <div className={Style.title}>Possible Words</div>{this.props.words.map((word, i) => <div key={i}>{word.word + " : " + word.count}</div>)}</div>;
    }
}