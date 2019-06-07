import React, { Component } from 'react';
import * as Comp from './components/components'
import './App.css';

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
  }

  // this value will be flexible later
  //var lang:string = "EN";
  showLangLabel: string = `Show\n${this.props.lang}`;

  tbDefault: string = "Type your translation here.";
  sourceText: string = "Official Source Text goes here.";
  targetText: string = "Official Target Text goes here.";

  input: string = "";

  componentDidMount(){
    
  }

  showRes(){
    this.setState({
      isNew: false
    });
    this.targetText = "A wild Target Text appears!"
  }

  reset(){
    this.setState({
      isNew: true
    });
    // Fetch new quest text from XIVAPI
    // FUTURE

    // Clear text boxes
    this.sourceText = "New Text";
    this.setState({
      userText: ""
    })
    this.targetText = "";
  }

  showNew(){
    return (
        <div className="ContentContainer">
          <div className="OfficialText">
            <span>{this.sourceText}</span>
          </div>
  
          <form 
            onSubmit={() => this.showRes} 
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
        <form onSubmit={() => this.reset}>
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
return(
  <div>
    <Comp.Header />
    {this.state.isNew ? this.showNew() : this.showResult()}
  </div>
);
}

}

//export default Thaliak;
