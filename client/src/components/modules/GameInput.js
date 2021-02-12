import React, { Component } from "react";
import { socket } from "../../client-socket.js";
import { post } from "../../utilities.js"

import "../../utilities.css";
import "./GameInput.css";

/* Game q&a input
 *
 * Proptypes
 * @param {string} inputType
 * @param {string} heading 
 * @param {string} gameId
 * @param {string} username
 */
class GameInput extends Component {

  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {value: ""};
  }

  handleChange = (event) => {
    this.setState({
      value: event.target.value,
    });
  };

/*  handleSubmit = (event) => {
    event.preventDefault();
    if (/\S/.test(this.state.value)){ // if string isn't empty
      this.props.onSubmit && this.props.onSubmit(this.state.value);
    }
  };*/

  _handleKeyDown = (e) => {
    console.log(this.state.value, this.props.inputType)
    if (e.key === 'Enter' && (/\S/.test(this.state.value))) {
      if (this.props.inputType == "ask"){
        socket.emit("questionSubmit", {
          gameId: this.props.gameId,
          question: this.state.value,
          asker: this.props.username
        })

        post("/api/document", {question: this.state.value}).then(() => {});
      }
      if (this.props.inputType == "answer"){
        socket.emit("answerSubmit", {
          gameId: this.props.gameId,
          answer: this.state.value
        })
      }
    }
  }

  componentDidMount(){
  }


  render() {
    return (
      <div className="GameInput-container">
        <div className="GameInput-heading">
          {this.props.heading}
        </div>
        <input
          type="text"
          placeholder={`${this.props.inputType} here`}
          value={this.state.value}
          onChange={this.handleChange}
          className="GameInput-input"
          onKeyDown={this._handleKeyDown}
        />
      </div>
    );
  }
}

export default GameInput;
