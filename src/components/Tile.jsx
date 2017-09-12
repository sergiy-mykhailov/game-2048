
import React from 'react';
import PropTypes from 'prop-types';

import Paper from 'material-ui/Paper';

import './Tile.css';

class Tile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isAnimated: false
        };
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.animation) {
            this.setState({ isAnimated: true });
        }
    }

    getBGColor = () => {
        let value;

        switch (this.props.value) {
            case 0:     value = "#fff";    break;
            case 2:     value = "#EEE4DA"; break;
            case 4:     value = "#EDE0C8"; break;
            case 8:     value = "#F2B179"; break;
            case 16:    value = "#F59563"; break;
            case 32:    value = "#F67C5F"; break;
            case 64:    value = "#F65E3B"; break;
            case 128:   value = "#EDCF72"; break;
            case 256:   value = "#EDCC61"; break;
            case 512:   value = "#EDC850"; break;
            case 1024:  value = "#EDC53F"; break;
            case 2048:  value = "#171EED"; break;
            default:    value = "#fff";    break;
        }
        return value;
    };

    getTextColor = () => {
        let value;

        switch (this.props.value) {
            case 2:
            case 4:
                value = "#776E65"; break;
            default:
                value = "#fff"; break;
        }
        return value;
    };

    getClassName = () => {
        let value;

        switch (this.props.value) {
            case 2:
            case 4:
            case 8:     value = "number-xl"; break;

            case 16:
            case 32:
            case 64:    value = "number-lg"; break;

            case 128:
            case 256:
            case 512:   value = "number-md"; break;

            case 1024:
            case 2048:  value = "number-sm"; break;

            default:    value = "number-0"; break;
        }
        return value;
    };

    onTransitionEnd = (event) => {

        if (this.state.isAnimated) {
            this.props.onTransitionEnd(event);
            this.setState({ isAnimated: false });
        }
    };

    renderChild = () => {
        const style = {};

        if (this.props.animation.toLowerCase() === "new") {
            style.transitionProperty = 'font-size';
            style.transitionDuration = '200ms';
        }

        return (
            <div className={"tile-caption " + this.getClassName()} style={style}>
                {(this.props.value === 0) ? '' : this.props.value}
            </div>
        );
    };

    getStyleTile = () => {

        let style = {
            color:              this.getTextColor(),
            backgroundColor:    this.getBGColor()
        };

        switch ( this.props.animation.toLowerCase() ) {

            case "shift":
                style.transitionProperty = 'background-color';
                style.transitionDuration = '10ms';
                break;

            case "merge-flash":
                style.transitionProperty = 'width, height, margin';
                style.transitionDuration = '40ms';
                style.height             = '110%';
                style.width              = '110%';
                style.margin             = '-5%';
                break;

            case "merge":
                style.transitionProperty = 'width, height, margin';
                style.transitionDuration = '40ms';
                break;

            case "new":
                style.transitionProperty = 'background-color';
                style.transitionDuration = '200ms';
                break;
        }
        return style;
    };

    render() {
        const styleContainer = {
            left:   `${this.props.left}%`,
            top:    `${this.props.top}%`,
        };
        return (
            <div className="tile-container" style={styleContainer}>
                <div className="tile-inner">
                    <div className="tile-content">

                        <Paper
                            transitionEnabled={false}
                            className="tile"
                            style={this.getStyleTile()}
                            zDepth={1}
                            children={this.renderChild()}
                            onTransitionEnd={this.onTransitionEnd}
                        />

                    </div>
                </div>
            </div>
        );
    }
}

Tile.propTypes = {
    value:              PropTypes.number.isRequired,
    left:               PropTypes.number.isRequired,
    top:                PropTypes.number.isRequired,
    onTransitionEnd:    PropTypes.func.isRequired,
    animation:          PropTypes.string.isRequired
};

export default Tile;
