
import React from 'react';

import GameControls from './GameControls.jsx';
import GameField from './GameField.jsx';
import ModalDialog from './ModalDialog.jsx';

import { Card, CardMedia, CardText } from 'material-ui/Card';
import Toggle from 'material-ui/Toggle';
import Divider from 'material-ui/Divider';

import './Game2048.css';

class Game2048 extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            matrixSize:     4,
            gameArray:      [],
            view:           {},
            queue:          [],
            isStarted:      false,
            isVictory:      false,
            isLoss:         false,
            infoExpanded:   false,
            score:          0
        };
    }

    //-------- React events --------

    componentWillMount() {

        const gameArray = this.getNewGameArray();
        this.setState({ gameArray });

        this.pushToQueue(gameArray, 'init');
        this.showView();
    }

    componentDidMount() {
        document.onkeyup = this.handleKeystroke;
    }

    componentWillUnmount() {
        this.saveResults();
    }

    shouldComponentUpdate(nextProps, nextState) {

        return !(
            this.props === nextProps
            && (this.state.isLoss === nextState.isLoss)
            && (this.state.isVictory === nextState.isVictory)
            && (this.state.view === nextState.view)
            && (this.state.matrixSize === nextState.matrixSize)
            && (this.state.infoExpanded === nextState.infoExpanded)
        );
    }

    //-------- secondary functions --------

    randomInRange = (start, finish) => {
        return Math.floor(( Math.random() * (finish - start + 1) ) + start);
    };

    getNewGameArray = () => {
        let newGameArray = [];

        for (let i = 0; i < this.state.matrixSize; i++) {
            newGameArray.push([]);

            for (let j = 0; j < this.state.matrixSize; j++) {
                newGameArray[i].push(0);
            }
        }

        return newGameArray;
    };

    getDirection = (key) => {
        let direction;

        switch (key) {

            case 38:
            case "ArrowUp":
                direction = "up"; break;

            case 40:
            case "ArrowDown":
                direction = "down"; break;

            case 37:
            case "ArrowLeft":
                direction = "left"; break;

            case 39:
            case "ArrowRight":
                direction = "right"; break;

            default:
                direction = "";
        }

        return direction;
    };

    cloneArray = (arr) => {

        return arr.map( (item) => {
            if (Array.isArray(item)) return item.concat();
            return item;
        });
    };

    rotate = (arr, direction, forward) => {
        let turnedArray;

        if (direction === "up") {

            turnedArray = (forward) ? this.rotateCCW(arr) : this.rotateCW(arr);

        } else if (direction === "down") {

            turnedArray = (forward) ? this.rotateCW(arr) : this.rotateCCW(arr);

        } else if (direction === "left") {

            // no rotate
            turnedArray = this.cloneArray(arr);

        } else if (direction === "right") {

            turnedArray = this.flipHorizontal(arr);

        }
        return turnedArray;
    };

    rotateCW = (arr) => {
        let newArr = this.getNewGameArray();

        const tempArr = this.cloneArray(arr).reverse();
        tempArr.forEach( (item, i) => {

            item.forEach( (itemJ, j) => {
                newArr[j][i] = itemJ;
            });
        });

        return newArr;
    };

    rotateCCW = (arr) => {
        let newArr = this.getNewGameArray();

        arr.forEach( (item, i) => {

            const tempArr = this.cloneArray(item).reverse();
            tempArr.forEach( (itemJ, j) => {
                newArr[j][i] = itemJ;
            });
        });

        return newArr;
    };

    flipHorizontal = (arr) => {
        let newArr = this.cloneArray(arr);

        newArr.forEach( (item) => {
            item.reverse();
        });

        return newArr;
    };

    getIndexesOfZero = (arr) => {
        let index  = "";
        let indexesArr  = [];

        // if there are empty - find indexes of empty
        arr.forEach( (item, i) => {
            if (item === 0) index += i.toString();
        });

        // indexes: 0123, 123, 23, 3
        for (let i = 0; i < arr.length; i++) {
            let str = "";
            for (let j = i; j < arr.length; j++) {
                str += j.toString();
            }
            indexesArr.push(str);
        }

        return { arr: indexesArr, index: index }
    };

    shiftArray = (arr) => {
        if( !this.isShiftAllowed(arr) ) return;

        for(let i = 0; i < arr.length; i++) {
            if(arr[i] === 0){
                arr.splice(i,1);
                arr.push(0);
                break;
            }
        }
    };

    isShiftAllowed = (arr) => {

        if(arr.indexOf(0) === -1) return false;

        const indexesOfZero = this.getIndexesOfZero(arr);

        // if already sorted - do not shift
        return (indexesOfZero.arr.indexOf(indexesOfZero.index) === -1);
    };

    mergeArray = (arr) => {
        let mergeAllowed = false;
        let target = [];

        if( this.isMergeAllowed(arr) ) {
            for(let i = 0; i < arr.length; i++) {

                if ( (i + 1 < arr.length) && (arr[i] !== 0) ) {
                    if(arr[i] === arr[i+1]){

                        arr.splice(i, 2, arr[i]*2);
                        arr.push(0);

                        this.addToScore(arr[i]);

                        mergeAllowed = true;
                        target.push(i);
                    }
                }
            }
        }
        return { isMerged: mergeAllowed, target: target };
    };

    isMergeAllowed = (arr) => {

        const indexesOfZero = this.getIndexesOfZero(arr);
        let indexesArr      = indexesOfZero.arr;
        indexesArr.splice(2);

        // if already sorted - do not merge
        return (indexesArr.indexOf(indexesOfZero.index) === -1);
    };

    getTargets = (arr, direction, i) => {

        return arr.map( (item) => {
            return this.getCoordinates(direction, i, item);
        });
    };

    getCoordinates = (direction, i, j) => {

        let newI = null, newJ = null;
        const matrixSize = this.state.matrixSize;

        switch (direction){
            case "up":
                newI = j;
                newJ = matrixSize - (i + 1);
                break;

            case "down":
                newI = matrixSize - (j + 1);
                newJ = i;
                break;

            case "left":
                newI = i;
                newJ = j;
                break;

            case "right":
                newI = i;
                newJ = matrixSize - (j + 1);
                break;
        }

        return { i: newI, j: newJ };
    };

    getMaxTile = () => {
        const arr = this.state.gameArray.map( (item) => Math.max(...item) );
        return Math.max(...arr);
    };

    //-------- main functions --------

    startSliding = (direction) => {
        if (!direction || (this.state.queue.length !== 0) || (!this.state.isStarted)) return;

        this.shiftTiles(direction);
        this.mergeTiles(direction);
        this.generateTile();
        this.showView();
    };

    shiftTiles  = (direction) => {
        let arr = this.cloneArray(this.state.gameArray);

        for (let i = 0; i < arr.length; i++) {

            let turnedArray = this.rotate(arr, direction, true);

            for (let j = 0; j < turnedArray.length; j++) {
                this.shiftArray(turnedArray[j]);
            }

            const newArr = this.rotate(turnedArray, direction, false);

            if(arr.join(',') !== newArr.join(',')){
                this.pushToQueue(newArr, 'shift');
                arr = newArr;
            }
        }

        this.setState({ gameArray: arr });
    };

    mergeTiles  = (direction) => {
        let arr = this.cloneArray(this.state.gameArray);

        let turnedArray = this.rotate(arr, direction, true);
        let targets     = [];

        for (let i = 0; i < turnedArray.length; i++) {

            const mergeProps = this.mergeArray(turnedArray[i], i);

            if (mergeProps.isMerged) {
                const mergedItems = this.getTargets(mergeProps.target, direction, i);
                targets.push(...mergedItems);
            }
        }

        const newArr = this.rotate(turnedArray, direction, false);

        if (arr.join(',') !== newArr.join(',')) {
            this.pushToQueue(newArr, 'merge', targets);
            this.setState({ gameArray: newArr });
        }
    };

    generateTile  = (newGame = false) => {
        if ( !newGame && (this.state.queue.length === 0) ) return;

        let arr  = (newGame) ? this.getNewGameArray()
            : this.cloneArray(this.state.gameArray);

        let arrI = [];
        let arrJ = arr.map( (itemArr, i) => {

            let arrTmp = [];
            itemArr.forEach( (item, j) => {
                if (item === 0) arrTmp.push(j);
            });

            if (arrTmp.length > 0) arrI.push(i);

            return arrTmp;
        });
        if (arrI.length === 0) return;

        const randomI   = this.randomInRange(0, arrI.length-1);
        const indexI    = arrI[randomI];
        const randomJ   = this.randomInRange(0, arrJ[indexI].length-1);
        const indexJ    = arrJ[indexI][randomJ];

        arr[indexI][indexJ] = 2;

        this.pushToQueue(arr, 'new', [{ i: indexI, j: indexJ }]);
        this.setState({ gameArray: arr });
    };

    pushToQueue = (arr, type = '', targets = []) => {
        let queue = this.state.queue;
        let view;

        switch (type.toLowerCase()) {

            case "new":
                view = this.getView(arr);
                targets.forEach( (item) => {
                    view[item.i][item.j].animation = type.toLowerCase();
                });
                queue.push(view);
                break;

            case "merge":
                let flashView   = this.getView(arr);
                view            = this.getView(arr);

                targets.forEach( (item) => {
                    flashView[item.i][item.j].animation = 'merge-flash';
                    view[item.i][item.j].animation      = 'merge';
                });

                queue.push(flashView);
                queue.push(view);
                break;

            default:
                view = this.getView(arr);
                queue.push(view);
                break;
        }

        this.setState({ queue });
    };

    getView = (gameArray) => {

        return gameArray.map((arr) => {
            return arr.map((item) => {
                return {
                    value:      item,
                    animation:  ''
                };
            });
        });
    };

    showView = () => {
        if (this.state.queue.length === 0) return;

        let queue   = this.state.queue;
        const view  = queue.shift();

        this.setState({ queue, view }, () => {

            if (this.state.queue.length === 0) {
                this.checkForVictory();
            } else {
                setTimeout(() => { this.showView() }, 20);
            }

        });
    };

    checkForVictory = () => {
        if (!this.state.isStarted) return;

        let isVictory = false;

        this.state.gameArray.forEach(function (item) {
            if (item.indexOf(2048) !== -1) {
                isVictory = true;
            }
        });

        if(isVictory) {
            this.setState({
                isStarted:  false,
                isVictory:  true,
                isLoss:     false
            });
            this.saveResults();
        } else {
            this.checkForLoss();
        }
    };

    checkForLoss = () => {
        let arr = this.cloneArray(this.state.gameArray);

        let noShift   = true;
        let noMerge   = true;

        ["up","down","left","right"].forEach( (direction) => {

            let turnedArray = this.rotate(arr, direction, true);
            turnedArray.forEach( (item) => {

                //-------- check shift --------

                // no empty - no shift
                if (item.indexOf(0) !== -1) {

                    // if there are empty - find indexes
                    let indexEmpty = "";
                    item.forEach( (itemK, k) => {
                        if (itemK === 0) {
                            indexEmpty +=  k.toString();
                        }
                    });

                    // already sorted - no shift
                    if ((indexEmpty !== "0123") && (indexEmpty !== "123")
                        && (indexEmpty !== "23") && (indexEmpty !== "3")) {
                        noShift = false;
                    }
                }

                //-------- check merge --------

                // if there are empty - find indexes
                let indexEmpty  = "";
                item.forEach( (itemK, k) => {
                    if (itemK === 0) {
                        indexEmpty = indexEmpty + k.toString();
                    }
                });

                // already sorted - no shift
                if ((indexEmpty !== "0123") && (indexEmpty !== "123")) {

                    for(let k = 0; k < item.length; k++){

                        if((k+1 < item.length) && (item[k] !== 0)){
                            if(item[k] === item[k+1]){
                                noMerge = false;
                                break;
                            }
                        }
                    }
                }
            });

            const newArr = this.rotate(turnedArray, direction, false);
            if(arr.join(',') !== newArr.join(',')){
                arr = newArr;

            }

        });

        if ((noShift) && (noMerge)) {
            this.setState({
                isStarted:  false,
                isLoss:     true
            });
            this.saveResults();
        }
    };

    addToScore = (value) => {

        let score = this.state.score;
        score += value;

        this.setState({ score });
    };

    saveResults = () => {

        let saves = this.getEmptySaves();
        saves.bestScore = this.state.score;
        saves.bestTile  = this.getMaxTile();

        let lastSaves = JSON.parse(localStorage.getItem('game-2048'));
        if (!lastSaves) lastSaves = this.getEmptySaves();

        if (lastSaves.bestScore > saves.bestScore) saves.bestScore = lastSaves.bestScore;
        if (lastSaves.bestTile > saves.bestTile) saves.bestTile = lastSaves.bestTile;

        localStorage.setItem('game-2048', JSON.stringify(saves));
    };

    getEmptySaves = () => {
        return { bestScore: 0, bestTile: 0 };
    };

    //-------- handlers --------

    handleKeystroke = (event) => {

        const key = event.keyCode || event.key || event.which;
        const direction = this.getDirection(key);

        this.startSliding(direction);
    };

    handleStart = () => {

        this.setState({
            isStarted:  true,
            isVictory:  false,
            isLoss:     false,
            gameArray:  this.getNewGameArray(),
            queue:      [],
            score:      0
        });

        this.generateTile(true);
        this.showView();
    };

    handleModalClose = () => {
        this.setState({
            isVictory:  false,
            isLoss:     false
        });
    };

    handleExpandChange = (expanded) => {
        this.setState({ infoExpanded: expanded });
    };

    handleToggleInfo = (event, toggle) => {
        this.setState({ infoExpanded: toggle });
    };

    //-------- render --------

    render() {
        return (
            <div className="game-2048">
                <Card
                    expanded={this.state.infoExpanded}
                    onExpandChange={this.handleExpandChange}
                >

                    <GameControls
                        handleStart={this.handleStart}
                        score={this.state.score}
                    />

                    <Divider />

                    <CardMedia >
                        <GameField
                            view={this.state.view}
                            matrixSize={this.state.matrixSize}
                            onSlide={this.startSliding}
                        />
                    </CardMedia>

                    <Divider />

                    <CardText>
                        <Toggle
                            toggled={this.state.infoExpanded}
                            onToggle={this.handleToggleInfo}
                            labelPosition="right"
                            label="How to play"
                        />
                    </CardText>
                    <CardText expandable={true}>
                        Use your arrow keys to move the tiles.
                        When two tiles with the same number touch,
                        they merge into one!
                    </CardText>

                </Card>

                <ModalDialog
                    isOpen={this.state.isVictory}
                    isVictory={this.state.isVictory}
                    title="YOU WIN ! ! ! !"
                    onClose={this.handleModalClose}
                />
                <ModalDialog
                    isOpen={this.state.isLoss}
                    isVictory={this.state.isVictory}
                    title="YOU LOSS! LOSER!"
                    onClose={this.handleModalClose}
                />
            </div>
        );
    }
}

export default Game2048;
