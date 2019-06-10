type Languages = {
    DE?: string,
    EN: string,
    FR?: string,
    JP?: string
}

type Snippet = {
    Order: number,
    Language: Languages
}

export type Quest = {
    ID: number,
    Name: Languages,
    Text: Snippet
}

export type AppState = {
    lang:string,/*{
      source:string,
      target:string
    } */
    isNew:Boolean
  }