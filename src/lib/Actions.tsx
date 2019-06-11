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

  ChangeLang(e:React.ChangeEvent<HTMLSelectElement>,direction:string){
    e.preventDefault();
    console.log("Change Language");
    let change = e.target.value;

    if(direction === "to"){
      this.setState({
        to: change
      });
      console.log("To ",change)
    } else if (direction === "from"){
      this.setState({
        from: change
      });
      console.log("From ",change)
    } else {
      // This should never fire since I have it hardcoded.
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
        // get a random DIALOGUE number
        dialogueID = this.RNG((response.TextData_en).length);

        console.log("TEST: ", response.TextData_en.Dialogue[dialogueID].Text)

        let temp = {
          //DE: response.TextData_de.Dialogue[dialogueID],
          EN: response.TextData_en.Dialogue[dialogueID],
          //FR: response.TextData_fr.Dialogue[dialogueID],
          JP: response.TextData_ja.Dialogue[dialogueID]
        }
        
        // assign strings from the dialog number to state
        this.setState({
          text: {
            //DE: temp.DE.Dialogue[dialogueID].Text,
            EN: temp.EN.Text,
            //FR: temp.FR.Dialogue[dialogueID].Text,
            JP: temp.JP.Text
          },
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