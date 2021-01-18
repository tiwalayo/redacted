import React, { Component } from "react";
import { socket } from "../../client-socket.js";
import { get, post } from "../../utilities.js"

import AttendeeList from "../modules/AttendeeList.js"
import HomepageInput from "../modules/HomepageInput.js"

import "../../utilities.css";
import "./GameRoom.css";

class GameRoom extends Component {
  /* Holder for games
   *
   * Proptypes
   * @param {string} gameId
   * (optional) @param {Object} options 
   */
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {
      attendees: [],
    };

    if (this.props.options){
      this.setState({
        started: this.props.options.started,
        username: this.props.options.username,
        gameCreator: this.props.options.gameCreator,
        attendees: this.props.options.attendees,
      });
    }
  }

  setName = (value) => {

    get("/api/verify", {gameId: this.props.gameId}).then( (resp) => {
        if (!resp.ok){
          console.log("room doesn't exist");
          // redirect
        }

      post('/api/join', {
          gameId: this.props.gameId,
          username: value,
      }).then((a) => {
        this.setState({
          gameCreator: resp.gameCreator,
          started: resp.started,
          username: value,
          attendees: a.attendees
        });
      })

    });
  }

  componentDidMount() {
    // remember -- api calls go here!
    socket.on("attendees", (attendees) => {
      this.setState({attendees: attendees});
    })

    socket.on("gameStart", () => {
      this.setState({started: true});
    });
  }



  render() {
    const pHeader = (<div className="paranoia-header">paranoia</div>);
    let toShow;

    if (!this.state.username){
      return (
        <div className="GameRoom-username-input">
          <HomepageInput defaultText="pick a username" onSubmit={this.setName}/>
        </div>
      );
    }

    if (this.state.started){
      toShow = (
        <Game gameId={this.props.gameId} username={this.state.username} attendees={this.state.attendees}/>
      )
    } else {
      toShow = (
        <div className="GameRoom-waiting-container">
          <div className="GameRoom-waiting-blurb">{this.state.gameCreator ? `${this.state.gameCreator} is setting up the game...` : ""}</div>
          <AttendeeList attendees={this.state.attendees}/>
        </div>
      )
    } 
    return (
      <>
        {pHeader}
        {toShow}
      </>
    )

  }
}

export default GameRoom;
