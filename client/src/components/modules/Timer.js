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
      time: this.props.time,
    };
    this.on = false;
  }

  startTimer = (duration) => {
    if (duration > 0){
      this.on = true;
      let timer = duration * 1000 + this.props.lag;
      var s = setInterval(() => {
        this.setState({time: Math.round(timer/1000)});
        timer = timer - 500;
          if (timer <= 0) {
            this.on = false;
            clearInterval(s);
          }
      }, 500);
    }
  }

  componentDidMount = () => {
    this.startTimer(this.props.time);
  }
/*
  componentDidUpdate = (prevProps) => {
    if (this.props.i !== prevProps.userID) {
      this.fetchData(this.props.userID);
    }
  }*/

  render() {
    return (
      <div className="Timer-container">
        <div className="Timer-value">{this.state.time}</div>
      </div>
    );
  }
}

export default Timer;
