import React, { Component } from 'react';

export type AppState = {
    lang:string,
    isNew:Boolean,
    userText?:string,
    input?:string,
    sourceText?:string,
    targetText?:string
  }

export default abstract class Actions extends Component<AppState,AppState> {
    HandleClick(e:React.ChangeEvent<HTMLInputElement>){
        e.preventDefault();
        if(this.state.isNew){
            this.setState({ isNew: false });
        } else {
            this.GetText();
            this.setState({ isNew: true });
        }
    }

  HandleChange(e:React.ChangeEvent<HTMLInputElement>){
    e.preventDefault();
    this.setState({
      userText: e.target.value
    });
  }

  GetText(){
    // Fetch new quest text from XIVAPI
    // FUTURE

    // Put new text in source & target states, and clear userText state
    this.setState({
      sourceText: "New Text",
      targetText: "A wild Target Text appears!",
      userText: ""
    });
  }
}