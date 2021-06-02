import React from 'react';
import { createStore } from '@spyna/react-store';
import { Component } from 'react';

import Routes from './Routes';
import MenuBar from './MenuBar/MenuBar.jsx';
import AboutDialog from './AboutDialog/AboutDialog.jsx';

class App extends Component {
  render() {
    return (
      <>
        <MenuBar />
        <Routes />
        <AboutDialog />
      </>
    );
  }
}

// Initialize the default values in the store:
const storeInitValue = { isAboutDialogOpen: false };

// create a store on this App
export default createStore(App, storeInitValue);