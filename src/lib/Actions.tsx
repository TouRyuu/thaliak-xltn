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
    
    // get a random PAGE number
    if(this.state.pages !== undefined){
      page = this.RNG(this.state.pages);
      page++;
    }
    
    // Ask the API for the random PAGE's list
    xiv.data.list(`Quest?page=${page}`).then((response:any) => {
      let qIndex:number = -1;
      let name:string;

      do {
        // get a random ITEM number based on how many results are on the page
        qIndex = this.RNG(response.Pagination.Results);
        
        // check the name value from the list to remove invalid possibilities
        name = response.Results[qIndex].Name;
        if(name === "Testdfghjkl;"){
          name = "";
        }
      }while(name === "")

      // once the name value is OK, update `qIndex` to store the Quest's ID
      qIndex = response.Results[qIndex].ID;

      // use the item ID to get details about that Quest
      xiv.data.get("Quest",qIndex).then((response:any) => {
        let OrderID:number = -1;
        let dIndex:number;
        
        do{
          // get a random DIALOGUE index number
          dIndex = this.RNG((response.TextData.Dialogue).length);
          // check if the text was marked for deletion
          if((response.TextData.Dialogue[dIndex].Text !== "（★未使用／削除予定★）") ||
             (response.TextData.Dialogue[dIndex].Text !== "（カット）")){
            OrderID = parseInt(response.TextData.Dialogue[dIndex].Order);
          }
        } while (OrderID === -1);

        // assign strings to state & set haveText to true
        this.setState({
          text: {
            DE: this.AssignText(response.TextData_de.Dialogue, OrderID, dIndex),
            EN: this.AssignText(response.TextData_en.Dialogue, OrderID, dIndex),
            FR: this.AssignText(response.TextData_fr.Dialogue, OrderID, dIndex),
            JP: this.AssignText(response.TextData_ja.Dialogue, OrderID, dIndex)
          },
          haveText: true
        });
        
      // close out individual quest retrieval
      }).catch((error:Error) => {
        console.error(`Error in getting item ${qIndex}: `, error)
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

  AssignText(dialogue:any, order:number, index:number):string{
    let temp = "";
    if(parseInt(dialogue[index].Order) === order){
      temp = dialogue[index].Text;
    } else {
      index = 0;
      do {
        if(parseInt(dialogue[index].Order) === order){
          temp = dialogue[index].Text;
        } else {
          index++;
        }
      } while(temp === "");
    }

    if(/</.test(temp)){
      temp = this.ReplaceCode(temp);
    }
    
    return temp;
  }
  
  ReplaceCode(toChange:string):string{
    // basic replacements/removals
    toChange = toChange.replace(/<SoftHyphen\/>/g, "-"); // Soft Hyphen code: \u00AD
    toChange = toChange.replace(/<Indent\/>/g, "");
    toChange = toChange.replace(/<.?Emphasis>/g, "");
    toChange = toChange.replace(/<UIForeground>.?[0-9]*<\/UIForeground>/g, "");

    if(/PlayerParameter/.test(toChange)){
      // Fix display of gendered text
      toChange = toChange.replace(/<If.{0,7}\(PlayerParameter\(4\).{0,3}\)>/g,"<If>");

      // Fix display of time-relative text
      toChange = toChange.replace(/<If\(LessThan\(PlayerParameter\(11\),\d{1,3}\)\)>/g, "<If>");
      
      // Fix display of PlayerParameter(52-54), which handle GC
      toChange = toChange.replace(/<If\(GreaterThan\(PlayerParameter\(5\d\),0\)\)>/g, "<If>");
      toChange = toChange.replace(/<Sheet\(GCRankLimsaMaleText,PlayerParameter\(52\),\d\)\/>/g, "[[♂ Limsa Rank]]");
      toChange = toChange.replace(/<Sheet\(GCRankGridaniaMaleText,PlayerParameter\(53\),\d\)\/>/g, "[[♂ Gridania Rank]]");
      toChange = toChange.replace(/<Sheet\(GCRankUldahMaleText,PlayerParameter\(54\),\d\)\/>/g, "[[♂ Ul'dah Rank]]");
      toChange = toChange.replace(/<Sheet\(GCRankLimsaFemaleText,PlayerParameter\(52\),\d\)\/>/g, "[[♀ Limsa Rank]]");
      toChange = toChange.replace(/<Sheet\(GCRankGridaniaFemaleText,PlayerParameter\(53\),\d\)\/>/g, "[[♀ Gridania Rank]]");
      toChange = toChange.replace(/<Sheet\(GCRankUldahFemaleText,PlayerParameter\(54\),\d\)\/>/g, "[[♀ Ul'dah Rank]]");
      
      // Fix display of PlayerParameter(68), which references current job
      toChange = toChange.replace(/<If\(Equal\(PlayerParameter\(68\),\d{0,2}\)\)>/g,  "<If>");
      toChange = toChange.replace(/<Sheet\(ClassJob,PlayerParameter\(68\),\d{0,2}\)\/>/g, "[[class/job]]");

      // Fix 71 (Starting City - 1: Limsa/Ul'dah; 2: Gridania; 3: Limsa/Ul'dah)
      if(/<Switch\(PlayerParameter\(70\)\)>/.test(toChange)){
        toChange = toChange.replace(/<Switch\(PlayerParameter\(70\)\)>/g, "(");
        toChange = toChange.replace(/<Case\(1\)>/g, " [[Limsa/Ul'dah]] ");
        toChange = toChange.replace(/<Case\(2\)>/g, " [[Gridania]] ");
        toChange = toChange.replace(/<Case\(3\)>/g, " [[Limsa/Ul'dah]] ");
        toChange = toChange.replace(/<\/Case><\/Switch>/g, ")");
        toChange = toChange.replace(/<\/Case>/g, "/")
      }

      // Fix display of racial text
      toChange = toChange.replace(/<If.{0,6}\(PlayerParameter\(71\).{0,4}\)>/g,"<If>");
    }
    
    // change character name code to [[character name]]
    // cNameS is for when the code would display a character's full name
    let cNameS = /<Highlight>ObjectParameter\(1\)<\/Highlight>/g;
    // cNameL is for when the code would display first OR last name
    let cNameL = /<Split\(<Highlight>ObjectParameter\(1\)<\/Highlight>,.{0,3},.{0,3}\)\/>/g;
    if(/ObjectParameter\(1\)/.test(toChange)){
      toChange = toChange.replace(cNameL, "[[character name]]");
      toChange = toChange.replace(cNameS, "[[character name]]");
    }
    

    // Fix display of things that reference other sheets
    if(/<Sheet/.test(toChange)){
      toChange = toChange.replace(/<Sheet.{0,4}EObj.{6,18}\/>/g,"[[Event Object]]");
      toChange = toChange.replace(/<Sheet.{0,4}BNpcName.{6,18}\/>/g, "[[monster]]");
      // This Regex allows more text in front than the previous two
      // Because I want it to also catch EventItem
      toChange = toChange.replace(/<Sheet.{0,9}Item.{6,18}\/>/g,"[[item]]");
      // Sometimes gendered language shows up for item/monster names; prepare for fix
      toChange = toChange.replace(/<If\(\[\[.{1,13}\]\]\)>/g, "<If>");
    }

    // Fix any If/Else blocks that were prepared by previous replaces
    if(/<If>/.test(toChange)){
      // Replaces for nested If blocks so they also look good
      // This was built specifically for time checks, but may also work for Class/Job blocks
      toChange = toChange.replace(/<If><If>/g, "(");
      toChange = toChange.replace(/<\/If><Else\/><If>/g, "/");
      toChange = toChange.replace(/<\/If><\/If>/g, ")");
      // Opening for when true is empty
      toChange = toChange.replace(/<If><Else\/>/g, "(");
      // Closing for when false is empty
      toChange = toChange.replace(/<Else\/><\/If>/g, ")");
      // Replace any remaining individual tags
      toChange = toChange.replace(/<If>/g, "(");
      toChange = toChange.replace(/<Else\/>/g, "/");
      toChange = toChange.replace(/<\/If>/g, ")");
    }

    // Cleanup for messy if blocks - remove duplicate ( / ) characters
    if((/\({2,}/.test(toChange)) || (/\/{2,}/.test(toChange)) || (/\){2,}/.test(toChange)) || 
      (/\)\//.test(toChange)) || (/\/\(/.test(toChange))){
        toChange = toChange.replace(/\({2,}/g, "("); // 2 or more ( with a single (
        toChange = toChange.replace(/\/{2,}/g, "/"); // 2 or more / with a single /
        toChange = toChange.replace(/\){2,}/g, ")"); // 2 or more ) with a single )
        toChange = toChange.replace(/\)\//g, "/"); // )/ with a single /
        toChange = toChange.replace(/\/\(/g, "/"); // /( with a single /
    }
    // add a zero-width space to the right of any / character to allow for line breaks
    toChange = toChange.replace(/\//g, "/\u200B");
    
    return toChange;
  }
}