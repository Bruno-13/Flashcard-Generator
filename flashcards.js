var BasicCard = require("./Basic");
var Cloze = require("./Cloze");
var inquirer = require("inquirer");
var fs = require("fs");
var correct = 0;
var wrong = 0;
var cardArray = [];

// initial user prompt to start the app - 5 choices

var flashcards = function() {

        inquirer.prompt([{

                type: 'list',
                name: 'userType',
                message: 'What would you like to do?',
                choices: ['Create basic cards', 'Create cloze cards', 'Basic quiz', 'Cloze quiz', 'Exit']
            }

        ]).then(function(choice) {

            if (choice.userType === 'Create basic cards') {
                readCards('log.txt');
                createCards(basicPrompt, 'log.txt');
            } else if (choice.userType === 'Create cloze cards') {
                readCards('cloze-log.txt');
                createCards(clozePrompt, 'cloze-log.txt');
            } else if (choice.userType === 'Basic quiz') {
                quiz('log.txt', 0);
            } else if (choice.userType === 'Cloze quiz') {
                quiz('cloze-log.txt', 0);
            } else if (choice.userType === 'Exit') {
                console.log('Thank you for playing');
            }
        });
    }
    
// reads created cards from log file

var readCards = (logFile) => {
    cardArray = [];
    
    fs.readFile(logFile, "utf8", function(error, data) {

        var jsonContent = JSON.parse(data);

        for (let i = 0; i < jsonContent.length; i++) {
            cardArray.push(jsonContent[i]);
        }
    });
};

// creates cards 

var createCards = function(promptType, logFile) {

    inquirer.prompt(promptType).then(function(answers) {

        cardArray.push(answers);

        if (answers.makeMore) {

            createCards(promptType, logFile);
        } else {

            writeToLog(logFile, JSON.stringify(cardArray));
            flashcards();
        }
    });
};

// reads the log file and loops through cards that are stored

var quiz = function(logFile, x) {

    fs.readFile(logFile, "utf8", function(error, data) {

        var jsonContent = JSON.parse(data);

        if (x < jsonContent.length) {

            if (jsonContent[x].hasOwnProperty("front")) {

                var gameCard = new BasicCard(jsonContent[x].front, jsonContent[x].back);
                var gameQuestion = gameCard.front;
                var gameAnswer = gameCard.back.toLowerCase();
            } else {
                var gameCard = new Cloze(jsonContent[x].text, jsonContent[x].cloze);
                var gameQuestion = gameCard.message;
                var gameAnswer = gameCard.cloze.toLowerCase();
            }
// user must input at least one character to go to next card

            inquirer.prompt([{
                name: "question",
                message: gameQuestion,
                validate: function(value) {

                    if (value.length > 0) {
                        return true;
                    }
                    return "Don't give up. Please take a guess!";
                }

            }]).then(function(answers) {

                if (answers.question.toLowerCase().indexOf(gameAnswer) > -1) {
                    console.log('Correct!');
                    correct++;
                    x++;
                    quiz(logFile, x);
                } else {
                    gameCard.printAnswer();
                    wrong++;
                    x++;
                    quiz(logFile, x);
                }

            })

        } else {
            console.log('Your score is: ');
            console.log('correct: ' + correct);
            console.log('wrong: ' + wrong);
            correct = 0;
            wrong = 0;
            flashcards();
        }
    });
};

// writes to log file

var writeToLog = function(logFile, info) {

    fs.writeFile(logFile, info, function(err) {
        if (err)
            console.error(err);
    });
}

// prompt when creating basic cards

var basicPrompt = [{
    name: "front",
    message: "Enter Front of Card: "
}, {
    name: "back",
    message: "Enter Back of Card: "

}, {
    type: 'confirm',
    name: 'makeMore',
    message: 'Create another card? (hit enter for YES)',
    default: true
}]

// prompt when creating cloze cards

var clozePrompt = [{
    name: "text",
    message: "Enter a sentence, putting the word you want to hide in parentheses, like this: 'April showers bring May (flowers)'",
    validate: function(value) {
        var parentheses = /\(\w.+\)/;
        if (value.search(parentheses) > -1) {
            return true;
        }
        return 'Please put a word in your sentence in parentheses'
    }
}, {
    type: 'confirm',
    name: 'makeMore',
    message: 'Create another card? (hit enter for YES)',
    default: true
}]

// prompt to find out if user wants to make more cards (default is yes)
var makeMore = {
    type: 'confirm',
    name: 'makeMore',
    message: 'Create another card? (hit enter for YES)',
    default: true
}

flashcards();