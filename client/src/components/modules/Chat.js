import React, { Component } from "react";
import { socket } from "../../client-socket.js";

import "../../utilities.css";
import "./Chat.css";

/* Game chat
 *
 * Proptypes
 * @param {string} gameId
 * @param {string} username
 * @param {function} onSubmit (optional)
 */
class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      value: ""
    };
  }

  handleChange = (event) => {
    this.setState({
      value: event.target.value,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if (/\S/.test(this.state.value)){ // if string isn't empty
      this.props.onSubmit && this.props.onSubmit(this.state.value);

      console.log(this.state.value);
      socket.emit("message", {
        username: this.props.username,
        gameId: this.props.gameId,
        message: this.state.value
      })
      this.setState({value: ""});
    }
  };

  _handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.handleSubmit(event);
    }
  }

  componentDidMount = () => {
    socket.on("messageUpdate", (data) => {
      this.setState((state) => {
        return state.messages.push(data);
      });
    });
  }
  
  render() {
    return (
      <div className="Chat-container">
        <div className="Chat-gridcontainer">
          {
            this.state.messages.map((msg) => (
              <div className="Chat-message"><b>{`${msg.username}: `}</b> {`${msg.message}`}</div>
            ))
          }
        </div>
        <div className="Chat-send">
          <input
            className="Chat-send-input"
            placeholder="Aa"
            value={this.state.value}
            onChange={this.handleChange}
            onKeyDown={this._handleKeyDown}
          /> 
        </div>
      </div>
    );
  }
}

export default Chat;
