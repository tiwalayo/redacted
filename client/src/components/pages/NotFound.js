import React, { Component } from "react";

import "./NotFound.css";

class NotFound extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div><h1>[REDACTED]</h1><p>whatever you're looking for, we couldn't find it.</p></div>
    );
  }
}

export default NotFound;
