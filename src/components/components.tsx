import React from 'react';
import '../App.css'

export function Header () {
    return (
        <div className="Header">
            <h1>Thaliak's Translations</h1>
            <span className="Subtext">A FFXIV Translation Practice Tool</span>
        </div>
    )
}

export function Container (props:any) {
    return (
        <div className="ContentContainer">
            {props.children}
        </div>
    )
}

export function UserArea (props:any) {
    let userProps = props.userProps;
    let label:string = userProps.isNew ? `Show ${userProps.lang}` : "Next";
    
    return(
        <div className="UserInput">
            
            <form onSubmit={userProps.handleClick}>
                {userProps.isNew &&
                    <textarea
                        className="UserText"
                        placeholder="Type your translation here."
                        value={userProps.input}
                        onChange={userProps.handleChange} />
                }
                {!userProps.isNew &&
                    <div className="UserText">
                        <p>{userProps.userText}</p>
                    </div>
                }
                
                <Button label={label} />
            </form>
        </div>
    )
}

// Button is only used by UserArea, so does not get exported.
function Button (props:any) {
    return(
        <button type="submit" className="Button">
            {props.label}
        </button>
    )
}