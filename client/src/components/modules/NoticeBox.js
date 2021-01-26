import React, { Component } from "react";

import "../../utilities.css";
import "./NoticeBox.css";


/* Notice popup
 *
 * Proptypes
 * @param {string} message
 * @param {string} color (only "red" and "blue" supported)
 */
class NoticeBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div className={`NoticeBox-container ${this.props.color} animate__animated animate__fadeOutUp animate__delay-1s`}
        onClick={ (e) => {e.target.parentNode.removeChild(e.target);} }>
        <div className="NoticeBox-header">
          [NOTICE]
        </div>
        <div className={`NoticeBox-message`}>
          {this.props.message}
        </div>
      </div>
    );
  }
}

export default NoticeBox;

