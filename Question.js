module.exports = class Question {


    /**
     * @brief Create a question.
     *
     * @param prompt the string question prompt.
     * @param options a list of {choices,url} representing the answer options.
     * @param correctIndex the index of the correct answer.
     * @param playerIds a list of the player ids currently in the game.
     */
    constructor(prompt, options, correctIndex, playerIds) {
        this.prompt = prompt;
        this.options = options;
        this.correctIndex = correctIndex;
        this.playerIds = playerIds;
        this.answers = {};
    }


    /**
     * @brief Submit a player's answer to the question.
     *
     * @param player the player answering.
     * @param answer the player's answer, as the index of the option they chose.
     */
    answer(player, answer) {
        // Only let them answer if theyre in the list of players,
        // AND they haven't answered already
        if (this.playerIds.includes(player.id) &&
            !Object.keys(this.answers).includes(player.id)) {
            this.answers[player.id] = answer;
        }
    }

    hasEveryoneAnswered() {
        return this.playerIds.every(pid => Object.keys(this.answers).includes(pid));
    }

    /**
     * @brief Grade the players based on their answers.
     *
     * @return the score each player should get as a {id:score ...}
     */
    gradePlayers() {
        let scores = {};
        for (let i = 0; i < this.playerIds.length; i++) {
            let id = this.playerIds[i];
            let correct = (id in this.answers) && (this.answers[id] == this.correctIndex);
            scores[id] = correct ? 100 : 0;
        }
        return scores;
    }
};
