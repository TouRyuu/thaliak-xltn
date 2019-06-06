import React from 'react';
import * as Component from './components/components'
import './App.css';

const App: React.FC = () => {
  return (
    <div>
      <Component.Header />
      <div className="ContentContainer">
        <div className="OfficialText">
          <span>Official Source Text goes here.</span>
        </div>

        <div className="UserInput">
          <div className="UserText">
            <span>User's Text goes here.</span>
          </div>
          <Component.Button text="Show EN" />
        </div>

        <div className="OfficialText">
          <span>Official Target Text goes here.</span>
        </div>
      </div>
    </div>
  );
}

export default App;
