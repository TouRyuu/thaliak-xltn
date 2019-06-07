import React, { Component, ChangeEvent, SyntheticEvent } from 'react';
import * as Comp from './components/components'
import './App.css';
import { any } from 'prop-types';

type AppState = {
  lang: string,
  isNew:Boolean,
  userText:string
}

export default class Thaliak extends Component<AppState, AppState> {

  constructor(props:AppState){
    super(props)
    this.state = { 
      lang: this.props.lang,
      isNew: this.props.isNew,
      userText: this.props.userText
    }

    this.handleClick = this.handleClick.bind(this);
  }

  // this value will be flexible later
  //var lang:string = "EN";
  showLangLabel: string = `Show ${this.props.lang}`;

  tbDefault: string = "Type your translation here.";
  sourceText: string = "Official Source Text goes here.";
  targetText: string = "Official Target Text goes here.";

  input: string = "";

  handleClick(){
    this.setState(state => ({
      isNew: !state.isNew
    }));
    if(this.state.isNew){
      this.showRes();
    } else {
      this.reset();
    }
  }

  showRes(){
    this.setState(Object.assign({}, this.state, {
      isNew: false
    }));
    this.targetText = "A wild Target Text appears!"
  }

  reset(){
    this.setState(Object.assign({}, this.state, {
      isNew: true,
      userText: ""
    }));
    // Fetch new quest text from XIVAPI
    // FUTURE

    // Put new text in source text box
    this.sourceText = "New Text";
    // Clear target text box
    this.targetText = "";
  }

  showNew(){
    return (
        <div className="ContentContainer">
          <div className="OfficialText">
            <span>{this.sourceText}</span>
          </div>
  
          <form 
            onSubmit={this.handleClick} 
            className="UserInput">
            <textarea
              className="UserText"
              placeholder={this.tbDefault}
              value={this.input}
              onChange={() => this.setState({ userText: this.input })}>
              {/* User's text goes here */}
            </textarea>
            <input 
              type="submit" 
              className="Button"
              value={this.showLangLabel} />
          </form>
  
          <div className="OfficialText">
            {/* Leave this box empty */}
          </div>
        </div>
    );
  }

  showResult(){
    return(
    <div className="ContentContainer">
      <div className="OfficialText">
        <span>{this.sourceText}</span>
      </div>

      <div className="UserInput">
        <div className="UserText">
          <span>{this.state.userText}</span>
        </div>
        <form onSubmit={this.handleClick}>
          <input 
            type="submit"  
            className="Button"
            value="Next" />
        </form>
      </div>

      <div className="OfficialText">
        <span>{this.targetText}</span>
      </div>
    </div>
  );
}

render(){
  if(!this.state.isNew){
    console.log("State is not new.")
  }
return(
  <div>
    <Comp.Header />
    {this.state.isNew ? this.showNew() : this.showResult()}
  </div>
);
}

}

//export default Thaliak;
