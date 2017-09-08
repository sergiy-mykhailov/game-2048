
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
        this.setState({
            gameArray: gameArray
        });

        this.pushToQueue(gameArray, 'init');
        this.showView();
    }

    componentDidMount() {
        document.onkeyup = this.handleKeystroke;
    }

    componentWillUnmount() {
        this.saveResults();
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

        if (Array.isArray(arr)) {
            let clone = [];

            arr.forEach( (item) => {
                clone.push(this.cloneArray(item));
            });

            return clone;
        } else {
            return arr;
        }
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
        let shiftAllowed = false;
        let target = [];

        if( this.isShiftAllowed(arr) ) {

            for(let i = 1; i < arr.length; i++) {
                if ((arr[i] !== 0)  && (arr[i-1] === 0 )) {

                    arr[i - 1] = arr[i];
                    arr[i] = 0;

                    shiftAllowed = true;
                    target.push(i);
                    break;
                }
            }
        }

        return { isShifted: shiftAllowed, target: target };
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

    shiftTiles  = (direction) => {
        let arr = this.cloneArray(this.state.gameArray);

        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr[i].length; j++) {

                let turnedArray     = this.rotate(arr, direction, true);
                const shiftProps    = this.shiftArray(turnedArray[i]);

                if (shiftProps.isShifted) {
                    const newArr = this.rotate(turnedArray, direction, false);

                    if(arr.join(',') !== newArr.join(',')){

                        const targets = this.getTargets(shiftProps.target, direction, i);
                        this.pushToQueue(newArr, 'shift', targets);
                        arr = newArr;
                    }
                }
            }
        }

        this.setState({
            gameArray: arr
        });
    };

    mergeTiles  = (direction) => {
        let arr = this.cloneArray(this.state.gameArray);

        for (let i = 0; i < arr.length; i++) {

            let turnedArray     = this.rotate(arr, direction, true);
            const mergeProps    = this.mergeArray(turnedArray[i], i);

            if (mergeProps.isMerged) {
                const newArr = this.rotate(turnedArray, direction, false);

                if (arr.join(',') !== newArr.join(',')) {

                    const targets = this.getTargets(mergeProps.target, direction, i);
                    this.pushToQueue(newArr, 'merge', targets);
                    arr = newArr;
                }
            }
        }

        this.setState({
            gameArray: arr
        });
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

        this.setState({
            gameArray: arr
        });
    };

    pushToQueue = (arr, type = '', targets = []) => {
        let queue = this.state.queue;

        switch (type.toLowerCase()) {

            case "new":
            case "shift":
                targets.forEach( (item) => {

                    let view = this.getView(arr);
                    view[item.i][item.j].animation = type.toLowerCase();
                    queue.push(view);

                });
                break;

            case "merge":
                targets.forEach( (item) => {

                    let flashView = this.getView(arr);
                    flashView[item.i][item.j].animation = 'merge-flash';
                    queue.push(flashView);

                    let view = this.getView(arr);
                    view[item.i][item.j].animation = 'merge';
                    queue.push(view);

                });
                break;

            default:
                let view = this.getView(arr);
                queue.push(view);
                break;
        }

        this.setState({
            queue: queue
        });
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

        this.setState({
            queue:  queue,
            view:   view
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

        this.setState({
            score:  score
        });
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
        if ((this.state.queue.length !== 0) || (!this.state.isStarted)) return;

        this.setState({ queue: [] });

        const key = event.keyCode || event.code;
        const direction = this.getDirection(key);

        this.shiftTiles(direction);
        this.mergeTiles(direction);
        this.generateTile();
        this.showView();
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

    handleTransitionEnd = (event) => {
        if (event.target.classList.contains("tile")) {

            this.showView();

            if (this.state.queue.length === 0) this.checkForVictory();
        }
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
                <Card expanded={this.state.infoExpanded}
                      onExpandChange={this.handleExpandChange}>

                    <GameControls
                        handleStart={this.handleStart}
                        score={this.state.score}
                    />

                    <Divider />

                    <CardMedia >
                        <GameField
                            view={this.state.view}
                            matrixSize={this.state.matrixSize}
                            onTransitionEnd={this.handleTransitionEnd}
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
