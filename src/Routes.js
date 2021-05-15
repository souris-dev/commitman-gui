import React from "react";
import { Router, Switch, Route } from "react-router-dom";

import StartingPage from './StartingPage/StartingPage.jsx';
import FileBrowsePage from './FileBrowsePage/FileBrowsePage.jsx';
import history from './history';

export default function Routes() {
    return (
        <Router history={history}>
            <Switch>
                <Route path="/" exact component={StartingPage} />
                <Route path="/OpenedRepo" component={FileBrowsePage} />
            </Switch>
        </Router>
    )
}