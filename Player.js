class Player {
    constructor(id){
        this.id = id;
        this.score = 0;
    }

    set name(n) {
        this.name = n;
    }

    get name() {
        return this._name;
    }

    updateScore(num){
        this.score = this.score + num;
    }


}