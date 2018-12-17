import React, { Component } from 'react';
import './App.css';
import SubmitForm from './SubmitForm';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="Container">
          <SubmitForm />
        </div>
      </div>
    );
  }
}

export default App;
