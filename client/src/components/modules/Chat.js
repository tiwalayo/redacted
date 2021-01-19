import React, { Component } from "react";

import "../../utilities.css";
import "./Chat.css";

/* Lists joined users
 *
 * Proptypes
 * @param {string} gameId
 *
 */
class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    // see https://stackoverflow.com/questions/49362459/vertical-scroll-bar-in-div-which-is-a-child-of-css-grid-column/49362584
    return (
      <div className="Chat-container">
        <div className="Chat-gridcontainer">
          [this will be a chat eventually]
        </div>
      </div>
    );
  }
}

export default Chat;
