import React from 'react';
import * as Comp from './components/components'
import UserArea from './components/UserArea'
import './App.css';
import Actions from './lib/Actions'
import { AppState, Languages } from './lib/types'

export default class Thaliak extends Actions {
  constructor(props:AppState){
    super(props)
    this.state = {
      isNew: this.props.isNew,
      haveText: false,
      pages: -1,
      from: this.props.from,
      to: this.props.to
    }
    
    this.HandleClick = this.HandleClick.bind(this);
  }

  componentDidMount(){
    this.Init();
  }

  render(){
    if(this.state.pages !== undefined){
      if((this.state.pages > 0) && 
          this.state.isNew && 
          !this.state.haveText){
        this.GetText();
      }
    }
    let text:Languages = { DE: "", EN: "", FR: "", JP: ""};
    let source:string = "";
    let target:string = "";
    if(this.state.text !== undefined){
      text = this.state.text;
    }
    if(this.state.to === "EN"){
      target = text["EN"];
    } else if(this.state.to === "JP"){
      target = text["JP"];
    } else if(this.state.to === "FR"){
      target = text["FR"];
    } else if(this.state.to === "DE"){
      target = text["DE"];
    }
    if(this.state.from === "EN"){
      source = text["EN"];
    } else if(this.state.from === "JP") {
      source = text["JP"];
    } else if(this.state.from === "FR") {
      source = text["FR"];
    } else if(this.state.from === "DE") {
      source = text["DE"];
    }

    return(
      <div>
        <Comp.Header />

        <Comp.Container>

        <label>Translate
          <select value={this.state.from} onChange={(e) => this.ChangeLang(e,"from")}>
            <option value="DE">deutsche</option>
            <option value="EN">English</option>
            <option value="FR">Française</option>
            <option value="JP">日本語</option>
          </select>
        </label>
        <label>->
          <select value={this.state.to} onChange={(e) => this.ChangeLang(e,"to")}>
            <option value="DE">deutsche</option>
            <option value="JP">日本語</option>
            <option value="FR">Française</option>
            <option value="EN">English</option>
          </select>
        </label>
          
          <div className="OfficialText">
            {this.state.haveText &&
              <p>{source}</p>
            }
          </div>

          <UserArea pState={this.state} handleClick={this.HandleClick} />

          <div className="OfficialText">
            {!this.state.isNew &&
              <p>{target}</p>
            }
          </div>
          
        </Comp.Container>
      </div>
    );
  }

}
