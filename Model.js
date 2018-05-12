let Room = require('./Room');
let badwords = require('./badwords.json');

function containsBadWord(word){
    return badwords.some(bad => word.includes(bad));
}

module.exports = class Model {
    constructor() {
        this.rooms = {};
    }

    createRoom() {
        let code = this.newCode();
        let newroom = new Room(code);
        this.rooms[code] = newroom;
        return newroom;
    }

    newCode() {
        let aCode;
        do {
            let num = Math.floor(Math.random() * (475254 - 18279) + 18279);
            aCode = this.toBijectiveBase26(num);
        } while (Object.keys(this.rooms).includes(aCode) || !containsBadWord(aCode));
        return aCode;
    }

    toBijectiveBase26(n) {
        let ret = "";
        while (parseInt(n) > 0) {
            --n;
            ret += String.fromCharCode("A".charCodeAt(0) + (n % 26));
            n /= 26;
        }
        return ret.split("").reverse().join("");
    }

    /**
     * See if a room exists.
     * @param roomCode the code of the room to look for.
     * @return boolean of whether to room exists.
     */
    roomExists(roomCode) {
        return (roomCode in this.rooms);
    }

    /**
     * Get a room given it's code.
     * @param roomCode the code of the room to get.
     * @return Room corresponding to the roomCode.
     */
    getRoom(roomCode) {
        return this.rooms[roomCode];
    }

    /**
     * Free up the room code.
     * @param room the Room to free up
     */
    closeRoom(room) {
        room._close();
        delete this.rooms[room.code];
    }
};
