var c;
var ctx;
var selected;
function selectedAlgorithmChanged(btn) {
    selected = btn.value;
    $('.algorithm-input .btn-group button').removeClass('active');
    btn.classList.add('active');
}

function btnVisualize_Clicked() {
    //Reset old canvas height, so it wont increase every time
    c = document.getElementById("canvas");
    if (selected == "cscan") {
        c.height = 120;
    }
    else if (selected == "scan") {
        c.height = 90;
    }
    else {
    c.height = 60;
    }
    //Reset result
    showResult("");

    let errorMessage = document.getElementById('errorMessage');  
    hideError(errorMessage);

    // Get data from inputs
    let inputNumbersString = document.getElementById('inputNumbers').value;
    let inputNumbers = inputNumbersString.split(" ");
    let inputHeadPos = document.getElementById('inputHeadPos').value;
    inputNumbers.unshift(inputHeadPos);
    let inputAlgorithm = selected;

    // Validation
    let isValidInput = true; 
    if (!isAlgorithmSelected()) {
        showError(errorMessage, "Algorithm not selected");
        isValidInput = false; 
    } else if (inputHeadPos == "") {
        showError(errorMessage, "Head position must be entered");
        isValidInput = false;
    } else if (isNaN(inputHeadPos)) {
        showError(errorMessage, "Head position must be a number");
        isValidInput = false; 
    } else if (parseInt(inputHeadPos) < 0 || parseInt(inputHeadPos) > 199) {
        showError(errorMessage, "Head position value must be in range 1..199");
        isValidInput = false;
    } else if (inputNumbersString == "") {
        showError(errorMessage, "Number queue must be entered");
        isValidInput = false; 
    }
    else {
        inputNumbers.forEach(number => {
            if (isNaN(number)) {
                showError(errorMessage, "Number queue must be made of numbers");
                isValidInput = false;
            } else if (parseInt(number) < 0 || parseInt(number) > 199) {
                showError(errorMessage, "Number queue values must be in range 1..199");
                isValidInput = false;
            }
        });
    }
    if (isValidInput) {
    drawCanvas(inputNumbers)
    }
}

function isAlgorithmSelected() 
{
    let validInputs = ["fcfs", "sstf", "scan", "cscan", "clook"];
    return validInputs.indexOf(selected) > -1;
}

function showError(errorMessage, msg) {
    errorMessage.classList.add('alert');
    errorMessage.classList.add('alert-danger');
    errorMessage.innerHTML = msg;
}

function hideError(errorMessage) {
    errorMessage.classList.remove('alert');
    errorMessage.classList.remove('alert-danger');
    errorMessage.innerHTML = "";
}

function drawCanvas(points){
    // Constant values
    let minPoint = 0;
    let maxPoint = 199; 
    let yValueOfXAxis = 30;
    let canvasPadding = 15;
    let xAxisStart = canvasPadding;
    let xAxisEnd = c.width - canvasPadding;     
    // Vars
    let x;
    let y;

    c.height = c.height + points.length*30;
    ctx.clearRect(0, 0, c.width, c.height);
    /*** Draw x axis ***/
    y = yValueOfXAxis; // Set where x axis will be drawn
    drawLine(xAxisStart, y, xAxisEnd, y);

    /*** Set inputs on x axis ***/
    y = yValueOfXAxis;
    let multiplier = (xAxisEnd-xAxisStart) / maxPoint;

    // x Min point
    if (points.indexOf(minPoint.toString()) == -1) {
    x = xAxisStart;
    drawLine(x, y-5, x, y+5); // Draw minimum value
    drawText(minPoint, x - getNumberLenght(minPoint)*4, y-15);  
    }  
    
    // x Max point
    if (points.indexOf(maxPoint.toString()) == -1) {
    x = xAxisStart+maxPoint*multiplier;
    drawLine(x, y-5, x, y+5); // Draw maximum value
    drawText(maxPoint, x - getNumberLenght(maxPoint)*4, y-15);        
    }

    // User input points on x axis
    var uniquePoints = points.filter( onlyUnique );
    uniquePoints.forEach(point => {
        x = xAxisStart+point*multiplier;
        drawLine(x, y-5, x, y+5);
        drawText(point, x - getNumberLenght(point)*4, y-15);
    });

    // Draw user inputs based on algorithm //
    y += 30;
    switch (selected) {
        case "fcfs":
            fcfs(x, y, xAxisStart, points, multiplier);
            break;
        case "sstf":
            sstf(x, y, xAxisStart, points, multiplier);
            break;
        case "scan":
            scan(x, y, xAxisStart, points, multiplier);
            break;
        case "cscan":
            cscan(x, y, xAxisStart, points, multiplier);
            break;
        case "clook":
            clook(x, y, xAxisStart, points, multiplier);
            break;  
        default:
            break;
    }
}

window.onload = function() {
    c = document.getElementById("canvas");
    ctx = c.getContext("2d");
  };
  
  // Draw functions 
  function drawLine(startX, startY, endX, endY) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  function drawDottedLine(startX, startY, endX, endY) {
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawPoint(xPos, yPos, size) {
    ctx.beginPath();
    ctx.arc(xPos, yPos, size, 0, Math.PI * 2, true); 
    ctx.fill();
  }

  function showResult(count) {
    let div = document.getElementById('count-output');
    if (count == "") div.innerHTML = "";
    else div.innerHTML = `Total head movements: <b>${ count }</b>`;
  }

  function drawText(text, xPos, yPos) {
    ctx.font = "14px Arial";
    ctx.fillText(text, xPos, yPos);
  }

  // Helper functions
  function getNumberLenght(num) {
    return Math.ceil(Math.log10(num + 1));
  }

  function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function fcfs(x, y, xAxisStart, points, multiplier) {
    let prevPointXValue;
    let headMovementCount = 0;
    for(let i=0; i < points.length; i++) {
        x = xAxisStart+points[i]*multiplier;
        drawPoint(x, y, 4);
        
        if (i != 0){
            drawLine(prevPointXValue, y-30, x, y);
            headMovementCount += Math.abs(points[i] - points[i-1]);
        }
        prevPointXValue = x;
        y += 30;
    }
    showResult(headMovementCount);
}

function sstf(x, y, xAxisStart, points, multiplier) {
    //Change string values to integers
    for(let i=0; i < points.length; i++) {
        points[i] = points[i]*1;
    }

    let prevPointXValue;
    let headMovementCount = 0;

    //Mark first point, remove from array afterwards
    let lastValue = points[0];
    x = xAxisStart+lastValue*multiplier;
    drawPoint(x, y, 4);
    prevPointXValue = x;
    y += 30;
    points.splice(0, 1);

    while (points.length > 0) {
        let difference = 999999999999999999999;
        let position = 0;

        for (let i = 0; i < points.length; i++) {
            if (Math.abs(lastValue - points[i]) < difference) {
                difference = Math.abs(lastValue - points[i]);
                position = i;
            }
        }

        x = xAxisStart+points[position]*multiplier;
        drawPoint(x, y, 4);
        drawLine(prevPointXValue, y-30, x, y);
        headMovementCount += difference;
        prevPointXValue = x;
        y += 30;

        lastValue = points[position];
        points.splice(position, 1);
    }
    showResult(headMovementCount);
}

function scan(x, y, xAxisStart, points, multiplier) {
    //Change string values to integers
    for(let i=0; i < points.length; i++) {
        points[i] = points[i]*1;
    }

    let prevPointXValue;
    let headMovementCount = 0;

    //Check nearest end
    let startOnLeft = true;
    if (points[0] > 99) {
        startOnLeft = false;
    }

    //Mark first point, remove from array afterwards
    let lastValue = points[0];
    let start = lastValue;
    x = xAxisStart+lastValue*multiplier;
    drawPoint(x, y, 4);
    prevPointXValue = x;
    y += 30;
    points.splice(0, 1);

    let valuesBeforeStart = [];
    let valuesAfterStart = [];

    if (startOnLeft) {
        //Put values in arrays for easier drawing
        for (let i = 0; i < points.length; i++) {
            if (points[i] < start) {
                valuesBeforeStart.push(points[i]);
            } else {
                valuesAfterStart.push(points[i]);
            }
        }

        //Sort values that comes before start descending
        valuesBeforeStart = valuesBeforeStart.sort((a, b) => b - a);
        if (valuesBeforeStart.indexOf(0) == -1) {
            valuesBeforeStart.push(0);
        }

        //Sort values that comes after start ascending
        valuesAfterStart = valuesAfterStart.sort((a, b) => a - b);
    } else {
         //Put values in arrays for easier drawing
        for (let i = 0; i < points.length; i++) {
            if (points[i] < start) {
                valuesAfterStart.push(points[i]);
            } else {
                valuesBeforeStart.push(points[i]);
            }
        }
         //Sort values that comes before start ascending
        valuesBeforeStart = valuesBeforeStart.sort((a, b) => a - b);
        if (valuesBeforeStart.indexOf(199) == -1) {
            valuesBeforeStart.push(199);
        }

        //Sort values that comes after start descending
        valuesAfterStart = valuesAfterStart.sort((a, b) => b - a);
    }

    let difference = 0;
    //Draw values on the left of the start
    for (let i = 0; i < valuesBeforeStart.length; i++) {
        if (i != 0) {
            difference = lastValue - valuesBeforeStart[i];
        } else {
            difference = start - valuesBeforeStart[i];
        }
        lastValue = valuesBeforeStart[i];

        headMovementCount += Math.abs(difference);
        x = xAxisStart+valuesBeforeStart[i]*multiplier;
        drawPoint(x, y, 4);
        drawLine(prevPointXValue, y-30, x, y);
        prevPointXValue = x;
        y += 30;
    }

    //Draw values on the right of the start
    for (let i = 0; i < valuesAfterStart.length; i++) {
        difference = lastValue - valuesAfterStart[i];
        lastValue = valuesAfterStart[i];

        headMovementCount += Math.abs(difference);
        x = xAxisStart+valuesAfterStart[i]*multiplier;
        drawPoint(x, y, 4);
        drawLine(prevPointXValue, y-30, x, y);
        prevPointXValue = x;
        y += 30;
    }
    showResult(headMovementCount);
}

function cscan(x, y, xAxisStart, points, multiplier) {
    // Const values
    let minPoint = 0;
    let maxPoint = 199;
    // Get inputs
    let inputNumbersString = document.getElementById('inputNumbers').value;
    let inputNumbers = points.map(Number);
    let inputHeadPos = inputNumbers[0];
    inputNumbers.push(minPoint);
    inputNumbers.push(maxPoint);
    inputNumbers = inputNumbers.filter(onlyUnique);

    //Sort numbers asc
    inputNumbers = inputNumbers.sort((a, b) => a - b);

    let headIndex = inputNumbers.indexOf(inputHeadPos);

    // Get direction 
    let currentDirection;
    let DirectionEnum = { LEFT: 1, RIGHT: 2 };
    if (inputNumbers[headIndex] - inputNumbers[0] <= inputNumbers[inputNumbers.length - 1] - inputNumbers[headIndex]) {
        currentDirection = DirectionEnum.LEFT;
    }
    else {
        currentDirection = DirectionEnum.RIGHT;
    }

    // Draw //
    let prevPointXValue;
    let headMovementCount = 0;
    // Draw before drop
    if (currentDirection == DirectionEnum.LEFT) {
        let isDropNeeded = headIndex != inputNumbers.length - 1;
        for (let i = headIndex; i >= 0; i--) {
            x = xAxisStart + inputNumbers[i] * multiplier;
            drawPoint(x, y, 4);

            if (i != headIndex) {
                drawLine(prevPointXValue, y - 30, x, y);
                headMovementCount += Math.abs(inputNumbers[i] - inputNumbers[i + 1]);
            }
            prevPointXValue = x;
            y += 30;
        }
        if (isDropNeeded) {
            for (let i = inputNumbers.length - 1; i > headIndex; i--) {
                x = xAxisStart + inputNumbers[i] * multiplier;

                if (i != inputNumbers.length - 1) {
                    drawPoint(x, y, 4);
                    drawLine(prevPointXValue, y - 30, x, y);
                    headMovementCount += Math.abs(inputNumbers[i] - inputNumbers[i + 1]);
                }
                else {
                    y = y - 30;
                    drawPoint(x, y, 4);
                    drawDottedLine(prevPointXValue, y, x, y);
                }
                prevPointXValue = x;
                y += 30;
            }
        }
    }
    // Here direction = right
    else {
        let isDropNeeded = headIndex != 0;
        for (let i = headIndex; i < inputNumbers.length; i++) {
            x = xAxisStart + inputNumbers[i] * multiplier;
            drawPoint(x, y, 4);

            if (i != headIndex) {
                drawLine(prevPointXValue, y - 30, x, y);
                headMovementCount += Math.abs(inputNumbers[i] - inputNumbers[i - 1]);
            }
            y += 30;
            prevPointXValue = x;
        }
        if (isDropNeeded) {
            for (let i = 0; i < headIndex; i++) {
                x = xAxisStart + inputNumbers[i] * multiplier;

                if (i != 0) {
                    drawPoint(x, y, 4);
                    drawLine(prevPointXValue, y - 30, x, y);
                    headMovementCount += Math.abs(inputNumbers[i] - inputNumbers[i - 1]);
                }
                else {
                    y = y - 30;
                    drawPoint(x, y, 4);
                    drawDottedLine(prevPointXValue, y, x, y);
                }
                y += 30;
                prevPointXValue = x;
            }
        }
    }
    showResult(headMovementCount);
}

function clook(x, y, xAxisStart, points, multiplier) {
    //Change string values to integers
    for(let i=0; i < points.length; i++) {
        points[i] = points[i]*1;
    }

    let prevPointXValue;
    let headMovementCount = 0;

    //Check nearest end
    let startOnLeft = true;
    if (points[0] > 99) {
        startOnLeft = false;
    }

    //Mark first point, remove from array afterwards
    let lastValue = points[0];
    let start = lastValue;
    x = xAxisStart+lastValue*multiplier;
    drawPoint(x, y, 4);
    prevPointXValue = x;
    y += 30;
    points.splice(0, 1);

    let valuesBeforeStart = [];
    let valuesAfterStart = [];

    if (startOnLeft) {
        //Put values in arrays for easier drawing
        for (let i = 0; i < points.length; i++) {
            if (points[i] < start) {
                valuesBeforeStart.push(points[i]);
            } else {
                valuesAfterStart.push(points[i]);
            }
        }

        //Sort values that comes before start descending
        valuesBeforeStart = valuesBeforeStart.sort((a, b) => b - a);
        if (valuesBeforeStart[valuesBeforeStart.length - 1] == "199") {
            valuesBeforeStart.splice(valuesBeforeStart.length - 1, 1);
        }

        //Sort values that comes after start ascending
        valuesAfterStart = valuesAfterStart.sort((a, b) => a - b);
        if (valuesAfterStart[valuesAfterStart.length - 1] == "0") {
            valuesAfterStart.splice(valuesAfterStart.length - 1, 1);
        }
    } else {
         //Put values in arrays for easier drawing
        for (let i = 0; i < points.length; i++) {
            if (points[i] < start) {
                valuesAfterStart.push(points[i]);
            } else {
                valuesBeforeStart.push(points[i]);
            }
        }
         //Sort values that comes before start ascending
        valuesBeforeStart = valuesBeforeStart.sort((a, b) => a - b);

        //Sort values that comes after start descending
        valuesAfterStart = valuesAfterStart.sort((a, b) => b - a);
    }

    let difference = 0;
    //Draw values on the left of the start
    for (let i = 0; i < valuesBeforeStart.length; i++) {
        if (i != 0) {
            difference = valuesBeforeStart[i] - lastValue;
        } else {
            difference = start - valuesBeforeStart[i];
            lastValue = valuesBeforeStart[i];
        }

        headMovementCount += Math.abs(difference);
        x = xAxisStart+valuesBeforeStart[i]*multiplier;
        drawPoint(x, y, 4);
        drawLine(prevPointXValue, y-30, x, y);
        prevPointXValue = x;
        if (i+1 != valuesBeforeStart.length) {
            y += 30;
        }
    }

    //Draw values on the right of the start
    for (let i = 0; i < valuesAfterStart.length; i++) {
        difference = valuesAfterStart[i] - lastValue;
        lastValue = valuesAfterStart[i];

        x = xAxisStart+valuesAfterStart[i]*multiplier;
        drawPoint(x, y, 4);
        if (i != 0) {
            drawLine(prevPointXValue, y-30, x, y);
            headMovementCount += Math.abs(difference);
        } else {
            drawDottedLine(prevPointXValue, y, x, y);
        }
        prevPointXValue = x;
        y += 30;
    }
    showResult(headMovementCount);
}

