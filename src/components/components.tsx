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

export function Button (props: any) {
    return (
        <button className="Button">
            {props.text}
        </button>
    )
}