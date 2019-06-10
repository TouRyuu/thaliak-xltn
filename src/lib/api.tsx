const XIVAPI = require('xivapi-js');
//import { Quest } from './types'

const xiv = new XIVAPI();

export function GetQuests(){
    xiv.data.list("Quest").then((response:any) => {
        console.log("Quest p1 Pagination Info\n",response.Pagination)
    }).catch((error:Error) => {
        console.error("Error in GetQuests(): ", error)
    })
}