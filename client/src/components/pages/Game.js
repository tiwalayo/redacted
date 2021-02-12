import React, { Component } from "react";
import { navigate } from "@reach/router"
import { get } from "../../utilities";

import HomepageInput from "../modules/HomepageInput.js";
import SetupMenu from "../modules/SetupMenu";

import "../../utilities.css";
import "./Game.css";

class Game extends Component {
  /* Main game. 
   *
   * Proptypes
   * @param gameId {string} game id
  */
  constructor(props) {
    super(props);
    this.state = {};
  }

  verifyGame = () => {
    get('/api/verifyGame', {gameId : this.props.gameId }).then((response) => {
      if (response.verified){
        this.setState({verified: true});
      }
      else {
        this.setState({verified: false});
      }
    });
  }

  componentDidMount() {
    // remember -- api calls go here!
    this.verifyGame();
  }

  render() {
  
    return this.state.username === null ? (
      <>
        <h1>paranoia</h1>
        <HomepageInput defaultText="pick a username" onSubmit={this.openOptions}/>
      </>
    ) : (
      <>
        <h1>paranoia</h1>
        <SetupMenu username={this.state.username}/>
      </>
    );
  }
}

export default Homepage;
