import React, { Component } from 'react';

export type AppState = {
    lang:string,/*{
      source:string,
      target:string
    } */
    isNew:Boolean
  }

export default abstract class Actions extends Component<AppState,AppState> {
  
  HandleClick(e:React.FormEvent<HTMLFormElement>){
      e.preventDefault();
      if(this.state.isNew){
          this.setState({ isNew: false });
      } else {
          this.setState({ isNew: true });
      }
  }

/*  HandleChange(e:React.ChangeEvent<HTMLInputElement>){
    e.preventDefault();
    this.setState({
      userText: e.target.value
    });
  }*/

  GetText(text:any){
    // Fetch new quest text from XIVAPI
    // FUTURE

    // Put new text in source & target states, and clear userText state
    text.source = "New Text";
    text.target = "A wild Target Text appears!";

  }
}