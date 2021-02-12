import React, { Component } from "react";
import { post } from "../../utilities.js";
import { navigate } from "@reach/router"

import "../../utilities.css";
import "./SetupMenu.css";

/* Options input on homepage
 *
 * Proptypes
 * @param {string} username
 * @param {function} onCreate
 * @param {[string]} attendees
 */
class SetupMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      'SetupMenu-factor': "50",
      'SetupMenu-qTime': "35",
      'SetupMenu-aTime': "30",
      'SetupMenu-maxrounds': "4"
    };

    this.hintText = React.createRef();
  }

  handleCheck = () => {
    this.setState((prevstate) => {
      return {checked: !prevstate.checked}
    });
  }

  handleChange = (event) => {
    this.setState({[event.target.id] : event.target.value});  
  }
  
  handleSubmit = (event) => {
    event.preventDefault();

    const host = window.location.hostname;

    post("/api/createGame", {
      username: this.props.username
    }).then((res) => {
      this.setState({
       gameId: res.newId,
       gameLink: `${host}/${res.newId}`
      }, () => {
        console.log("made it to pre-oncreate")
        this.props.onCreate();
      });
    });
  }

  startGame = (event) => {
    if (this.props.attendees.length > 1){
      event.preventDefault();

      post("/api/startGame", {
        reveal: this.state.checked,
        factor: this.state["SetupMenu-factor"],
        qTime: this.state["SetupMenu-qTime"],
        aTime: this.state["SetupMenu-aTime"],
        maxrounds: Math.min(Math.max(this.state["SetupMenu-maxrounds"], 1), 10),
        gameId: this.state.gameId,
        username: this.props.username
      }).then(() => {
        navigate(`/${this.state.gameId}`, { state: { username: this.props.username } });
      });

    }
  }

  copyLink = (event) => {
    navigator.clipboard.writeText(event.target.textContent);
    this.hintText.current.textContent = 'copied!';
  }

  componentDidMount(){
  }


  render() {
    return ( <>
      <div className="SetupMenu-container">
        <form onSubmit={this.handleSubmit}>
          <div className="SetupMenu-entry">
            <label htmlFor="reveal">Reveal asker?</label>
            <input type="checkbox" id="SetupMenu-reveal" name="reveal" onChange={this.handleCheck} checked={this.state.checked} />
            <input className="noslider" type="range" />
          </div>
          <div className="SetupMenu-entry">
            <label htmlFor="factor">Paranoia factor <span className="info" data-tooltip="the higher the factor, the more often questions get redacted.">[?]</span></label>
            <input type="range" id="SetupMenu-factor" name="factor" min="0" max="100" value={this.state["SetupMenu-factor"]} onChange={this.handleChange} />
            <div className="SetupMenu-entry-caption invisible">
              {`${this.state["SetupMenu-factor"]}s`}
            </div>
          </div>
          <div className="SetupMenu-entry">
            <label htmlFor="qTime">Time to ask</label>
            <input type="range" id="SetupMenu-qTime" name="qTime" min="15" max="60" value={this.state["SetupMenu-qTime"]} onChange={this.handleChange} />
            <div className="SetupMenu-entry-caption">
              {`${this.state["SetupMenu-qTime"]}s`}
            </div>
          </div>
          <div className="SetupMenu-entry">
            <label htmlFor="aTime">Time to answer</label>
            <input type="range" id="SetupMenu-aTime" name="aTime" min="15" max="60" value={this.state["SetupMenu-aTime"]} onChange={this.handleChange} />
            <div className="SetupMenu-entry-caption">
              {`${this.state["SetupMenu-aTime"]}s`}
            </div>
          </div>
          <div className="SetupMenu-entry">
            <label htmlFor="maxrounds">Number of rounds</label>
            <input type="range" id="SetupMenu-maxrounds" name="maxrounds" min="1" max="10" value={this.state["SetupMenu-maxrounds"]} onChange={this.handleChange} />
            <div className="SetupMenu-entry-caption">
              {`${this.state["SetupMenu-maxrounds"]}`}
            </div>
          </div>
          <div className="SetupMenu-submit">
            { !this.state.gameId ?
                (<button className="SetupMenu-create-button" type="submit">create game</button>) :
                (
                  <>
                    <div className="SetupMenu-gamelink" onClick={this.copyLink}>{this.state.gameLink}</div>
                    <div className="SetupMenu-gamelink-caption" ref={this.hintText}>click game link to copy</div>
                  </>
                )
            }
          </div>
        </form>
      </div>
      {!this.state.gameId ? "" : (<button type="button" className={`SetupMenu-submit-button ${this.props.attendees.length < 2 ? "notready" : ""}`} onClick={this.startGame}>start game</button>)}
    </>);
  }
}

export default SetupMenu;
