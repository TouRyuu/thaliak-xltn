import React from 'react';
import * as Comp from './components/components'
import UserArea from './components/UserArea'
import './App.css';
import Actions, { AppState } from './components/Actions'

export default class Thaliak extends Actions {

  text = { source: "", target: "" }

  constructor(props:AppState){
    super(props)
    this.state = {
      // App Language State
      // This is in preparation for later expansion
      lang: this.props.lang, /*{
        source: this.props.lang.source,
        target: this.props.lang.target
      } */

      // Keep track of the app's overall state
      // Is the page showing a new prompt?
      isNew: this.props.isNew
    }

    //this.HandleChange = this.HandleChange.bind(this);
    this.HandleClick = this.HandleClick.bind(this);
  }

  componentDidMount(){
    // Get initial data from XIVAPI & store it in this.
    this.text = {
      source: "Source text.",
      target: "Target text."
    }
  }

  render(){
    if(this.state.isNew){
      this.GetText(this.text);
    }

    return(
      <div>
        <Comp.Header />
        <Comp.Container>
          
          <div className="OfficialText">
            <p>{this.text.source}</p>
          </div>

          <UserArea pState={this.state} handleClick={this.HandleClick} />

          <div className="OfficialText">
            {!this.state.isNew &&
              <p>{this.text.target}</p>
            }
          </div>
          
        </Comp.Container>
      </div>
    );
  }

}
