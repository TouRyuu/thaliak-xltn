import React, { Component } from 'react';
import { AppState } from './types';

const XIVAPI = require('xivapi-js');
const xiv = new XIVAPI();

export default abstract class Actions extends Component<AppState,AppState> {

  HandleClick(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(this.state.isNew){
      // button click while NEW changes state to NOT NEW
      this.setState({ isNew: false });
    } else {
      // button click while NOT NEW changes state to new
      // also change haveText to false to allow retrieving new text
      this.setState({ isNew: true, haveText: false });
    }
  }

  ChangeLang(e:React.FormEvent<HTMLSelectElement>,direction:string){
    e.preventDefault();
    console.log("Change Language");
    console.log("Change value: ",e.currentTarget.value)
    let change = e.currentTarget.value;

    if(direction === "to"){
      this.setState({
        tLang: change
      });
      console.log("To ",change)
    } else if (direction === "from"){
      this.setState({
        sLang: change
      });
      console.log("From ",change)
    } else {
      console.error("Error: Language direction not found.")
    }
  }

  Init() {
    // call the API to retrieve a list from the "Quest" content
    xiv.data.list("Quest").then((response:any) => {
      // set the state to have the correct number of pages
      // this will allow the render to call GetText()
      this.setState({
        pages:parseInt(response.Pagination.PageTotal)
      });
    }).catch((error:Error) => {
        console.error("Error in Init(): ", error);
    })
  }

  GetText(){
    // Fetch new quest text from XIVAPI
    let page:number = -1;
    let item:number = -1;
    let dialogueID:number = -1;
    let name = "";
    
    // get a random PAGE number
    if(this.state.pages !== undefined){
      page = this.RNG(this.state.pages);
    }
    
    // Ask the API for the random PAGE's list
    xiv.data.list(`Quest?page=${page}`).then((response:any) => {
      do {
        // get a random ITEM number based on how many results are on the page
        item = this.RNG(response.Pagination.Results);
        
        // check the name value from the list to remove invalid possibilities
        name = response.Results[item].Name;
        if(name === "Testdfghjkl;"){
          name = "";
        }
      }while(name === "")

      // once the name value is OK, update `item` to store the ID
      item = response.Results[item].ID;

      // use the item ID to get details about that Quest
      xiv.data.get("Quest",item).then((response:any) => {
        let source:any;
        let target:any;
        // set source
        switch (this.state.sLang){
          case "EN":
            source = response.TextData_en.Dialogue;
            break;
          case "JP":
            source = response.TextData_ja.Dialogue;
            break;
          default:
            console.error("Error setting source language: language not found");
        }
        switch (this.state.tLang){
          case "EN":
            target = response.TextData_en.Dialogue;
            break;
          case "JP":
            target = response.TextData_ja.Dialogue;
            break;
          default:
            console.error("Error setting target language: language not found");
        }

        // get a random DIALOGUE number
        dialogueID = this.RNG(source.length);
        
        // assign strings from the dialog number to state
        this.setState({
          source: source[dialogueID].Text,
          target: target[dialogueID].Text,
          haveText: true
        });
        
      // close out individual quest retrieval
      }).catch((error:Error) => {
        console.error(`Error in getting item ${item}: `, error)
      })
    // close out the list retrieval
    }).catch((error:Error) => {
      console.error(`Error in getting page ${page}: `, error);
    })
  }

  RNG(req:number):number{
    return Math.floor(Math.random() * Math.floor(req));
  }
}