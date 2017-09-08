
import React from 'react';
import PropTypes from 'prop-types';

import Tile from "./Tile.jsx";

import './GameField.css';

class GameField extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tileSize:   Math.floor(10000 / this.props.matrixSize) / 100
        };
    }

    render() {
        return (
            <div className="game-field" >
                <div className="field-container" >
                    <div className="field-content" >

                        {this.props.view.map((arr, i) => {
                            return arr.map((item, j) => {
                                return (
                                    <Tile
                                        key={i.toString() + j.toString()}
                                        value={item.value}
                                        left={j * this.state.tileSize}
                                        top={i * this.state.tileSize}
                                        animation={item.animation}
                                        onTransitionEnd={this.props.onTransitionEnd}
                                    />
                                );
                            });
                        })}

                    </div>
                </div>
            </div>
        );
    }
}

GameField.propTypes = {
    matrixSize:         PropTypes.number.isRequired,
    view:               PropTypes.array.isRequired,
    onTransitionEnd:    PropTypes.func.isRequired
};

export default GameField;
