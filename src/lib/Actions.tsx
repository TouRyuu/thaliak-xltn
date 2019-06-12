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
    toChange = toChange.replace(/<SoftHyphen\/>/g, "-");
    toChange = toChange.replace(/<Indent\/>/g, "");
    toChange = toChange.replace(/<.?Emphasis>/g, "");
    toChange = toChange.replace(/<UIForeground>.?[0-9]*<\/UIForeground>/g, "");

    if(/PlayerParameter/.test(toChange)){
      // Fix display of gendered text
      toChange = toChange.replace(/<If\(PlayerParameter\(4\)\)>/g,"<If>");

      // Fix display of time-relative text
      toChange = toChange.replace(/<If\(LessThan\(PlayerParameter\(11\),\d{1,3}\)\)>/g, "<If>")
      
      // Fix display of PlayerParameter(68), which references current job
      toChange = toChange.replace(/<If.{0,8}\(PlayerParameter\(68\).{0,8}/, "<If>")
      toChange = toChange.replace(/<.{9,16}PlayerParameter\(68\).{0,8}>/g,"[[class/job]]")

      // Fix display of racial text
      toChange = toChange.replace(/<If.{0,6}\(PlayerParameter\(71\).{0,4}\)>/g,"<If>");
    }
    
    // change character name code to [[character name]]
    // cNameS is for when the code would display a character's full name
    let cNameS = /<Highlight>ObjectParameter\(1\)<\/Highlight>/g;
    // cNameL is for when the code would display first OR last name
    let cNameL = /<Split\(<Highlight>ObjectParameter\(1\)<\/Highlight>.{2,6}\)\/>/;
    if(cNameS.test(toChange)){
      toChange = toChange.replace(cNameL, "[[character name]]");
      toChange = toChange.replace(cNameS, "[[character name]]");
    }

    // Fix display of things that reference other sheets
    if(/<Sheet/.test(toChange)){
      toChange = toChange.replace(/<.{6,9}EObj.{6,18}\/>/g,"[[Event Object]]");
      toChange = toChange.replace(/<.{6,9}BNpcName.{6,18}\/>/g, "[[monster]]");
      // This Regex allows more text in front than the previous two
      // Because I want it to also catch EventItem
      toChange = toChange.replace(/<.{6,14}Item.{6,18}\/>/g,"[[item]]");
      // Sometimes gendered language shows up for item/monster names; prepare for fix
      toChange = toChange.replace(/<If\(\[\[.{1-13}\]\]\)>/, "<If>");
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

    // check if there's still angle braces in the text
    if(/</.test(toChange) || />/.test(toChange)){
      // remove leftover wrappers such as Clickable and Split
      // only removing the front here, as sometimes the end is grabbed by earlier replaces
      toChange = toChange.replace(/<Split\(/g, "");
      toChange = toChange.replace(/<Clickable\(/g, "");

      // remove stray tag closers here
      toChange = toChange.replace(/\/>/g, "")
    }

    return toChange;
  }
}

/*
REMAINING PROBLEMS

Thank you, <If(GreaterThan(PlayerParameter(52),0))><Sheet(GCRankLimsaMaleText,PlayerParameter(52),8)/><Else/></If><If(GreaterThan(PlayerParameter(53),0))><Sheet(GCRankGridaniaMaleText,PlayerParameter(53),8)/><Else/></If><If(GreaterThan(PlayerParameter(54),0))><Sheet(GCRankUldahMaleText,PlayerParameter(54),8)/><Else/></If>)/> [[character name]]─this will go a long way to helping the nation recover from the ravages of war!
Un grand merci pour votre col-la-bo-ra-tion, <If(GreaterThan(PlayerParameter(52),0))><If(GreaterThan(PlayerParameter(52),0))>(<Sheet(GCRankLimsaFemaleText,PlayerParameter(52),0)/>/<Sheet(GCRankLimsaMaleText,PlayerParameter(52),0)/>)) [[character name]])<If(GreaterThan(PlayerParameter(53),0))><If(GreaterThan(PlayerParameter(53),0))>(<Sheet(GCRankGridaniaFemaleText,PlayerParameter(53),0)/>/<Sheet(GCRankGridaniaMaleText,PlayerParameter(53),0)/>)) [[character name]], ,2)/>)<If(GreaterThan(PlayerParameter(54),0))><If(GreaterThan(PlayerParameter(54),0))>(<Sheet(GCRankUldahFemaleText,PlayerParameter(54),0)/>/<Sheet(GCRankUldahMaleText,PlayerParameter(54),0)/>)) [[character name]], ,2)/>)!

** PlayerParameter(70) is...?
<Switch(PlayerParameter(70))><Case(1)>The building you seek stands in the southern part of the city, now called New Gridania</Case><Case(2)>I daresay you know it well from your wanderings in New Gridania</Case><Case(3)>The building you seek stands in the southern part of the city, now called New Gridania</Case></Switch>. Give your name to the personnel officer there, and he will guide you through the formalities.

** Massive class/job blocks

*/
// la gloire de la grande frairie
// his whiskers
// Große Flosse
// おおなまずのまにまに