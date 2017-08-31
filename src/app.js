// Created by Sergiy Mykhailov on 04.06.2015.
;
var jQuery =  require('jquery');

var gameArray           = [];
var animationsHistory   = [];
var movingHistory       = [];
var delay               = 0;
var animSum             = 0;
var canMove             = false;

var initialize2048 = function (properties) {

    // свойства по умолчанию
    if (!properties) properties = {};
    properties = Object.create(properties);
    properties.idParentWrapper  = properties.idParentWrapper    || "body";
    properties.backgroundColor  = properties.backgroundColor    || "#FAF8EF";
    properties.fieldColor       = properties.fieldColor         || "#BBADA0";
    properties.emptyColor       = properties.emptyColor         || "#CDC1B4";
    properties.fullColor        = properties.fullColor          || "#EEE4DA";
    properties.textColor        = properties.textColor          || "#776E65";
    properties.controlsColor    = properties.controlsColor      || "#8F7A66";
    properties.elemSize         = properties.elemSize           || 80;
    properties.elemSpace        = properties.elemSpace          || 10;
    properties.animationDelay   = properties.animationDelay     || 20;
    properties.gameWidth        = properties.gameWidth          || 4;
    properties.gameHeight       = properties.gameHeight         || 4;

    delay       = properties.animationDelay;
    gameArray   = createGameArray(properties.gameWidth, properties.gameHeight);

    //// test:
    //gameArray = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
    //gameArray = [[0,2,4,8], [16,32,64,128], [256,512,1024,0], [2048,0,0,0]];      // test
    //gameArray = [[0,0,2,4], [64,32,16,8], [128,256,512,1024], [0,0,0,0]];         // win
    //gameArray = [[0,0,0,0], [64,32,16,8], [128,256,512,1024], [0,0,0,1024]];      // win
    //gameArray = [[256,512,128,0], [64,32,16,8], [128,256,512,1024], [4,8,16,32]];   // loss
    //canMove = true;

    appendTags2048(gameArray, properties);
    updateField2048(gameArray);
    initialize2048Style(properties);
    updateElementStyle(properties);
    initialize2048Position(gameArray, properties);

    // start game
    jQuery('#start2048').click(function () {

        jQuery('#clickCont2048').text(0);
        jQuery('#sum2048').text(0);

        //gameArray = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
        gameArray   = createGameArray(properties.gameWidth, properties.gameHeight);

        movingHistory       = [];
        animationsHistory   = [];

        gameArray = generateNewNumber(gameArray);

        updateField2048(gameArray);
        updateElementStyle(properties);

        canMove = true;
        jQuery("#loss2048 audio").remove();

    });

    // keyboard control
    jQuery(document).keydown(function (eventObject) {

        if(eventObject.which == 83) {       // s
            jQuery('#start2048').click();
        }else if(eventObject.which == 32){  // пробел
            canMove = true; // временное решение проблемы залипания
        }else{
            if(canMove) {
                canMove = false;
                animSum = 0;
                movingHistory       = [];
                animationsHistory   = [];

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
                shiftElements(gameArray.concat(), direction, properties);

                // суммирование элементов
                if (movingHistory.length > 0) {
                    sumElements(movingHistory[movingHistory.length - 1].concat(), direction, properties);
                } else {
                    sumElements(gameArray.concat(), direction, properties);
                }

                // добавление нового элемента
                if (movingHistory.length > 0) {
                    var newGameArray = generateNewNumber(movingHistory[movingHistory.length - 1].concat());
                    movingHistory.push(newGameArray.concat());
                }

                // добавить последний элемент для проверки выиграша
                movingHistory.push("checkForVictory");


                // запуск анимации
                movingHistory.forEach(function (itemH, i) {
                    var newDelay = delay * (i + 1);
                    if (i == movingHistory.length - 2) {
                        newDelay = newDelay + delay * 5;
                    }

                    if (movingHistory.length > 1) {
                        setTimeout(function () {
                            if (movingHistory.length > 1) {
                                if ((itemH == "checkForVictory")) {
                                    checkForVictory(movingHistory[movingHistory.length - 2].concat(), properties);
                                } else {
                                    itemH.forEach(function (item, k) {
                                        gameArray[k] = item.concat();
                                    });
                                    updateField2048(gameArray);
                                    updateElementStyle(properties);
                                    animateElement(i, delay);
                                }
                            }
                        }, newDelay);
                    }
                });


                // обновить счетчики
                if (movingHistory.length > 1) {
                    jQuery('#clickCont2048').text(Number(jQuery('#clickCont2048').text()) + 1);
                } else {
                    canMove = true;
                }
            }
        }
    });

    // check winning
    jQuery('#victory2048').click(function () {

        jQuery('#victory2048').fadeOut(2000);
        jQuery('#controls2048').fadeTo(2000,1);
        jQuery('#field2048').fadeTo(2000,1);
        jQuery('#controlDescription2048').fadeTo(2000,1);

    });

    // check winning
    jQuery('#loss2048').click(function () {

        jQuery('#loss2048').fadeOut(2000);
        jQuery('#controls2048').fadeTo(2000,1);
        jQuery('#field2048').fadeTo(2000,1);
        jQuery('#controlDescription2048').fadeTo(2000,1);

    });


};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// initialize elements

function appendTags2048(gameArray, standardProperties) {

    jQuery(standardProperties.idParentWrapper).append('<div id="wrapper2048"></div>');

    jQuery('#wrapper2048')
        .append('<div id="controls2048"></div>')
        .append('<div id="field2048"></div>')
        .append('<div id="controlDescription2048">Keyboard controls:<br>s - start game<br>Up, Down, Left, Right - move elements</div>')
    ;

    jQuery('#controls2048')
        .append('<div id="start2048">New Game</div>')
        .append('<div id="score2048">Clicks: <strong id="clickCont2048">0</strong> Score: <strong id="sum2048">0</strong></div>')
    ;

    for (var i = 0; i < gameArray.length; i++) {
        for (var j = 0; j < gameArray[i].length; j++) {
            jQuery('#field2048').append('<div id=\"s' + i.toString() + j.toString() + '\" class =\"square2048\"></div>');
        }
    }

    jQuery('#wrapper2048')
        .append('<div id="victory2048">YOU WIN ! ! ! !</div>')
        .append('<div id="loss2048">YOU LOSS! LOSER!</div>')
    ;

    jQuery('#victory2048, #loss2048').hide();
}

function initialize2048Style(properties) {

    jQuery('#wrapper2048').css({
        "position":         "relative",
        "margin":           "auto",
        "width":            properties.elemSize*properties.gameWidth +
        properties.elemSpace*(properties.gameWidth + 3), //"390px",
        "height":           properties.elemSize*properties.gameHeight +
        properties.elemSpace*(properties.gameHeight + 5) + 70 + 70,  //"545px",
        "border":           "1px solid #ccc",
        "background-color": properties.backgroundColor
    });
    jQuery('#controls2048').css({
        "position":         "relative",
        "margin":           "auto",
        "margin-top":       properties.elemSpace,                           //"10px",
        "width":            properties.elemSize*properties.gameWidth +
        properties.elemSpace*(properties.gameWidth + 1), //"370px",
        "height":           "60px",
        "background-color": properties.fieldColor
    });
    jQuery('#start2048').css({
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
    jQuery('#score2048').css({
        "position":         "absolute",
        "left":             "130px",
        "margin-left":      "20px",
        "margin-top":       "10px",
        "padding":          "10px 0 0 0",
        "width":            "210px",
        "height":           "30px",
        "color":            properties.fullColor
    });
    jQuery('#field2048').css({
        "position":         "relative",
        "margin":           "auto",
        "margin-top":       properties.elemSpace,                               //"10px",
        "width":            properties.elemSize*properties.gameWidth +
        properties.elemSpace*(properties.gameWidth + 1),    //"370px",
        "height":           properties.elemSize*properties.gameHeight +
        properties.elemSpace*(properties.gameHeight + 1),   //"370px",
        "background-color": properties.fieldColor
    });
    jQuery('#victory2048, #loss2048').css({
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
    jQuery('#victory2048').css({
        "color":            "#EDC53F",  //"#F02151",
        "background-color": "#F65E3B"   //"#FFFFC9"   //"#F0CE6A"
    });
    jQuery('#loss2048').css({
        "color":            "#FFFFC9",
        "background-color": "#541D1D"
    });
    jQuery('#controlDescription2048').css({
        "margin":           "auto",
        "margin-top":       properties.elemSpace,                                       //"10px",
        "padding":          "5px 0 0 10px",
        "width":            properties.elemSize*properties.gameWidth +
        properties.elemSpace*(properties.gameWidth + 1) - 10,        //"360px",
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

}

function updateElementStyle(properties) {

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

}

function initialize2048Position(gameArray, properties) {

    for (var i = 0; i < gameArray.length; i++) {

        var elemTop = properties.elemSpace + (i * properties.elemSize + i * properties.elemSpace);

        for (var j = 0; j < gameArray[i].length; j++) {

            var elemLeft = properties.elemSpace + (j * properties.elemSize + j * properties.elemSpace);

            jQuery('#s' + i.toString() + j.toString()).css({
                "top":  elemTop,
                "left": elemLeft
            });

        }
    }

}

function updateField2048(gameArray) {

    for (var i = 0; i < gameArray.length; i++) {
        for (var j = 0; j < gameArray[i].length; j++) {

            var elem = jQuery('#s' + i.toString() + j.toString());
            elem.removeClass().addClass('square2048');
            if(gameArray[i][j] == 0){
                elem.text("").addClass('empty2048');
            }else{
                elem.text(gameArray[i][j]).addClass('n' + gameArray[i][j]);
            }

        }
    }

}

function createGameArray(gameWidth, gameHeight) {
    //newGameArray = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
    var newGameArray = [];
    for (var i = 0; i < gameHeight; i++) {
        newGameArray.push([]);
        for (var j = 0; j < gameWidth; j++) {
            newGameArray[i].push(0);
        }
    }
    return newGameArray;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// moving elements

function generateNewNumber(lastGameArray) {

    var randomArray = [];
    var randomArrayI = [];
    var newGameArray = [];
    lastGameArray.forEach(function (item) {
        newGameArray.push(item.concat());
    });


    for (var i = 0; i < newGameArray.length; i++) {

        var randomArrayJ = [];

        for (var j = 0; j < newGameArray[i].length; j++) {
            if(newGameArray[i][j] == 0){
                randomArrayJ.push(j);
            }
        }
        randomArray.push(randomArrayJ);
        if(randomArrayJ.length > 0){
            randomArrayI.push(i);
        }
    }

    if(randomArrayI.length > 0) {

        var randomIndexI = randomInRange(0, randomArrayI.length-1);
        var indexI = randomArrayI[randomIndexI];

        var randomIndexJ = randomInRange(0, randomArray[indexI].length-1);
        var indexJ = randomArray[indexI][randomIndexJ];

        newGameArray[indexI][indexJ] = 2;

        // запомнить позицию анимированного элемента
        animationsHistory[movingHistory.length] = [{
            index:  movingHistory.length,
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
}

function shiftElements(lastGameArray, direction, properties){

    var OldGameArray = [];
    lastGameArray.forEach(function (item) {
        OldGameArray.push(item.concat());
    });

    for (var i = 0; i < OldGameArray.length; i++) {

        for (var j = 0; j < OldGameArray[i].length; j++) {

            // turn
            var turnedArray = turnForward(OldGameArray, direction, properties);

            turnedArray[i] = shiftOneElement(turnedArray[i].concat());

            // turn
            var newGameArray = turnBack(turnedArray, direction, properties);

            if(OldGameArray.join(',') != newGameArray.join(',')){
                movingHistory.push(newGameArray);
                newGameArray.forEach(function (item,k) {
                    OldGameArray[k] = item.concat();
                });
            }
        }
    }

}

function shiftOneElement(currentArray){

    var noShift = checkForEmptyShift(currentArray);

    if(!noShift){
        for(var i=0;i<currentArray.length;i++){
            if(currentArray[i] == 0){
                currentArray.splice(i,1);
                currentArray.push(0);
                break;
            }
        }
    }

    return currentArray.concat();
}

function sumElements(lastGameArray, direction, properties){

    var OldGameArray = [];
    lastGameArray.forEach(function (item) {
        OldGameArray.push(item.concat());
    });

    for (var i = 0; i < OldGameArray.length; i++) {

        // turn
        var turnedArray = turnForward(OldGameArray, direction, properties);

        turnedArray[i] = sumOneElement(turnedArray[i].concat(), i, direction);

        // turn
        var newGameArray = turnBack(turnedArray, direction, properties);

        if(OldGameArray.join(',') != newGameArray.join(',')){
            movingHistory.push(newGameArray);
            newGameArray.forEach(function (item,k) {
                OldGameArray[k] = item.concat();
            });
        }
    }
}

function sumOneElement(currentArray, indexI, direction){

    var noShift = checkForEmptySum(currentArray);

    if(!noShift){
        var animationArray = [];
        for(var i=0;i<currentArray.length;i++){
            if((i+1 < currentArray.length) && (currentArray[i] != 0)){
                if(currentArray[i] == currentArray[i+1]){
                    currentArray.splice(i,2,currentArray[i]*2);
                    currentArray.push(0);
                    jQuery('#sum2048').text(Number(jQuery('#sum2048').text()) + currentArray[i]);
                    // запомнить позицию анимированного элемента
                    var coordinates = findCoordinates(direction, indexI, i, currentArray.length);
                    animationArray.push({
                        index:  movingHistory.length,
                        type:   "sum",
                        i:      coordinates.indexI,
                        j:      coordinates.indexJ
                    });
                }
            }
        }
        animationsHistory[movingHistory.length] = animationArray;
        animSum = animSum + animationArray.length;
    }
    return currentArray.concat();
}

function animateElement(i, delay){

    if(animationsHistory[i] != undefined) {

        animationsHistory[i].forEach(function (elemPosition, j) {

            //console.log(animationsHistory);

            var elem = jQuery('#s' + elemPosition.i.toString() + elemPosition.j.toString());
            var reg = /\d+/g;
            var elemWidth       = Number(elem.css("width").match(reg));
            var elemHeight      = Number(elem.css("height").match(reg));
            var elemLeft        = Number(elem.css("left").match(reg));
            var elemTop         = Number(elem.css("top").match(reg));
            var elemPaddingTop  = Number(elem.css("padding-top").match(reg));

            if(elemPosition.type == "new") {

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
                        , delay * 4
                        , function () {
                            if(animSum == 0){
                                canMove = true;
                            }
                        })
                ;
            }else if(elemPosition.type == "sum") {

                elem
                    .animate({
                            'padding-top':    elemPaddingTop + 2,
                            'width':    elemWidth + 4,
                            'height':   elemHeight + 4,
                            'left':     elemLeft - 2,
                            'top':      elemTop - 2
                        }
                        , delay * 4)
                    .animate({
                            'padding-top':    elemPaddingTop,
                            'width':    elemWidth,
                            'height':   elemHeight,
                            'left':     elemLeft,
                            'top':      elemTop
                        }
                        , delay * 8
                        , function () {
                            animSum--;
                            if(animSum == 0){
                                canMove = true;
                            }
                        })
                ;
            }
        });
    }

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Accessory functions

function randomInRange(start, finish){

    return Math.floor(( Math.random() * (finish - start + 1) ) + start);

}

function turnForward(currentArray, direction, properties){

    var turnedArray = [];
    currentArray.forEach(function (item) {
        turnedArray.push(item.concat());
    });

    switch (direction){
        case "up":
            var upArray = createGameArray(properties.gameWidth, properties.gameHeight); //[[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]; //[];
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
            var downArray = createGameArray(properties.gameWidth, properties.gameHeight);   //[[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]; //[];
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
}

function turnBack(currentArray, direction, properties){

    var turnedArray = [];
    currentArray.forEach(function (item) {
        turnedArray.push(item.concat());
    });

    switch (direction){
        case "up":
            var upArray = createGameArray(properties.gameWidth, properties.gameHeight); //[[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]; //[];
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
            var downArray = createGameArray(properties.gameWidth, properties.gameHeight);   //[[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]; //[];
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

}

function checkForVictory(currentArray, properties){

    var isVictory = false;
    jQuery('#victory2048').hide();

    currentArray.forEach(function (item, i) {
        if (item.indexOf(2048) != -1) {
            isVictory = true;
            jQuery('#victory2048').fadeIn(3000);
            jQuery('#controls2048').fadeTo(3000,0.5);
            jQuery('#field2048').fadeTo(3000,0.5);
            jQuery('#controlDescription2048').fadeTo(3000,0.5);
        }
    });

    if(!isVictory) {
        checkForLoss(currentArray, properties);
    }
}

function checkForLoss(gameArray, properties){

    var OldGameArray = [];
    gameArray.forEach(function (item) {
        OldGameArray.push(item.concat());
    });

    jQuery('#loss2048').hide();
    jQuery("#loss2048 audio").remove();

    var possibleShift   = false;
    var possibleSum     = false;

    var directionArray = ["up","down","left","right"];
    directionArray.forEach(function (direction) {

        var turnedArray = turnForward(OldGameArray, direction, properties);

        turnedArray.forEach(function (item, i) {

            //------------------------------------------------------------------------
            // check shift

            // если нет пустых - не сдвигаем
            if (item.indexOf(0) != -1) {

                // если есть пустые - найти индексы пустых
                var indexEmpty = "";
                item.forEach(function (itemK, k) {
                    if (itemK == 0) {
                        indexEmpty = indexEmpty + k.toString();
                    }
                });
                // если уже упорядочено - не сдвигаем
                if ((indexEmpty == "0123") || (indexEmpty == "123") || (indexEmpty == "23") || (indexEmpty == "3")) {
                }else{
                    possibleShift = true;
                }
            }

            //------------------------------------------------------------------------
            // check sum

            // если есть пустые - найти индексы пустых
            var indexEmpty  = "";
            item.forEach(function (itemK, k) {
                if (itemK == 0) {
                    indexEmpty = indexEmpty + k.toString();
                }
            });
            // если все нули - не сдвигаем
            if ((indexEmpty == "0123") || (indexEmpty == "123")) {
            }else{
                for(var k=0;k<item.length;k++){
                    if((k+1 < item.length) && (item[k] != 0)){
                        if(item[k] == item[k+1]){
                            possibleSum     = true;
                            break;
                        }
                    }
                }
            }
        });
        var newGameArray = turnBack(turnedArray, direction, properties);

        if(OldGameArray.join(',') != newGameArray.join(',')){
            newGameArray.forEach(function (item,k) {
                OldGameArray[k] = item.concat();
            });
        }

    });

    if ((!possibleShift) && (!possibleSum)) {
        jQuery('#loss2048').fadeIn(3000);
        jQuery('#controls2048').fadeTo(3000,0.5);
        jQuery('#field2048').fadeTo(3000,0.5);
        jQuery('#controlDescription2048').fadeTo(3000,0.5);

        var audioArray = [
            "http://zvuki-mp3.com/download/26216_48671-lq.mp3"
            ,"http://zvuki-mp3.com/download/37733_384275-lq.mp3"
            , "http://zvuki-mp3.com/download/48449_180659-lq.mp3"
            , "http://zvuki-mp3.com/download/63979_384275-lq.mp3"
            , "http://zvuki-mp3.com/download/53922_384275-lq.mp3"
        ];
        var randAudioSrc = randomInRange(0, audioArray.length);
        jQuery('#loss2048').append('<audio src="' + audioArray[randAudioSrc] + '" autoplay="autoplay"></audio>');

    }
}

function findCoordinates(direction, i, j, arrayLength){

    switch (direction){
        case "up":
            var newI = j;
            var newJ = arrayLength - (i+1);
            break;

        case "down":
            var newI = arrayLength - (j+1);
            var newJ = i;
            break;

        case "left":
            var newI = i;
            var newJ = j;
            break;

        case "right":
            var newI = i;
            var newJ = arrayLength - (j+1);
            break;
    }

    return {
        indexI:      newI,
        indexJ:      newJ
    };
}

function checkForEmptyShift(currentArray) {

    var noShift     = false;
    var indexEmpty  = "";
    var indexArray  = [];

    if(currentArray.indexOf(0) == -1) {
        noShift = true;
    }else{
        // если есть пустые - найти индексы пустых
        currentArray.forEach(function (item, i) {
            if (item == 0) {
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
        if (indexArray.indexOf(indexEmpty) != -1) {
            noShift = true;
        }
    }
    return noShift;
}

function checkForEmptySum(currentArray) {

    var noShift     = false;
    var indexEmpty  = "";
    var indexArray  = [];

    // если есть пустые - найти индексы пустых
    currentArray.forEach(function (item, i) {
        if (item == 0) {
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
    if (indexArray.indexOf(indexEmpty) != -1) {
        noShift = true;
    }
    return noShift;
}

/////////////////////////////////////////////////////////////////////////////////////////

jQuery(document).ready(function(){

    initialize2048( { idParentWrapper: '.game-2048' } );

});
