import React, { Component } from "react";

import "../../utilities.css";
import "./AttendeeList.css";

/* Lists joined users
 *
 * Proptypes
 * @param {[string]} attendees
 *
 */
class AttendeeList extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    // see https://stackoverflow.com/questions/49362459/vertical-scroll-bar-in-div-which-is-a-child-of-css-grid-column/49362584
    return (
      <div className="AttendeeList-container">
        <div className="AttendeeList-gridcontainer">
          {this.props.attendees.map((attendee) => {
            <div class="AttendeeList-attendee">{attendee.name}</div>
          })}
        </div>
      </div>
    );
  }
}

export default AttendeeList;
