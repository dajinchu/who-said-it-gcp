<script src="Player.js"> </script>
<script src="Game.js"> </script>

var game;

function createGame(){
	game = new Game();

}

function newPlayer(){
	var id = game.generateId();
	var p = new Player(id);
	game.updatePlayers(p);
}


