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
    let change = e.target.value;

    if(direction === "to"){
      this.setState({
        to: change
      });
    } else if (direction === "from"){
      this.setState({
        from: change
      });
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
        let tempDE = response.TextData_de.Dialogue;
        let tempEN = response.TextData_en.Dialogue;
        let tempFR = response.TextData_fr.Dialogue;
        let tempJP = response.TextData_ja.Dialogue;
        
        // get a random DIALOGUE number
        let numDialogue = tempEN.length;
        dialogueID = this.RNG(numDialogue);

        tempDE = tempDE[dialogueID].Text;
        tempEN = tempEN[dialogueID].Text;
        tempFR = tempFR[dialogueID].Text;
        tempJP = tempJP[dialogueID].Text;

        if(/>/.test(tempDE)){
          //console.log("DE string contains >")
          tempDE = this.ReplaceCode(tempDE);
        }
        if(/>/.test(tempEN)){
          //console.log("EN string contains >")
          tempEN = this.ReplaceCode(tempEN);
        }
        if(/>/.test(tempFR)){
          //console.log("FR string contains >")
          tempFR = this.ReplaceCode(tempFR);
        }
        if(/>/.test(tempJP)){
          //console.log("JP string contains >")
          tempJP = this.ReplaceCode(tempJP);
        }

        // assign strings from the dialog number to state
        this.setState({
          text: {
            DE: tempDE,
            EN: tempEN,
            FR: tempFR,
            JP: tempJP
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
    let res = Math.floor(Math.random() * Math.floor(req));
    return res;
  }

  ReplaceCode(toChange:string):string{
    toChange = toChange.replace(/<SoftHyphen\/>/g, "-");
    toChange = toChange.replace(/<Indent\/>/g, "");
    if(/Emphasis/.test(toChange)){
      // For now I'm just removing Emphasis tags
      // In the future I'd like to replace with bold/italic text
      toChange = toChange.replace(/<Emphasis>/g, "");
      toChange = toChange.replace(/<\/Emphasis>/g, "");
    }
    if(/PlayerParameter\(4\)/.test(toChange)){
      toChange = this.Gender(toChange);
    }
    let changed = toChange;
    return changed;
  }

  // This function handles gendered text,
  // as designated in the text by PlayerParameter(4)
  Gender(fix:string):string {

    // get number of times PP4 is used
    let num = (fix.split(/<If\(PlayerParameter\(4\)\)>/g).length -1);
    console.log(`Fixing gendered language display ${num} times... `);
    
    // cycle through the string that many times
    for(let i = 0; i < num; i++){
      fix = fix.replace(/<If\(PlayerParameter\(4\)\)>.*<Else\/>.*<\/If>/, (x)=>{
        x = x.replace(/<If\(PlayerParameter\(4\)\)>/, "(");
        x = x.replace(/<Else\/>/, "/");
        x = x.replace(/<\/If>/, ")");
        return x;
      });
    }

    return fix;
  }
}