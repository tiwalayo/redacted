import React, { Component } from "react";

import "./Header.css";

class Header extends Component {
  constructor(props) {
    /* Proptypes
     * @param {bool} visible (optional, default true)
     * @param {bool} animate (optional, default false)
     */
    super(props);
    // Initialize Default State
    this.state = {visible: true, animate: false};
  }

  componentDidMount = () => {

    if ('visible' in this.props){
      this.setState({visible: this.props.visible})
    }

    if ('animate' in this.props){ 
      this.setState({animate: this.props.animate})
    }

  }

  shouldComponentUpdate = (nextProps) => {
    return nextProps.visible !== this.state.visible || nextProps.animate !== this.state.animate;
  }

  componentDidUpdate = () => {
    this.setState({visible: this.props.visible, animate: this.props.animate});
  }

  render() {
    return <h1 className={`Header-header ${this.state.visible ? "" : "invisible"} ${
      this.state.animate ? "animate__animated animate__fadeIn" : ""
    }`}>paranoia</h1>
  }
}

export default Header;
