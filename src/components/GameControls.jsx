
import React from 'react';
import PropTypes from 'prop-types';

import {CardActions, CardTitle} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import Chip from 'material-ui/Chip';

class GameControls extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            bestScore: 0,
            bestTile:  0
        };
    }

    componentWillMount() {
        this.getResults();
    }

    getResults = () => {

        let saves = JSON.parse(localStorage.getItem('game-2048'));
        if (!saves) {
            this.setState({ bestScore:  0, bestTile:  0, });
        }

        this.setState({ bestScore: saves.bestScore, bestTile: saves.bestTile, });
    };

    handleStart = () => {

        this.getResults();
        this.props.handleStart();
    };

    renderTitle = () => {
        const style = {
            float: 'right'
        };
        return (
            <span>
                Game 2048
                <Chip style={style} >
                    Score: {this.props.score}
                </Chip>
            </span>
        );
    };

    renderSubtitle = () => {
        return (
            <span>
                Best game: (Score: {this.state.bestScore} Tile: {this.state.bestTile})
            </span>
        );
    };

    render() {
        return (
            <div >

                <CardTitle
                    title={this.renderTitle()}
                    subtitle={this.renderSubtitle()}
                />

                <CardActions>
                    <RaisedButton label="New Game" onClick={this.handleStart}/>
                </CardActions>

            </div>
        );
    }
}
GameControls.propTypes = {
    score:          PropTypes.number.isRequired,
    handleStart:    PropTypes.func.isRequired
};

export default GameControls;
