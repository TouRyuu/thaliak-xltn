import React, { Component } from 'react'

export default class UserArea extends Component<any, any> {

    constructor(props:any){
        super(props)
        this.state = { input: "" }
    }

    handleChange(input:string,e:React.ChangeEvent<HTMLTextAreaElement>){
        e.preventDefault();
        this.setState({
            input: e.target.value
        });
    }

    handleClick(e:React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        this.props.handleClick(e);
        if(!this.props.pState.isNew){
            this.setState({ input: "" });
        }
    }

    render(){
    const pState = this.props.pState;
    let input = this.state.input;
    let label = pState.isNew ? `Show ${pState.tLang}` : "Next";
    
    return(
        <div className="UserInput">
            
            <form onSubmit={(e)=>{this.handleClick(e)}}>
                {pState.isNew &&
                    <textarea
                        className="UserText"
                        placeholder="Type your translation here."
                        value={input}
                        onChange={(e)=>{this.handleChange(input, e)}} />
                }
                {!pState.isNew &&
                    <div className="UserText">
                        <p>{this.state.input}</p>
                    </div>
                }
                
                <Button label={label} />
            </form>
        </div>
    )
            }
}

// Button is only used by UserArea, so does not get exported.
function Button (props:any) {
    return(
        <button type="submit" className="Button">
            {props.label}
        </button>
    )
}