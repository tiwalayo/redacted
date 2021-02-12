import React, { Component } from "react";
import { socket } from "../../client-socket.js";

import "../../utilities.css";
import "./PlayerList.css";

/* Lists joined users
 *
 * Proptypes
 * @param {[string]} attendees
 *
 */
class PlayerList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      attendees: []
    };
  }

  componentDidMount(){
    socket.on("attendees", (attendees) => {
      this.setState({attendees});
    });
  }

  render() {
    // see https://stackoverflow.com/questions/49362459/vertical-scroll-bar-in-div-which-is-a-child-of-css-grid-column/49362584
    return (
      <div className="PlayerList-container">
        <div className="PlayerList-gridcontainer">
          {this.state.attendees.map((attendee, i) => (
            <div className="PlayerList-attendee" key={i}>{attendee}</div>
          ))}
        </div>
      </div>
    );
  }
}

export default PlayerList;
