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
    // basic replacements
    toChange = toChange.replace(/<SoftHyphen\/>/g, "-");
    toChange = toChange.replace(/<Indent\/>/g, "");
    if(/Emphasis/.test(toChange)){
      // For now I'm just removing Emphasis tags
      // In the future I'd like to replace with bold/italic text
      toChange = toChange.replace(/<Emphasis>/g, "");
      toChange = toChange.replace(/<\/Emphasis>/g, "");
    }

    // Fix display of gendered text
    if(/PlayerParameter\(4\)/.test(toChange)){
      toChange = this.Gender(toChange);
    }

    // Fix display of racial text
    if(/PlayerParameter\(71\)/.test(toChange)){
      toChange = this.Gender(toChange);
    }
    
    // change character name to placeholder
    let cNameS = /<Highlight>ObjectParameter\(1\)<\/Highlight>/g;
    let cNameL = /<Split\(<Highlight>ObjectParameter\(.?\)<\/Highlight>.{2,6}\)\/>/g;
    if(cNameS.test(toChange)){
      toChange = toChange.replace(cNameL, "[[character name]]");
      toChange = toChange.replace(cNameS, "[[character name]]");
    }

    // Fix display of things that reference other sheets
    if(/Item/.test(toChange)){
      toChange = toChange.replace(/<.{6,14}Item.{6,18}\/>/g,"[[item]]");
    }
    if(/EObj/.test(toChange)){
      toChange = toChange.replace(/<.{6,9}EObj.{6,18}\/>/g,"[[Event Object]]");
    }
    if(/BNpcName/.test(toChange)){
      toChange = toChange.replace(/<.{6,9}BNpcName.{6,18}\/>/g, "[[monster]]");
    }

    // Fix display of PlayerParameter(68), which references current job
    if(/PlayerParameter\(68\)/.test(toChange)){
      // this handles any locations of self-closing tags
      toChange = toChange.replace(/<.{9,16}PlayerParameter\(68\).{0,8}>/g,"[[class/job]]")
    }

    // remove wrappers such as Clickable and Split
    toChange = toChange.replace(/<Split\(/g, "");
    toChange = toChange.replace(/<Clickable\(/g, "");

    // remove stray tag closers
    // This should be uncommented once I'm happy with everything else
    //toChange = toChange.replace(/\/>/g, "")

    // send the new text back
    let changed = toChange;
    return changed;
  }

  // This function handles gendered & racial text,
  // as designated in the text by PlayerParameter(4) & PlayerParameter(71)
  Gender(fix:string):string {
    // get number of times PP4 is used
    let num = (fix.split(/\(PlayerParameter\(.{0,2}\)/g).length -1);

    // cycle through the string that many times
    for(let i = 0; i < num; i++){
      // sections with only TRUE option
      if(/<Else\/><\/If>/.test(fix)){
        //<If.{0,6}\(PlayerParameter\(.{0,2}\).{0,4}\)>.{0,20}<Else\/>.{0,20}<\/If>
        fix = fix.replace(/<If.{0,6}\(PlayerParameter\(.{0,2}\).{0,4}\)>.{1,20}<Else\/><\/If>/, (x)=>{
          x = x.replace(/<If.{0,6}\(PlayerParameter\(.{0,2}\).{0,4}\)>/, "(");
          x = x.replace(/<Else\/><\/If>/, ")");
          return x;
        });
      // sections with only FALSE option
      } else if(/<If.{0,6}\(PlayerParameter\(.{0,2}\).{0,4}\)><Else\/>/.test(fix)){
        fix = fix.replace(/<If.{0,6}\(PlayerParameter\(.{0,2}\).{0,4}\)><Else\/>.{1,20}<\/If>/, (x)=>{
          x = x.replace(/<If.{0,6}\(PlayerParameter\(.{0,2}\).{0,4}\)><Else\/>/, "(");
          x = x.replace(/<\/If>/, ")");
          return x;
        });
      // sections with both TRUE and FALSE options
      } else {
        fix = fix.replace(/<If.{0,6}\(PlayerParameter\(.{0,2}\).{0,4}\)>.{1,20}<Else\/>.{1,20}<\/If>/, (x)=>{
          x = x.replace(/<If.{0,6}\(PlayerParameter\(.{0,2}\).{0,4}\)>/, "(");
          x = x.replace(/<Else\/>/, "/");
          x = x.replace(/<\/If>/, ")");
          return x;
        });
      }
    }

    return fix;
  }
}

/*
REMAINING PROBLEMS

** PP(11) is time of day
A pleasant 
<If(LessThan(PlayerParameter(11),12))>
  <If(LessThan(PlayerParameter(11),4))>
    evening
  <Else/>
    morning
  </If>
<Else/>
  <If(LessThan(PlayerParameter(11),17))>
    afternoon
  <Else/>
    evening
  </If>
</If>
 to you, (Mistress/Master)
*/

/*
SHOULD BE FIXED

[(GERMAN) no feminine option for gendered text]

[[character name]], ,1)/>

Si l'aventuri(ère<Else/>er</If> est aussi gentil(le) qu'(elle/il) en a l'air, (elle/il) ira botter les fesses de ces fichus engins! <If(PlayerParameter(4))>Elle/Il) n'a qu'à en casser trois près de L'Arkhitékton, ça embêtera bien la Main indigo!
Si l'aventuri<If(PlayerParameter(4))>ère<Else/>er</If> est aussi gentil<If(PlayerParameter(4))>le<Else/></If> qu'<If(PlayerParameter(4))>elle<Else/>il</If> en a l'air, <If(PlayerParameter(4))>elle<Else/>il</If> ira botter les fesses de ces fichus engins! <If(PlayerParameter(4))>Elle<Else/>Il</If> n'a qu'à en casser trois près de L'Arkhitékton, ça embêtera bien la Main indigo!

** PP(71) is character race
Des Roegadyns comme <If(Equal(PlayerParameter(71),5))>vous et moi<Else/>moi</If> auront utilisé cette pioche.

important news from you, <Split(<Highlight>ObjectParameter(1)</Highlight>, ,1)/>! Lady Leveva and Quimperain
Oh, vous êtes <Highlight>ObjectParameter(1)</Highlight>, (la/le) célèbre Hériti(ère/er) de la Septième Aube!

「<Sheet(Item,5333,0)/>」は、ふわふわの「<Sheet(Item,5341,0)/>」をつむいで作る糸よ。
悪さをする「<Sheet(BNpcName,3495,0)/>」を倒してほしいんだ。

mir [[item]] zu. <Clickable([[item]] dafür
<Clickable([[item]])/>

*/

// la gloire de la grande frairie
// his whiskers
// Große Flosse
// おおなまずのまにまに

/*

（★未使用／削除予定★）

DE: Leer / EN: Textless / JP: [kuu]raberu
*/