const Question = require('./Question');
const Player = require('./Player');
const EventEmitter = require('events');
let allCodes = [];

var QuestionTypes = Object.freeze({
    GUESS_CELEB: 1,
    MIMIC_CELEB: 2
});
module.exports.QuestionTypes = QuestionTypes;

module.exports = class Room extends EventEmitter {

    constructor(code) {
        super();
        this.players = {};
        this.question = {};
        this.questionType = QuestionTypes.GUESS_CELEB;
        this.round = 0;
        this.started = false;
        this.code = code;
        this.questionClosed = false;
    }

    start() {
        this.started = true;
        this.newQuestion();
    }

    answerQuestion(player, answer) {
        this.question.answer(player, answer);
        if (this.question.hasEveryoneAnswered()) {
            this.endQuestion();
        }
    }

    newQuestion() {
        this.questionClosed = false;
        var q1 = {
            choice: "@realDonaldTrump",
            url: "https://cdn.cnn.com/cnnnext/dam/assets/180414083645-07-trump-syria-0413-large-169.jpg"
        };

        var q2 = {
            choice: "@officialJaden",
            url: "https://pbs.twimg.com/profile_images/984869091885199360/Z8xhlToN_400x400.jpg"
        };

        var q3 = {
            choice: "@Wendys",
            url: "https://pbs.twimg.com/profile_images/905469122674393089/m49BKeBS_400x400.jpg"
        };

        var q4 = {
            choice: "@KanyeWest",
            url: "https://pbs.twimg.com/profile_images/585565077207678977/N_eNSBXi_400x400.jpg"
        };
        this.question = new Question(
            "I make awesome decisions in bike stores!!!", [q1, q2, q3, q4],
            3, Object.keys(this.players));
        this.emit('question-generated', this.question);
        setTimeout(() => {
            this.endQuestion();
        }, 10000);
    }

    endQuestion(){
        if(!this.questionClosed){
            this.applyQuestionGrades();
            this.emit('question closed');
        }
        this.questionClosed = true;
    }

    /**
     * Add the player's scores.
     */
    applyQuestionGrades() {
        let grades = this.question.gradePlayers();
        for (let uid in grades) {
            this.players[uid].updateScore(grades[uid]);
        }
    }

    /**
     * Add a player, but only if the game has not started.
     *
     * @return the new player.
     */
    addNewPlayer(playerName) {
        if (!this.started) {
            let newPlayer = new Player(playerName, this);
            this.players[newPlayer.id] = newPlayer;
            this.emit('userchange');
            return newPlayer;
        }
    }

    _close() {
        this.removeAllListeners();
        this.emit('room closed');
    }

};
