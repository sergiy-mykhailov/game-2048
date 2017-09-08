// Created by Sergiy Mykhailov

import React from 'react';
import ReactDOM from 'react-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Game2048 from './components/Game2048.jsx';

ReactDOM.render(
    <MuiThemeProvider>
        <div>
            <Game2048/>
        </div>
    </MuiThemeProvider>,
    document.getElementById('game-2048')
);
