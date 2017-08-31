// Created by Sergiy Mykhailov on 04.06.2015.
;
var jQuery =  require('jquery');

window.Game2048 = (function() {

    /**
     * Constructor.
     *
     * @private
     * @param {string} cssSelector The css-selector.
     * @param {Object} options The default options.
     */
    function Game2048(cssSelector, options) {

        this.container = (cssSelector) ? cssSelector : 'body';

        // default options
        var defaultOptions = {
            backgroundColor:    "#FAF8EF",
            fieldColor:         "#BBADA0",
            emptyColor:         "#CDC1B4",
            fullColor:          "#EEE4DA",
            textColor:          "#776E65",
            controlsColor:      "#8F7A66",
            elemSize:           80,
            elemSpace:          10,
            animationDelay:     20,
            gameWidth:          4,
            gameHeight:         4
        };
        this._options = jQuery.extend({}, defaultOptions, options);

        this._delay       = this._options.animationDelay;
        this._gameArray   = this._createGameArray(this._options.gameWidth, this._options.gameHeight);

        this._animationsHistory   = [];
        this._movingHistory       = [];
        this._animSum             = 0;
        this._canMove             = false;

        this.initialize();

    }

    //-------- initialize elements --------

    Game2048.prototype._createGameArray = function(gameWidth, gameHeight) {

        //newGameArray = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
        var newGameArray = [];

        for (var i = 0; i < gameHeight; i++) {
            newGameArray.push([]);

            for (var j = 0; j < gameWidth; j++) {
                newGameArray[i].push(0);
            }
        }
        return newGameArray;
    };

    Game2048.prototype.initialize = function() {

        this._appendTags2048();
        this._updateField2048();
        this._initialize2048Style();
        this._updateElementStyle();
        this._initialize2048Position();
        this._addHandlers();

    };

    Game2048.prototype._appendTags2048 = function() {


        jQuery(this.container).append('<div class="wrapper2048"></div>');

        jQuery('.wrapper2048')
            .append('<div class="controls2048"></div>')
            .append('<div class="field2048"></div>')
            .append('<div class="controlDescription2048">Keyboard controls:<br>s - start game<br>Up, Down, Left, Right - move elements</div>')
            .append('<div class="victory2048">YOU WIN ! ! ! !</div>')
            .append('<div class="loss2048">YOU LOSS! LOSER!</div>')
        ;

        jQuery('.controls2048')
            .append('<div class="start2048">New Game</div>')
            .append('<div class="score2048">Clicks: <strong class="clickCont2048">0</strong> Score: <strong class="sum2048">0</strong></div>')
        ;

        for (var i = 0; i < this._gameArray.length; i++) {
            for (var j = 0; j < this._gameArray[i].length; j++) {
                jQuery('.field2048').append('<div class=\"s' + i.toString() + j.toString() + ' square2048\"></div>');
            }
        }

        jQuery('.victory2048, .loss2048').hide();
    };

    Game2048.prototype._updateField2048 = function() {

        for (var i = 0; i < this._gameArray.length; i++) {
            for (var j = 0; j < this._gameArray[i].length; j++) {

                var elem = jQuery('.s' + i.toString() + j.toString());
                elem
                    .removeClass()
                    .addClass('square2048')
                    .addClass('s' + i.toString() + j.toString());

                if(this._gameArray[i][j] === 0){
                    elem.text("").addClass('empty2048');
                }else{
                    elem.text(this._gameArray[i][j]).addClass('n' + this._gameArray[i][j]);
                }

            }
        }

    };

    Game2048.prototype._initialize2048Style = function() {

        var properties = this._options;

        jQuery('.wrapper2048').css({
            "position":         "relative",
            "margin":           "auto",
            "width":            properties.elemSize*properties.gameWidth +
            properties.elemSpace*(properties.gameWidth + 3),
            "height":           properties.elemSize*properties.gameHeight +
            properties.elemSpace*(properties.gameHeight + 5) + 70 + 70,
            "border":           "1px solid #ccc",
            "background-color": properties.backgroundColor
        });
        jQuery('.controls2048').css({
            "position":         "relative",
            "margin":           "auto",
            "margin-top":       properties.elemSpace,
            "width":            properties.elemSize*properties.gameWidth +
            properties.elemSpace*(properties.gameWidth + 1), //"370px",
            "height":           "60px",
            "background-color": properties.fieldColor
        });
        jQuery('.start2048').css({
            "position":         "absolute",
            "margin-left":      "10px",
            "margin-top":       "10px",
            "padding":          "10px 0 0 20px",
            "width":            "100px",
            "height":           "30px",
            "background-color": properties.controlsColor,
            "color":            properties.fullColor,
            "cursor":           "pointer"
        });
        jQuery('.score2048').css({
            "position":         "absolute",
            "left":             "130px",
            "margin-left":      "20px",
            "margin-top":       "10px",
            "padding":          "10px 0 0 0",
            "width":            "210px",
            "height":           "30px",
            "color":            properties.fullColor
        });
        jQuery('.field2048').css({
            "position":         "relative",
            "margin":           "auto",
            "margin-top":       properties.elemSpace,
            "width":            properties.elemSize*properties.gameWidth +
            properties.elemSpace*(properties.gameWidth + 1),
            "height":           properties.elemSize*properties.gameHeight +
            properties.elemSpace*(properties.gameHeight + 1),
            "background-color": properties.fieldColor
        });
        jQuery('.victory2048, .loss2048').css({
            "position":         "absolute",
            "top":              "220px",
            "left":             "-50px",
            "padding":          "18px 0 0 0",
            "width":            "470px",
            "height":           "82px",
            "text-align":       "center",
            "text-valign":      "center",
            "font-size":        "3em",
            "font-family":      "'Cooper Black', 'Showcard Gothic', 'Berlin Sans FB Demi', 'Microsoft Yi Baiti', Arial, sans-serif "
        });
        jQuery('.victory2048').css({
            "color":            "#EDC53F",  //"#F02151",
            "background-color": "#F65E3B"   //"#FFFFC9"   //"#F0CE6A"
        });
        jQuery('.loss2048').css({
            "color":            "#FFFFC9",
            "background-color": "#541D1D"
        });
        jQuery('.controlDescription2048').css({
            "margin":           "auto",
            "margin-top":       properties.elemSpace,
            "padding":          "5px 0 0 10px",
            "width":            properties.elemSize*properties.gameWidth +
            properties.elemSpace*(properties.gameWidth + 1) - 10,
            "height":           "70px",
            "color":            properties.controlsColor,
            "background-color": properties.fieldColor
        });
        jQuery('.square2048').css({
            "position":         "absolute",
            "width":            properties.elemSize,
            "text-align":       "center",
            "font-family":      "'Cooper Black', 'Showcard Gothic', 'Berlin Sans FB Demi', 'Microsoft Yi Baiti', Arial, sans-serif ",
            "font-weight":      "900",
            "cursor":           "pointer"
        });

    };

    Game2048.prototype._updateElementStyle = function() {

        var properties = this._options;

        jQuery('.empty2048').css({
            "padding-top":      properties.elemSize*0.1,
            "height":           properties.elemSize*0.9,
            "background-color": properties.emptyColor
        });

        jQuery('.n2').css({
            "padding-top":      properties.elemSize*0.1,
            "height":           properties.elemSize*0.9,
            "background-color": properties.fullColor,
            "color":            properties.textColor,
            "font-size":        "3em"
        });
        jQuery('.n4').css({
            "padding-top":      properties.elemSize*0.1,
            "height":           properties.elemSize*0.9,
            "background-color": "#EDE0C8",
            "color":            properties.textColor,
            "font-size":        "3em"
        });
        jQuery('.n8').css({
            "padding-top":      properties.elemSize*0.1,
            "height":           properties.elemSize*0.9,
            "background-color": "#F2B179",
            "color":            properties.fullColor,
            "font-size":        "3em"
        });
        jQuery('.n16').css({
            "padding-top":      properties.elemSize*0.1,
            "height":           properties.elemSize*0.9,
            "background-color": "#F59563",
            "color":            properties.fullColor,
            "font-size":        "3em"
        });
        jQuery('.n32').css({
            "padding-top":      properties.elemSize*0.1,
            "height":           properties.elemSize*0.9,
            "background-color": "#F67C5F",
            "color":            properties.fullColor,
            "font-size":        "3em"
        });
        jQuery('.n64').css({
            "padding-top":      properties.elemSize*0.1,
            "height":           properties.elemSize*0.9,
            "background-color": "#F65E3B",
            "color":            properties.fullColor,
            "font-size":        "3em"
        });
        jQuery('.n128').css({
            "padding-top":      properties.elemSize*0.15,
            "height":           properties.elemSize*0.85,
            "background-color": "#EDCF72",
            "color":            properties.fullColor,
            "font-size":        "2.5em"
        });
        jQuery('.n256').css({
            "padding-top":      properties.elemSize*0.15,
            "height":           properties.elemSize*0.85,
            "background-color": "#EDCC61",
            "color":            properties.fullColor,
            "font-size":        "2.5em"
        });
        jQuery('.n512').css({
            "padding-top":      properties.elemSize*0.15,
            "height":           properties.elemSize*0.85,
            "background-color": "#EDC850",
            "color":            properties.fullColor,
            "font-size":        "2.5em"
        });
        jQuery('.n1024').css({
            "padding-top":      properties.elemSize*0.2,
            "height":           properties.elemSize*0.8,
            "background-color": "#EDC53F",
            "color":            properties.fullColor,
            "font-size":        "2em"
        });
        jQuery('.n2048').css({
            "padding-top":      properties.elemSize*0.2,
            "height":           properties.elemSize*0.8,
            "background-color": "#171EED",
            "color":            properties.fullColor,
            "font-size":        "2em"
        });

    };

    Game2048.prototype._initialize2048Position = function() {

        for (var i = 0; i < this._gameArray.length; i++) {

            var elemTop = this._options.elemSpace +
                (i * this._options.elemSize + i * this._options.elemSpace);

            for (var j = 0; j < this._gameArray[i].length; j++) {

                var elemLeft = this._options.elemSpace +
                    (j * this._options.elemSize + j * this._options.elemSpace);

                jQuery('.s' + i.toString() + j.toString()).css({
                    "top":  elemTop,
                    "left": elemLeft
                });

            }
        }

    };

    Game2048.prototype._addHandlers = function() {

        var self = this;

        // start game
        jQuery('.start2048').click(function () {

            jQuery('.clickCont2048').text(0);
            jQuery('.sum2048').text(0);

            //this._gameArray = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
            self._gameArray   = self._createGameArray(self._options.gameWidth, self._options.gameHeight);

            self._movingHistory       = [];
            self._animationsHistory   = [];

            self._gameArray = self._generateNewNumber(self._gameArray);

            self._updateField2048();
            self._updateElementStyle();

            self._canMove = true;
            jQuery(".loss2048 audio").remove();

        });

        // keyboard control
        jQuery(document).keydown(function (eventObject) {

            if(eventObject.which === 83) {       // s
                jQuery('.start2048').click();
            }else if(eventObject.which === 32){  // пробел
                self._canMove = true;
            }else{
                if(self._canMove) {
                    self._canMove = false;
                    self._animSum = 0;
                    self._movingHistory       = [];
                    self._animationsHistory   = [];

                    var direction = "";
                    switch (eventObject.which) {
                        case 38:
                            direction = "up";
                            break;
                        case 40:
                            direction = "down";
                            break;
                        case 37:
                            direction = "left";
                            break;
                        case 39:
                            direction = "right";
                            break;
                    }

                    // сдвиг элементов
                    self._shiftElements(self._gameArray.concat(), direction);

                    // суммирование элементов
                    if (self._movingHistory.length > 0) {
                        self._sumElements(self._movingHistory[self._movingHistory.length - 1].concat(), direction);
                    } else {
                        self._sumElements(self._gameArray.concat(), direction);
                    }

                    // добавление нового элемента
                    if (self._movingHistory.length > 0) {
                        var newGameArray = self._generateNewNumber(self._movingHistory[self._movingHistory.length - 1].concat());
                        self._movingHistory.push(newGameArray.concat());
                    }

                    // добавить последний элемент для проверки выиграша
                    self._movingHistory.push("checkForVictory");

                    // запуск анимации
                    self._movingHistory.forEach(function (itemH, i) {
                        var newDelay = self._delay * (i + 1);
                        if (i === self._movingHistory.length - 2) {
                            newDelay = newDelay + self._delay * 5;
                        }

                        if (self._movingHistory.length > 1) {
                            setTimeout(function () {
                                if (self._movingHistory.length > 1) {

                                    if ((itemH === "checkForVictory")) {
                                        self._checkForVictory(self._movingHistory[self._movingHistory.length - 2].concat());
                                    } else {
                                        itemH.forEach(function (item, k) {
                                            self._gameArray[k] = item.concat();
                                        });
                                        self._updateField2048();
                                        self._updateElementStyle();
                                        self._animateElement(i);
                                    }
                                }
                            }, newDelay);
                        }
                    });

                    // обновить счетчики
                    if (self._movingHistory.length > 1) {
                        jQuery('.clickCont2048').text(Number(jQuery('.clickCont2048').text()) + 1);
                    } else {
                        self._canMove = true;
                    }
                }
            }
        });

        // check winning
        jQuery('.victory2048').click(function () {

            jQuery('.victory2048').fadeOut(2000);
            jQuery('.controls2048').fadeTo(2000,1);
            jQuery('.field2048').fadeTo(2000,1);
            jQuery('.controlDescription2048').fadeTo(2000,1);

        });

        // check winning
        jQuery('.loss2048').click(function () {

            jQuery('.loss2048').fadeOut(2000);
            jQuery('.controls2048').fadeTo(2000,1);
            jQuery('.field2048').fadeTo(2000,1);
            jQuery('.controlDescription2048').fadeTo(2000,1);

        });

    };

    //-------- move of elements --------

    Game2048.prototype._generateNewNumber = function(lastGameArray) {

        var randomArray = [];
        var randomArrayI = [];
        var newGameArray = [];
        lastGameArray.forEach(function (item) {
            newGameArray.push(item.concat());
        });


        for (var i = 0; i < newGameArray.length; i++) {

            var randomArrayJ = [];

            for (var j = 0; j < newGameArray[i].length; j++) {
                if(newGameArray[i][j] === 0){
                    randomArrayJ.push(j);
                }
            }
            randomArray.push(randomArrayJ);
            if(randomArrayJ.length > 0){
                randomArrayI.push(i);
            }
        }

        if(randomArrayI.length > 0) {

            var randomIndexI = this._randomInRange(0, randomArrayI.length-1);
            var indexI = randomArrayI[randomIndexI];

            var randomIndexJ = this._randomInRange(0, randomArray[indexI].length-1);
            var indexJ = randomArray[indexI][randomIndexJ];

            newGameArray[indexI][indexJ] = 2;

            // запомнить позицию анимированного элемента
            this._animationsHistory[this._movingHistory.length] = [{
                index:  this._movingHistory.length,
                type:   "new",
                i:      indexI,
                j:      indexJ
            }];

        }

        var resultArray = [];
        newGameArray.forEach(function (item) {
            resultArray.push(item.concat());
        });

        return resultArray;
    };

    Game2048.prototype._shiftElements = function(gameArray, direction){

        var OldGameArray = [];
        gameArray.forEach(function (item) {
            OldGameArray.push(item.concat());
        });

        for (var i = 0; i < OldGameArray.length; i++) {

            for (var j = 0; j < OldGameArray[i].length; j++) {

                // turn
                var turnedArray = this._turnForward(OldGameArray, direction);

                turnedArray[i] = this._shiftOneElement(turnedArray[i].concat());

                // turn
                var newGameArray = this._turnBack(turnedArray, direction);

                if(OldGameArray.join(',') !== newGameArray.join(',')){
                    this._movingHistory.push(newGameArray);
                    newGameArray.forEach(function (item,k) {
                        OldGameArray[k] = item.concat();
                    });
                }
            }
        }

    };

    Game2048.prototype._shiftOneElement = function(currentArray){

        var noShift = this._checkForEmptyShift(currentArray);

        if(!noShift){
            for(var i = 0; i < currentArray.length; i++){
                if(currentArray[i] === 0){
                    currentArray.splice(i,1);
                    currentArray.push(0);
                    break;
                }
            }
        }

        return currentArray.concat();
    };

    Game2048.prototype._sumElements = function(lastGameArray, direction){

        var OldGameArray = [];
        lastGameArray.forEach(function (item) {
            OldGameArray.push(item.concat());
        });

        for (var i = 0; i < OldGameArray.length; i++) {

            // turn
            var turnedArray = this._turnForward(OldGameArray, direction);

            turnedArray[i] = this._sumOneElement(turnedArray[i].concat(), i, direction);

            // turn
            var newGameArray = this._turnBack(turnedArray, direction);

            if(OldGameArray.join(',') !== newGameArray.join(',')){
                this._movingHistory.push(newGameArray);
                newGameArray.forEach(function (item,k) {
                    OldGameArray[k] = item.concat();
                });
            }
        }
    };

    Game2048.prototype._sumOneElement = function(currentArray, indexI, direction){

        var noShift = this._checkForEmptySum(currentArray);

        if(!noShift){
            var animationArray = [];
            for(var i = 0; i < currentArray.length; i++) {

                if ( (i + 1 < currentArray.length) && (currentArray[i] !== 0) ) {

                    if(currentArray[i] === currentArray[i+1]){
                        currentArray.splice(i,2,currentArray[i]*2);
                        currentArray.push(0);

                        jQuery('.sum2048').text(Number(jQuery('.sum2048').text()) + currentArray[i]);

                        // запомнить позицию анимированного элемента
                        var coordinates = this._findCoordinates(direction, indexI, i, currentArray.length);
                        animationArray.push({
                            index:  this._movingHistory.length,
                            type:   "sum",
                            i:      coordinates.indexI,
                            j:      coordinates.indexJ
                        });
                    }
                }
            }
            this._animationsHistory[this._movingHistory.length] = animationArray;
            this._animSum = this._animSum + animationArray.length;
        }
        return currentArray.concat();
    };

    Game2048.prototype._animateElement = function(i){

        if(this._animationsHistory[i] !== undefined) {

            var self = this;
            this._animationsHistory[i].forEach(function (elemPosition, j) {

                var elem = jQuery('.s' + elemPosition.i.toString() + elemPosition.j.toString());
                var reg = /\d+/g;
                var elemWidth       = Number(elem.css("width").match(reg));
                var elemHeight      = Number(elem.css("height").match(reg));
                var elemLeft        = Number(elem.css("left").match(reg));
                var elemTop         = Number(elem.css("top").match(reg));
                var elemPaddingTop  = Number(elem.css("padding-top").match(reg));

                if (elemPosition.type === "new") {

                    elem
                        .css({
                            'width':    '0',
                            'height':   '0',
                            'left':     elemLeft + elemWidth / 2,
                            'top':      elemTop + elemHeight / 2
                        })
                        .animate({
                                'width':    elemWidth,
                                'height':   elemHeight,
                                'left':     elemLeft,
                                'top':      elemTop
                            }
                            , self._delay * 4
                            , function () {
                                if(self._animSum === 0){
                                    self._canMove = true;
                                }
                            })
                    ;
                } else if(elemPosition.type === "sum") {

                    elem
                        .animate({
                                'padding-top':    elemPaddingTop + 2,
                                'width':    elemWidth + 4,
                                'height':   elemHeight + 4,
                                'left':     elemLeft - 2,
                                'top':      elemTop - 2
                            }
                            , self._delay * 4)
                        .animate({
                                'padding-top':    elemPaddingTop,
                                'width':    elemWidth,
                                'height':   elemHeight,
                                'left':     elemLeft,
                                'top':      elemTop
                            }
                            , self._delay * 8
                            , function () {
                                self._animSum--;
                                if(self._animSum === 0){
                                    self._canMove = true;
                                }
                            })
                    ;
                }
            });
        }

    };

    //-------- accessory functions --------

    Game2048.prototype._randomInRange = function(start, finish){

        return Math.floor(( Math.random() * (finish - start + 1) ) + start);

    };

    Game2048.prototype._turnForward = function(currentArray, direction){

        var turnedArray = [];
        currentArray.forEach(function (item) {
            turnedArray.push(item.concat());
        });

        switch (direction){
            case "up":
                var upArray = this._createGameArray(this._options.gameWidth, this._options.gameHeight);
                turnedArray.forEach(function (item,i) {
                    item.reverse();
                    item.forEach(function (itemJ,j) {
                        upArray[j][i] = itemJ;
                    });
                });
                upArray.forEach(function (item,i) {
                    turnedArray[i] = item.concat();
                });
                break;

            case "down":
                var downArray = this._createGameArray(this._options.gameWidth, this._options.gameHeight);
                turnedArray.reverse();
                turnedArray.forEach(function (item,i) {
                    item.forEach(function (itemJ,j) {
                        downArray[j][i] = itemJ;
                    });
                });
                downArray.forEach(function (item,i) {
                    turnedArray[i] = item.concat();
                });
                break;

            case "left":
                // no turn
                break;

            case "right":
                turnedArray.forEach(function (item) {
                    item.reverse();
                });
                break;
        }

        var resultArray = [];
        turnedArray.forEach(function (item) {
            resultArray.push(item.concat());
        });
        return resultArray.concat();
    };

    Game2048.prototype._turnBack = function(currentArray, direction){

        var turnedArray = [];
        currentArray.forEach(function (item) {
            turnedArray.push(item.concat());
        });

        switch (direction){
            case "up":
                var upArray = this._createGameArray(this._options.gameWidth, this._options.gameHeight);
                turnedArray.reverse();
                turnedArray.forEach(function (item,i) {
                    item.forEach(function (itemJ,j) {
                        upArray[j][i] = itemJ;
                    });
                });
                upArray.forEach(function (item,i) {
                    turnedArray[i] = item.concat();
                });
                break;

            case "down":
                var downArray = this._createGameArray(this._options.gameWidth, this._options.gameHeight);
                turnedArray.forEach(function (item,i) {
                    item.reverse();
                    item.forEach(function (itemJ,j) {
                        downArray[j][i] = itemJ;
                    });
                });
                downArray.forEach(function (item,i) {
                    turnedArray[i] = item.concat();
                });
                break;

            case "left":
                // no turn
                break;

            case "right":
                turnedArray.forEach(function (item) {
                    item.reverse();
                });
                break;
        }

        var resultArray = [];
        turnedArray.forEach(function (item) {
            resultArray.push(item.concat());
        });
        return resultArray.concat();

    };

    Game2048.prototype._checkForVictory = function(currentArray){

        var isVictory = false;
        jQuery('.victory2048').hide();

        currentArray.forEach(function (item, i) {
            if (item.indexOf(2048) !== -1) {
                isVictory = true;
                jQuery('.victory2048').fadeIn(3000);
                jQuery('.controls2048').fadeTo(3000,0.5);
                jQuery('.field2048').fadeTo(3000,0.5);
                jQuery('.controlDescription2048').fadeTo(3000,0.5);
            }
        });

        if(!isVictory) {
            this._checkForLoss(currentArray);
        }
    };

    Game2048.prototype._checkForLoss = function(gameArray){

        var self = this;

        var OldGameArray = [];
        gameArray.forEach(function (item) {
            OldGameArray.push(item.concat());
        });

        jQuery('.loss2048').hide();
        jQuery(".loss2048 audio").remove();

        var possibleShift   = false;
        var possibleSum     = false;

        var directionArray = ["up","down","left","right"];
        directionArray.forEach(function (direction) {

            var turnedArray = self._turnForward(OldGameArray, direction);

            turnedArray.forEach(function (item, i) {

                //------------------------------------------------------------------------
                // check shift

                // если нет пустых - не сдвигаем
                if (item.indexOf(0) !== -1) {

                    // если есть пустые - найти индексы пустых
                    var indexEmpty = "";
                    item.forEach(function (itemK, k) {
                        if (itemK === 0) {
                            indexEmpty = indexEmpty + k.toString();
                        }
                    });
                    // если уже упорядочено - не сдвигаем
                    if ((indexEmpty === "0123") || (indexEmpty === "123") || (indexEmpty === "23") || (indexEmpty === "3")) {
                    }else{
                        possibleShift = true;
                    }
                }

                //------------------------------------------------------------------------
                // check sum

                // если есть пустые - найти индексы пустых
                var indexEmpty  = "";
                item.forEach(function (itemK, k) {
                    if (itemK === 0) {
                        indexEmpty = indexEmpty + k.toString();
                    }
                });
                // если все нули - не сдвигаем
                if ((indexEmpty === "0123") || (indexEmpty === "123")) {
                }else{
                    for(var k=0;k<item.length;k++){
                        if((k+1 < item.length) && (item[k] !== 0)){
                            if(item[k] === item[k+1]){
                                possibleSum     = true;
                                break;
                            }
                        }
                    }
                }
            });
            var newGameArray = self._turnBack(turnedArray, direction);

            if(OldGameArray.join(',') !== newGameArray.join(',')){
                newGameArray.forEach(function (item,k) {
                    OldGameArray[k] = item.concat();
                });
            }

        });

        if ((!possibleShift) && (!possibleSum)) {
            jQuery('.loss2048').fadeIn(3000);
            jQuery('.controls2048').fadeTo(3000,0.5);
            jQuery('.field2048').fadeTo(3000,0.5);
            jQuery('.controlDescription2048').fadeTo(3000,0.5);

            var audioArray = [
                "http://zvuki-mp3.com/download/26216_48671-lq.mp3"
                ,"http://zvuki-mp3.com/download/37733_384275-lq.mp3"
                , "http://zvuki-mp3.com/download/48449_180659-lq.mp3"
                , "http://zvuki-mp3.com/download/63979_384275-lq.mp3"
                , "http://zvuki-mp3.com/download/53922_384275-lq.mp3"
            ];

            var randAudioSrc = this._randomInRange(0, audioArray.length);
            jQuery('.loss2048').append('<audio src="' + audioArray[randAudioSrc] + '" autoplay="autoplay"></audio>');

        }
    };

    Game2048.prototype._findCoordinates = function(direction, i, j, arrayLength){
        var newI = null, newJ = null;

        switch (direction){
            case "up":
                newI = j;
                newJ = arrayLength - (i+1);
                break;

            case "down":
                newI = arrayLength - (j+1);
                newJ = i;
                break;

            case "left":
                newI = i;
                newJ = j;
                break;

            case "right":
                newI = i;
                newJ = arrayLength - (j+1);
                break;
        }

        return {
            indexI:      newI,
            indexJ:      newJ
        };
    };

    Game2048.prototype._checkForEmptyShift = function(currentArray) {

        var noShift     = false;
        var indexEmpty  = "";
        var indexArray  = [];

        if(currentArray.indexOf(0) === -1) {
            noShift = true;
        }else{
            // если есть пустые - найти индексы пустых
            currentArray.forEach(function (item, i) {
                if (item === 0) {
                    indexEmpty = indexEmpty + i.toString();
                }
            });

            for (var i = 0; i < currentArray.length; i++) {
                var str = "";
                for (var j = i; j < currentArray.length; j++) {
                    str += j.toString();
                }
                indexArray.push(str);
            }

            // если уже упорядочено - не сдвигаем
            if (indexArray.indexOf(indexEmpty) !== -1) {
                noShift = true;
            }
        }
        return noShift;
    };

    Game2048.prototype._checkForEmptySum = function(currentArray) {

        var noShift     = false;
        var indexEmpty  = "";
        var indexArray  = [];

        // если есть пустые - найти индексы пустых
        currentArray.forEach(function (item, i) {
            if (item === 0) {
                indexEmpty = indexEmpty + i.toString();
            }
        });

        for (var i = 0; i < currentArray.length; i++) {
            var str = "";
            for (var j = i; j < currentArray.length; j++) {
                str += j.toString();
            }
            indexArray.push(str);
        }
        indexArray.splice(2);

        // если уже упорядочено - не сдвигаем
        if (indexArray.indexOf(indexEmpty) !== -1) {
            noShift = true;
        }
        return noShift;
    };

    return Game2048;
})();

if (document.querySelector('.game-2048')) {
    var game2048 = new Game2048('.game-2048');
}
