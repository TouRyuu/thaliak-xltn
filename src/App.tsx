import React from 'react';
import * as Comp from './components/components'
import './App.css';
import Actions, { AppState } from './components/Actions'

export default class Thaliak extends Actions {

  constructor(props:AppState){
    super(props)
    this.state = {
      // App Language State
      // This is in preparation for later expansion
      lang: this.props.lang,

      // Keep track of the app's overall state
      // Is the page showing a new prompt?
      isNew: this.props.isNew
    }
    
    this.HandleChange = this.HandleChange.bind(this);
    this.HandleClick = this.HandleClick.bind(this);
    
  }

  componentDidMount(){
    // Get initial data from XIVAPI & store it in this.state
    this.setState({
      sourceText: "Source Text belongs here.",
      targetText: "A wild Target Text appears!"
    })
  }
/*
  handleClick(e:React.ChangeEvent<HTMLInputElement>){
    e.preventDefault();
    if(this.state.isNew){
      this.setState({ isNew: false });
    } else {
      this.getText();
      this.setState({ isNew: true });
    }
  }

  handleChange(e:React.ChangeEvent<HTMLInputElement>){
    e.preventDefault();
    this.setState({
      userText: e.target.value
    });
  }

  showResult(){
    this.setState({
      isNew: false
    });
  }

  getText(){
    // Fetch new quest text from XIVAPI
    // FUTURE

    // Put new text in source & target states, and clear userText state
    this.setState({
      sourceText: "New Text",
      targetText: "",
      userText: ""
    });
  }
*/
  render(){
    let userProps = {
      isNew: this.state.isNew,
      lang: this.state.lang,
      handleClick: this.HandleClick,
      handleChange: this.HandleChange,
      input: this.state.input,
      userText: this.state.userText,
    }
    return(
      <div>
        <Comp.Header />
        <Comp.Container>
          
          <div className="OfficialText">
            <p>{this.state.sourceText}</p>
          </div>

          <Comp.UserArea userProps={userProps} />

          <div className="OfficialText">
            {!this.state.isNew &&
              <p>{this.state.targetText}</p>
            }
          </div>
          
        </Comp.Container>
      </div>
    );
  }

}
