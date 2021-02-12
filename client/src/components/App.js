import React, { Component } from "react";
import { Router } from "@reach/router";
import NotFound from "./pages/NotFound.js";
import Homepage from "./pages/Homepage.js";
import Skeleton from "./pages/Skeleton.js";
import Profile from "./pages/Profile.js";


import "../utilities.css";

import { socket } from "../client-socket.js";

import { get, post } from "../utilities";
import GameRoom from "./pages/GameRoom.js";

/**
 * Define the "App" component as a class.
 */
class App extends Component {
  // makes props available in this component
  constructor(props) {
    super(props);
    this.state = {
      userId: undefined,
    };
  }

  componentDidMount() {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        this.setState({ userId: user._id });
      }
    });
  }

  handleLogin = (res) => {
    console.log(`Logged in as ${res.profileObj.name}`);
    const userToken = res.tokenObj.id_token;
    post("/api/login", { token: userToken }).then((user) => {
      console.log("received", user);
      this.setState({ userId: user._id });
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  handleLogout = () => {
    this.setState({ userId: undefined });
    post("/api/logout");
  };

  render() {
    return (
      <>
        <Router>
          <Homepage
            path="/"
          />
          <Skeleton
            path="/login"
            handleLogin={this.handleLogin}
            handleLogout={this.handleLogout}
            userId={false}
          />
          <Profile path="/profile" />
          <NotFound path="/404" /> 
          <GameRoom path="/:gameId" />
          <NotFound default />
        </Router>
      </>
    );
  }
}

export default App;
