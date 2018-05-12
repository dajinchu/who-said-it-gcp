const uuid = require('uuid/v1');

module.exports = class Player {

    /**
     * @param name the name of the player.
     * @param game a reference to the game object.
     */
    constructor(name, game) {
        this.id = uuid();
        this.name = name;
        this.game = game;
        this.score = 0;
    }

    /**
     * @param answer the string answer to the current question.
     */
    answerQuestion(answer) {
        this.game.answerQuestion(this, answer);
    }

    updateScore(num) {
        this.score = this.score + num;
    }


};
