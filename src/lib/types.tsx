export type AppState = {
  isNew:Boolean,
  haveText?:Boolean,
  pages?:number,
  from:string,
  to:string,
  text?:Languages
}

export type Languages = {
  EN:string,
  JP:string,
  FR?:string,
  DE?:string
}