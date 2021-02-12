import React, { Component } from "react";
import { socket } from "../../client-socket.js";

import "../../utilities.css";
import "./MainMessage.css";

/* Round showdown
 *
 * Proptypes
 * @param {JSX} content
 */
class MainMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

  }

  componentDidMount(){
  }
    

  render() {
    return (
      <div className="MainMessage-container">
        <div>the question was</div>
        <div className="MainMessage-question">
          {this.props.question}
        </div>
        <div>
          {`(but ${this.props.answerer} failed to answer)`}
        </div>
      </div>
    );
  }
}

export default MainMessage;
