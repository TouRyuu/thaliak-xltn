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