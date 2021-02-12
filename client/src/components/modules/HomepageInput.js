import React, { Component } from "react";

import "../../utilities.css";
import "./HomepageInput.css";

/* Username input on homepage
 *
 * Proptypes
 * @param {string} defaultText
 * @param {string} buttonText
 * @param {function} onSubmit
 */
class HomepageInput extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {value: ""};
    this.inputRef = React.createRef();
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
    }
  };

  _handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.handleSubmit(event);
    }
  }

  componentDidMount(){
    this.inputRef.current.focus();
  }

  render() {
    return (
      <>
        <input
          type="text"
          placeholder={this.props.defaultText}
          value={this.state.value}
          onChange={this.handleChange}
          onKeyDown={this._handleKeyDown}
          className="HomepageInput-input"
          ref={this.inputRef}
        />
        <button
          type="submit"
          className="HomepageInput-button"
          value="create room"
          onClick={this.handleSubmit}
        >
          {this.props.buttonText}
        </button>
      </>
    );
  }
}

export default HomepageInput;
