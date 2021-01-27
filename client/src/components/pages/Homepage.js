import React, { Component } from "react";
import { socket } from "../../client-socket.js";

import HomepageInput from "../modules/HomepageInput.js";
import SetupMenu from "../modules/SetupMenu.js";
import AttendeeList from "../modules/AttendeeList.js"
import Header from "../modules/Header.js"

import "../../utilities.css";
import "./Homepage.css";

class Homepage extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = { username: null, attendees: []};
  }

  openOptions = (username) => {
    this.setState({ username: username });
  }

  notifyCreation = () => {
    this.setState({gameCreated: true});
  }

  componentDidMount = () => {
    // remember -- api calls go here!
    socket.on("attendees", (attendees) => {
      this.setState({attendees: attendees});
    })
  }

  componentWillUnmount = () => {
    socket.off("attendees");
  }

  render() {
    const attendeeList = this.state.gameCreated ? (
      <AttendeeList attendees={this.state.attendees}/>
    ) : (<></>);

    return this.state.username === null ? (
      <>
        <Header visible={false} animate={false} />
        <div className="Homepage-container">
          <div className="Homepage-h1-container"><h1 className="centerheader">[redacted]</h1></div>
          <HomepageInput defaultText="type a username" buttonText="create room" onSubmit={this.openOptions}/>
        </div>
      </>
    ) : (
      <>
        <Header visible={true} animate={true} left={false}/>
        <div className="Homepage-container">
          <div className="Homepage-h1-container">
            <h1 className="centerheader animate__animated animate__fadeOut">[redacted]</h1>
            {attendeeList}
          </div>
          <div className="Homepage-menulist-container">
            <SetupMenu username={this.state.username} onCreate={this.notifyCreation} attendees={this.state.attendees}/>
          </div>
        </div>
      </>
    );
  }
}

export default Homepage;
