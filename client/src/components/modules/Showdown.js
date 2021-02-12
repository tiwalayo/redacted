import React, { Component } from "react";

import "../../utilities.css";
import "./Showdown.css";

/* Round showdown
 *
 * Proptypes
 * @param {[string]} attendees
 *
 */
class Showdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.questionRef = React.createRef();
    this.askerRef = React.createRef();
    this.answerRef = React.createRef();
  }

  componentDidMount(){
    setTimeout(() => {
      this.answerRef.current.textContent = this.props.answer;
    }, 500);

    setTimeout(() => {
      this.questionRef.current.textContent = this.props.question;
      this.askerRef.current.textContent = this.props.asker == null ? "" : this.props.asker;
    }, 3000);
  }
    

  render() {
    return (
      <div className="Showdown-container">
        <div className="Showdown-answerer">
          {`${this.props.answerer} answered:`}
        </div>
        <div className="Showdown-answer" ref={this.answerRef}>
        </div>
        <div className="Showdown-question-caption" >the question was</div>
        <div className="Showdown-question" ref={this.questionRef}>
        </div>
        <div className="Showdown-asker" ref={this.askerRef}>
        </div>
      </div>
    );
  }
}

export default Showdown;
