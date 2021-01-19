import React, { Component } from "react";
import { socket } from "../../client-socket.js";

import HomepageInput from "../modules/HomepageInput.js";
import SetupMenu from "../modules/SetupMenu.js";
import AttendeeList from "../modules/AttendeeList.js"

import "../../utilities.css";
import "./Homepage.css";

class Homepage extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = { username: null, attendees: [] };
  }

  openOptions = (username) => {
    this.setState({ username: username });
  }

  notifyCreation = () => {
    this.setState({gameCreated: true});
  }

  componentDidMount() {
    // remember -- api calls go here!
    socket.on("attendees", (attendees) => {
      this.setState({attendees: attendees});
    })
  }

  render() {
    const attendeeList = this.state.gameCreated ? (
      <AttendeeList attendees={this.state.attendees}/>
    ) : (<></>);

    return this.state.username === null ? (
      <>
        <h1>paranoia</h1>
        <HomepageInput defaultText="pick a username" buttonText="create room" onSubmit={this.openOptions}/>
        <a href="/login">login</a>
      </>
    ) : (
      <>
        <h1>paranoia</h1>
        <div className="Homepage-menulist-container">
          <SetupMenu username={this.state.username} onCreate={this.notifyCreation} attendees={this.state.attendees}/>
          {attendeeList}
        </div>
      </>
    );
  }
}

export default Homepage;
