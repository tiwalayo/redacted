import React, { Component } from "react";

import "./Header.css";

class Header extends Component {
  constructor(props) {
    /* Proptypes
     * @param {bool} visible
     * @param {bool} animate
     * @param {bool} left
     */
    super(props);
    // Initialize Default State
    this.state = {visible: true, animate: false};

    if ('visible' in this.props){
      this.state.visible = this.props.visible;
    }

    if ('animate' in this.props){ 
      this.state.animate = this.props.animate;
    }
  }

  componentDidMount = () => {
  }

  shouldComponentUpdate = (nextProps) => {
    return nextProps.visible !== this.state.visible || nextProps.animate !== this.state.animate || nextProps.left !== this.state.left;

  }

  componentDidUpdate = () => {
    this.setState({visible: this.props.visible, animate: this.props.animate, left: this.props.left});
  }

  render() {
    return <h1 className={`Header-header ${this.state.left ? "left" : "noleft"} ${this.state.visible ? "" : "invisible"} ${
      this.state.animate ? "animate__animated animate__fadeIn" : ""
    }`}><a href="/">[redacted]</a></h1>
  }
}

export default Header;
