import React, { Component } from "react";
import { socket } from "../../client-socket.js";

import Timer from "../modules/Timer.js"
import PlayerList from "../modules/PlayerList.js"
import Showdown from "../modules/Showdown.js"
import GameInput from "../modules/GameInput.js"
import Chat from "../modules/Chat.js"

import "../../utilities.css";
import "./Game.css";

/* Lists joined users
 *
 * Proptypes
 * @param {[string]} attendees
 * @param {string} gameId
 * @param {string} username
 */
class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount(){

    socket.on("asking", (data) => {
      console.log("now asking")
      this.setState({
        stage: "asking",
        time: data.time,
        answerer: data.answerer,
      });
    });

    socket.on("pending", (data) => {
      console.log("now pending")
      this.setState({
        stage: "pending",
        time: data.time,
        role: data.role,
        answerer: data.answerer
      });
    });

    socket.on("answering", (data) => {
      this.setState({
        stage: "answering",
        time: data.time,
        question: data.question,
      });
    });

    socket.on("showdown", (data) => {
      this.setState({
        stage: "showdown",
        answerer: data.answerer,
        question: data.question,
        answer: data.answer,
        asker: data.asker,
      });
    });
  }

  render() {
    let gameScreen;
    if (this.state.stage === "asking"){
      gameScreen = (
        <>
          <Timer time={this.state.time} />
          <PlayerList gameId={this.props.gameId} />
          <GameInput inputType="ask" heading={`ask ${this.state.answerer} a question`} />
          <Chat gameId={this.props.gameId} />
        </>
      );
    } else if (this.state.stage === "pending") {
      gameScreen = (
        <>
          <Timer time={this.state.time} />
          <PlayerList gameId={this.props.gameId} />
          <div className="Game-pending-caption">
            { this.state.role == "answerer" ?
            "people are thinking of what to ask you" :
            `waiting for ${this.state.answerer}`}
          </div>
          <Chat gameId={this.props.gameId} />
        </>
      );
    } else if (this.state.stage === "answering"){
      gameScreen = (
        <>
          <Timer time={this.state.time} />
          <PlayerList gameId={this.props.gameId} />
          <div className="Game-answering-caption">your question:</div>
          <GameInput inputType="answer" heading={this.state.question} gameId={this.props.gameId}/>
          <Chat gameId={this.props.gameId} />
        </>
      );
    } else if (this.state.stage === "showdown"){
      gameScreen = (
        <>
          <Showdown
            answerer={this.state.answerer}
            question={this.state.question}
            answer={this.state.answer}
            asker={this.state.asker}
          />
        </>
      );
    } else {
      return (<div>server is talking about stages of the game I don't recognize. something about {`${this.state.stage}`}</div>)
    }

    return (
      <div className="Game-container">
        {gameScreen}
      </div>
    );
  }
}

export default Game;
