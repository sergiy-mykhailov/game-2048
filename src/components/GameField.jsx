
import React from 'react';
import PropTypes from 'prop-types';

import Tile from "./Tile.jsx";

import './GameField.css';

class GameField extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tileSize:       Math.floor(10000 / this.props.matrixSize) / 100,
            touchStarted:   false,
            x: 0,
            y: 0
        };
    }

    componentDidMount() {

        const gameField = document.querySelector('.game-field');

        gameField.addEventListener('touchstart',     this.handleTouchStart);
        gameField.addEventListener('touchend',       this.handleTouchEnd);
        gameField.addEventListener('touchcancel',    this.handleTouchEnd);
    }

    handleTouchStart = (event) => {
        if (!event.touches || event.touches.length !== 1 || this.state.touchStarted) return;

        let touch = event.changedTouches[0];

        this.setState({
            touchStarted: true,
            x:      touch.pageX,
            y:      touch.pageY
        });
    };

    handleTouchEnd = (event) => {
        if (!event.changedTouches || !this.state.touchStarted) return;

        event.preventDefault();

        const touch = event.changedTouches[0];

        const deltaX = this.state.x - touch.pageX;
        const deltaY = this.state.y - touch.pageY;
        const swipeX = deltaX < 0 ? 'right' : 'left';
        const swipeY = deltaY < 0 ? 'down' : 'up';

        const direction = Math.abs(deltaX) > Math.abs(deltaY) ? swipeX : swipeY;
        if (!direction) return;

        this.props.onSlide(direction);

        this.setState({
            touchStarted: false
        });
    };

    render() {
        return (
            <div className="game-field" >
                <div className="field-container" >
                    <div className="field-content">

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
    onTransitionEnd:    PropTypes.func.isRequired,
    onSlide:            PropTypes.func.isRequired
};

export default GameField;
