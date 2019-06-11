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
      // Keep track of the app's overall state
      // Is the page showing a new prompt?
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
    let text:Languages = {JP:"",EN:""};
    if(this.state.text !== undefined){
      text = this.state.text;
    }

    return(
      <div>
        <Comp.Header />

        <Comp.Container>

        <label>Translate from:
          <select onChange={(e) => this.ChangeLang(e,"from")}>
            <option value="EN">English</option>
            <option value="JP">Japanese</option>
          </select>
        </label>
        <label>to:
          <select onChange={(e) => this.ChangeLang(e,"to")}>
              <option value="JP">Japanese</option>
              <option value="EN">English</option>
          </select>
        </label>
          
          <div className="OfficialText">
            {this.state.haveText &&
              <p>{text.JP}</p>
            }
          </div>

          <UserArea pState={this.state} handleClick={this.HandleClick} />

          <div className="OfficialText">
            {!this.state.isNew &&
              <p>{text.EN}</p>
            }
          </div>
          
        </Comp.Container>
      </div>
    );
  }

}
