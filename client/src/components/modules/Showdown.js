import React, { Component } from "react";
import { socket } from "../../client-socket.js";

import "../../utilities.css";
import "./Showdown.css";

/* Round showdown
 *
 * Proptypes
 * @param {string} gameId
 * @param {bool} hasToken
                    answerer={this.state.answerer}
                    question={this.state.question}
                    answer={this.state.answer}
                    asker={this.state.asker}
 *
 */
class Showdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false
    };

    this.questionRef = React.createRef();
    this.askerRef = React.createRef();
    this.answerRef = React.createRef();
  }

  tokenUse = () => {
    socket.emit("tokenUse", {gameId: this.props.gameId});
    this.setState({
      disabled: true,
      revealButton: false
    });
  }

  componentDidMount(){
    setTimeout(() => {
      this.answerRef.current.textContent = this.props.answer;
    }, 500);

    setTimeout(() => {
      this.questionRef.current.textContent = this.props.question;
      this.askerRef.current.textContent = this.props.asker == null ? " " : `(asked by ${this.props.asker})`;
      this.setState({
        revealButton: true
      })
    }, 3500);

    socket.on("tokenReveal", (data) => {
      console.log("reveal triggered!");
      //console.log(document.getElementById("Showdown-question").innerHTML);
      document.getElementById("Showdown-question").innerHTML = data.question;
      document.getElementById("Showdown-asker").innerHTML = data.asker == null ? " " : `(asked by ${data.asker})`;

    });
  }
    

  render() {
    return (
      <div className="Showdown-container">
        <div className="Showdown-answerer">
          {`${this.props.answerer} answered:`}
        </div>
        <div className="Showdown-answer" ref={this.answerRef}>
          &nbsp;
        </div>
        <div className="Showdown-question-caption" >the question was</div>
        <div id="Showdown-question" className={`Showdown-question ${this.props.question === "[REDACTED]" ? "redacted" : ""}`} ref={this.questionRef}>
          &nbsp;
        </div>
        <div id="Showdown-asker" className="Showdown-asker" ref={this.askerRef}>
          &nbsp;
        </div>
        {
          this.state.revealButton ?
            this.props.question === "[REDACTED]" && this.props.hasToken ?
              <div className="Showdown-token-button" onClick={this.tokenUse} disabled={this.state.disabled}>reveal question</div>
            :
              ""
          :
            ""
        }
      </div>
    );
  }
}

export default Showdown;
