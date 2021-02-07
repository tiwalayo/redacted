import React, { Component } from "react";
import { socket } from "../../client-socket.js";
import { get } from "../../utilities.js";
import { navigate } from "@reach/router";
import ReactDOM from 'react-dom';

import Timer from "../modules/Timer.js"
import PlayerList from "../modules/PlayerList.js"
import Showdown from "../modules/Showdown.js"
import GameInput from "../modules/GameInput.js"
import Chat from "../modules/Chat.js"
import NoticeBox from "../modules/NoticeBox.js"
import MainMessage from "../modules/MainMessage.js"

import "../../utilities.css";
import "./Game.css";

/* Game!
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

  getLag = () => {
    let ROUNDS = 5;
    let delta = 0;
    for (let i=0; i<ROUNDS; i++){
      get("/api/lag", {}).then((resp) => {
        delta += (resp.date - Date.now());
        console.log("[lagcheck] delta now", delta);
      });
    }
    return delta/ROUNDS;
  }

  componentDidMount = () => {

    this.lag = this.getLag();

    socket.on("asking", (data) => {
      this.setState({
        stage: "ask",
        time: parseInt(data.time),
        answerer: data.answerer,
      }, () => { console.log("received ask event; state is", this.state); });
      console.log("received ask event with data", data);
    });

    socket.on("pending", (data) => {
      console.log("now pending")
      this.setState({
        stage: "pending",
        time: parseInt(data.time),
        role: data.role,
        answerer: data.answerer
      });
    });

    socket.on("answering", (data) => {
      this.setState({
        stage: "answer",
        time: parseInt(data.time),
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
        time: 0
      });
    });

    socket.on("mainmessage", (data) => {
      this.setState({
        stage: "mainmessage",
        question: data.question,
        answerer: data.answerer,
        time: 0
      });
    });

    socket.on("notice", (message) => {
      var div = document.createElement('div');
      var divid = Date.now();
      div.setAttribute("id", `p${divid}`);
      ReactDOM.render(
         <NoticeBox container={div} message={message.message} color={message.color} />,
         document.body.appendChild(div)
      );
      setTimeout(() => {
        var elem = document.querySelector(`#p${divid}`);
        elem.parentNode.removeChild(elem);
      }, 10000);

    })

    socket.on("tokenNotify", (data) => {
      this.hasToken = data.hasToken;
      console.log('token status:', this.hasToken);
    });

  }



  render() {
    /*if (!this.state.stage === "asking"){
      return (<div className="Game-loading"><div>loading...</div></div>)
    }*/

    return (
      <>
      <div className="Game-container">
        <Timer time={this.state.time} lag={this.lag || 0} key={Date.now()}/>
        <PlayerList attendees={this.props.attendees} callback={this.props.callback}/>
        {
          this.state.stage === "ask" ?
            <GameInput inputType="ask" heading={`ask ${this.state.answerer} a question`} gameId={this.props.gameId} username={this.props.username}/>
          :
            this.state.stage === "answer" ?
              <GameInput inputType="answer" heading={this.state.question} gameId={this.props.gameId} username={this.props.username}/>
            :
              this.state.stage === "pending" ?
                <div className="Game-pending-caption">
                  <div>
                  { this.state.role == "answerer" ?
                  "people are thinking of what to ask you" :
                  `waiting for ${this.state.answerer} to answer`}
                  </div>
                </div>
              : this.state.stage === "showdown" ?
                  <Showdown
                    gameId={this.props.gameId}
                    answerer={this.state.answerer}
                    question={this.state.question}
                    answer={this.state.answer}
                    asker={this.state.asker}
                    hasToken={this.hasToken}
                  />
                :
                  this.state.stage === "mainmessage" ?
                    <MainMessage question={this.state.question} answerer={this.state.answerer} />
                  :
                    <div className="Game-default"><div>waiting for next round</div></div>
        }
        <Chat gameId={this.props.gameId} username={this.props.username} />
      </div>
      </>
    );
  }
}

export default Game;
