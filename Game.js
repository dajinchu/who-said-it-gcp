class Game {

	constructor(){
		this.players = [];
		this.round = 0;
		this.ids = [];
	}

	updatePlayers(p){
		this.players.push(p);
	}

	generateId(){
		var id = Math.random() * (999999 - 1000000) + 1000000;
		ids.push(id);
		return id;
	}
}