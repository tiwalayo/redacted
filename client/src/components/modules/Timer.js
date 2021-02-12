import React, { Component } from "react";

import "../../utilities.css";
import "./Timer.css";

/* Game timer
 *
 * Proptypes
 * @param {int} time
 */
class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: this.props.time
    };
  }

  startTimer = (duration) => {
    let timer = duration
    var s = setInterval(() => {
      this.setState({time: timer})
        if (--timer < 0) {
            clearInterval(s);
        }
    }, 1000);
}

  componentDidMount(){
    this.startTimer(this.props.time)
  }


  render() {
    return (
      <div className="Timer-container">
        <div className="Timer-value">{this.state.time}</div>
      </div>
    );
  }
}

export default Timer;
