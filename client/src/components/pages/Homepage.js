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
      console.log(attendees);
      this.setState({attendees: attendees.attendees});
      //this.setState({attendees: ["tiwa", "tiwa", "tiwa", "tiwa", "tiwa", "tiwa", "tiwa", "tiwa", "tiwa", "tiwa", "tiwa", "tiwa", "tiwa", "tiwa", "tiwa", ]});
    });
    
  }

  componentWillUnmount = () => {
    socket.off("attendees");
  }

  render() {
    if (this.props.location.state && this.props.location.state.inactive === true){
      return (<div className="Game-loading"><div>you already have a Redacted tab open.</div><div>close this one!</div></div>)
    }

    const attendeeList = this.state.gameCreated ? (
      <AttendeeList attendees={this.state.attendees}/>
    ) : (<></>);

    return this.state.username === null ? (
      <>
        <Header visible={false} animate={false} left={false} />
        <div className="Homepage-container">
          <div id="centerheader" className="Homepage-h1-container"><h1 className="centerheader">[redacted]</h1></div>
          <HomepageInput defaultText="type a username" buttonText="create room" onSubmit={this.openOptions}/>
        </div>
      </>
    ) : (
      <>
        <Header visible={true} animate={true} left={false}/>
        <div className="Homepage-container">
          <div id="centerheader" className="Homepage-h1-container shrunk">
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
