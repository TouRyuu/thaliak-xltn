import '../App.css'
import React from 'react'

export function Header (props:any) {
    return (
        <header>
            <h1>Thaliak's Translations</h1>
            <span className="Subtext">A FFXIV Translation Practice Tool</span>
        </header>
    )
}

export function Container (props:any) {
    return (
        <main>

            {props.children}

        </main>
    )
}