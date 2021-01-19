import React, { Component } from "react";
import { get } from "../../utilities.js"
import ReactWordcloud from 'react-wordcloud';

import "../../utilities.css";
import "./Profile.css";
``
//TODO: REPLACE WITH YOUR OWN CLIENT_ID
// const GOOGLE_CLIENT_ID = "362570506291-po5sau3627iksge076613pputcqtiao7.apps.googleusercontent.com";

class Profile extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {
      words: []
    };
  }

  getOccurrences = (arr) => {
    var occurrences = { };
    for (var i = 0, j = arr.length; i < j; i++) {
      occurrences[arr[i]] = (occurrences[arr[i]] || 0) + 1;
    }
    console.log('o', occurrences)
    return occurrences;
  }

  wordsToCloudObj = (arr) => {
    let occs = this.getOccurrences(arr);
    let x = [];
    let ok = Object.keys(occs);
    for (var i = 0, j = Object.keys(occs).length; i < j; i++) {
      let u = {};
      u.text = ok[i];
      u.value = occs[ok[i]]+20;
      x.push(u)
    }
    return x;
  }

  componentDidMount() {
    get('/api/retrieve').then((resp) => {
      console.log(resp)
      if (resp.library.length > 0){
        let w = this.wordsToCloudObj(resp.library);
        console.log(w)
        w = (<ReactWordcloud words={w}/>);
        this.setState({words: w});
      }
      else{
        this.setState({words: null})
      }
    });
  }

  render() {
    console.log("state:", this.state.words)
    return (
      <>
        <div className="Profile-container">
          <div className="Profile-header-container">
            <h3>your question-asking wordcloud</h3>
            <p className="Profile-header-caption">don't worry, only you can see this page.</p>
          </div>
          <div className="Profile-wordcloud-container">
            {this.state.words === null ? "you don't have profile data. have you logged in with Google and played a game?" : this.state.words}
          </div>
        </div>
      </>
    );
  }
}

export default Profile;
