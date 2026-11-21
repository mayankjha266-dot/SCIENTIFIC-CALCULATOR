
// =========================
// GET HTML ELEMENTS
// =========================

var display = document.getElementById("display");
var message = document.getElementById("message");
var modeButton = document.getElementById("mode");
var historyList = document.getElementById("history-list");

var angleMode = "DEG";
var lastAnswer = 0;


// =========================
// BUTTON CLICK EVENTS
// =========================

var buttons = document.querySelectorAll(".buttons button");

buttons.forEach(function(button) {

    button.addEventListener("click", function() {

        var value = button.getAttribute("data-value");
        var action = button.getAttribute("data-action");

        if (action === "clear") {
            clearDisplay();
        }

        else if (action === "delete") {

            display.value = display.value.slice(0, -1);
            message.textContent = "Ready to calculate";

        }

        else if (action === "calculate") {
            calculateResult();
        }

        else if (value !== null) {

            if (value === "Ans") {
                display.value += String(lastAnswer);
            }

            else {
                display.value += value;
            }

            message.textContent = "Expression entered";

        }

    });

});


// =========================
// CLEAR DISPLAY
// =========================

function clearDisplay() {

    display.value = "";
    message.textContent = "Display cleared";

}


// =========================
// DEGREE AND RADIAN MODE
// =========================

modeButton.addEventListener("click", function() {

    if (angleMode === "DEG") {
        angleMode = "RAD";
    }

    else {
        angleMode = "DEG";
    }

    modeButton.textContent = angleMode;

});


// =========================
// TOKENIZE EXPRESSION
// =========================

function tokenize(expression) {

    var pattern =
        /\d*\.?\d+(?:e[+-]?\d+)?|[a-zA-Z]+|[+\-*/%^()!]/g;

    var tokens = expression.match(pattern);

    if (tokens === null ||
        tokens.join("") !== expression.replace(/\s/g, "")) {

        throw new Error("Invalid expression");

    }

    return tokens;

}


// =========================
// PARSER VARIABLES
// =========================

var tokens;
var position;


// READ CURRENT TOKEN

function currentToken() {
    return tokens[position];
}


// MATCH TOKEN

function matchToken(value) {

    if (currentToken() === value) {

        position++;
        return true;

    }

    return false;

}


// =========================
// ADDITION AND SUBTRACTION
// =========================

function parseExpression() {

    var result = parseTerm();

    while (currentToken() === "+" ||
           currentToken() === "-") {

        var operator = tokens[position];
        position++;

        var nextValue = parseTerm();

        if (operator === "+") {
            result = result + nextValue;
        }

        else {
            result = result - nextValue;
        }

    }

    return result;

}


// =========================
// MULTIPLICATION AND DIVISION
// =========================

function parseTerm() {

    var result = parseUnary();

    while (currentToken() === "*" ||
           currentToken() === "/") {

        var operator = tokens[position];
        position++;

        var nextValue = parseUnary();

        if (operator === "*") {

            result = result * nextValue;

        }

        else {

            if (nextValue === 0) {
                throw new Error("Cannot divide by zero");
            }

            result = result / nextValue;

        }

    }

    return result;

}


// =========================
// POSITIVE AND NEGATIVE VALUES
// =========================

function parseUnary() {

    if (matchToken("+")) {
        return parseUnary();
    }

    if (matchToken("-")) {
        return -parseUnary();
    }

    return parsePower();

}


// =========================
// POWER FUNCTION
// =========================

function parsePower() {

    var result = parsePostfix();

    if (matchToken("^")) {

        result = Math.pow(result, parseUnary());

    }

    return result;

}


// =========================
// PERCENTAGE AND FACTORIAL
// =========================

function parsePostfix() {

    var result = parsePrimary();

    while (true) {

        // PERCENTAGE

        if (matchToken("%")) {

            result = result / 100;

        }

        // FACTORIAL

        else if (matchToken("!")) {

            if (result < 0 ||
                !Number.isInteger(result) ||
                result > 170) {

                throw new Error("Invalid factorial");

            }

            var factorial = 1;

            for (var i = 1; i <= result; i++) {

                factorial = factorial * i;

            }

            result = factorial;

        }

        else {
            break;
        }

    }

    return result;

}


// =========================
// NUMBERS, CONSTANTS AND FUNCTIONS
// =========================

function parsePrimary() {

    var token = currentToken();

    if (token === undefined) {
        throw new Error("Incomplete expression");
    }


    // BRACKETS

    if (matchToken("(")) {

        var result = parseExpression();

        if (!matchToken(")")) {
            throw new Error("Missing closing bracket");
        }

        return result;

    }


    // NUMBERS

    if (/^\d*\.?\d+(?:e[+-]?\d+)?$/i.test(token)) {

        position++;

        return Number(token);

    }


    // CONSTANTS

    if (token === "pi") {

        position++;
        return Math.PI;

    }

    if (token === "e") {

        position++;
        return Math.E;

    }


    // SCIENTIFIC FUNCTIONS

    var functions = [
        "sin", "cos", "tan",
        "cot", "sec", "cosec",
        "sqrt", "log", "ln"
    ];

    if (functions.indexOf(token) !== -1) {

        position++;

        if (!matchToken("(")) {
            throw new Error("Opening bracket required");
        }

        var value = parseExpression();

        if (!matchToken(")")) {
            throw new Error("Closing bracket required");
        }


        // TRIGONOMETRIC FUNCTIONS

        if (token === "sin" ||
            token === "cos" ||
            token === "tan" ||
            token === "cot" ||
            token === "sec" ||
            token === "cosec") {

            if (angleMode === "DEG") {

                value = value * Math.PI / 180;

            }

            var sinValue = Math.sin(value);
            var cosValue = Math.cos(value);


            if (token === "sin") {
                return sinValue;
            }

            if (token === "cos") {
                return cosValue;
            }

            if (token === "tan") {

                if (Math.abs(cosValue) < 1e-12) {
                    throw new Error("Tan is undefined");
                }

                return sinValue / cosValue;

            }

            if (token === "cot") {

                if (Math.abs(sinValue) < 1e-12) {
                    throw new Error("Cot is undefined");
                }

                return cosValue / sinValue;

            }

            if (token === "sec") {

                if (Math.abs(cosValue) < 1e-12) {
                    throw new Error("Sec is undefined");
                }

                return 1 / cosValue;

            }

            if (token === "cosec") {

                if (Math.abs(sinValue) < 1e-12) {
                    throw new Error("Cosec is undefined");
                }

                return 1 / sinValue;

            }

        }


        // SQUARE ROOT

        if (token === "sqrt") {

            if (value < 0) {
                throw new Error("Invalid square root");
            }

            return Math.sqrt(value);

        }


        // LOG BASE 10

        if (token === "log") {

            if (value <= 0) {
                throw new Error("Invalid logarithm");
            }

            return Math.log10(value);

        }


        // NATURAL LOG

        if (token === "ln") {

            if (value <= 0) {
                throw new Error("Invalid logarithm");
            }

            return Math.log(value);

        }

    }


    throw new Error("Invalid input");

}


// =========================
// CALCULATE FINAL RESULT
// =========================

function calculateResult() {

    try {

        var expression = display.value;

        if (expression === "") {
            throw new Error("Enter an expression");
        }

        tokens = tokenize(expression);
        position = 0;

        var result = parseExpression();

        if (position !== tokens.length) {
            throw new Error("Invalid expression");
        }

        if (!Number.isFinite(result)) {
            throw new Error("Invalid result");
        }


        // ROUND RESULT

        result = Number(result.toPrecision(12));


        // SAVE ANSWER

        lastAnswer = result;


        // DISPLAY RESULT

        display.value = result;
        message.textContent = "Calculation successful";


        // ADD TO HISTORY

        addHistory(expression, result);

    }

    catch (error) {

        message.textContent = error.message;
        display.value = "";

    }

}


// =========================
// ADD CALCULATION TO HISTORY
// =========================

function addHistory(expression, result) {

    var item = document.createElement("li");

    item.textContent = expression + " = " + result;

    if (historyList.children.length === 1 &&
        historyList.children[0].textContent ===
        "No calculations yet") {

        historyList.innerHTML = "";

    }

    historyList.prepend(item);

}


// =========================
// CLEAR HISTORY
// =========================

document.getElementById("clear-history")
    .addEventListener("click", function() {

        historyList.innerHTML =
            "<li>No calculations yet</li>";

    });


// =========================
// KEYBOARD SUPPORT
// =========================

document.addEventListener("keydown", function(event) {

    var key = event.key;

    if (/^[0-9.]$/.test(key)) {

        display.value += key;

    }

    else if (["+", "-", "*", "/", "%",
              "^", "(", ")", "!"].indexOf(key) !== -1) {

        display.value += key;

    }

    else if (key === "Enter" || key === "=") {

        event.preventDefault();
        calculateResult();

    }

    else if (key === "Backspace") {

        display.value = display.value.slice(0, -1);

    }

    else if (key === "Escape") {

        clearDisplay();

    }

});
