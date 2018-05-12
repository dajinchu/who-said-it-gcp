var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Model = require('./Model');

// Set up spectating and playing namespsaces for the sockets.
var spectator = io.of('/spectator');
var player = io.of('/player');

// Listen at port 3000.
http.listen(3000, function() {
    console.log('listening on *:' + 3000);
});

app.use(express.static('public'));


let model = new Model();

// Socket connection for players.
player.on('connection', function(socket) {
    console.log("Player Connected");

    function onPlayerData(data) {
        // Check it is valid msg with player info.
        console.log(data);

        if (!model.roomExists(data.room)) {
            socket.emit('500', "room does not exist");
            return;
        }
        let room = model.getRoom(data.room);
        if (room.started) {
            socket.emit('500', "game already started");
            return;
        }

        // Join the socket room
        socket.join(room.code);

        // Leave the socket room if the room (in the model) is closed.
        room.on('room closed', ()=>{
            socket.leave(room.code);
        });

        let mplayer = room.addNewPlayer(data.name);
        registerPlayerListeners(mplayer);
    }

    function registerPlayerListeners(mplayer) {
        // Handle user answer. Receives int for answer chosen.
        socket.on('answer selected', onAnswerSelected);

        function onAnswerSelected(ans) {
            console.log(ans);
            mplayer.answerQuestion(ans);
        }
    }

    // player data should receive a {room:String, name: String}
    socket.on('player data', onPlayerData);

    socket.on('disconnect', function() {});
});

// Socket connection for spectators.
spectator.on('connection', function(socket) {
    console.log("Spectator Connected");
    let room = model.createRoom();
    socket.emit("room code", room.code);
    socket.join(room.code);
    onUserChange();
    console.log("Spectator joining room " + room.code);

    function onReceiveStart(msg) {
        room.start();
    }
    socket.once('start', onReceiveStart);

    function onQuestionClosed() {
        let scores = Object.keys(room.players).reduce((prev, curr) => {
            prev[curr] = room.players[curr].score;
            return prev;
        }, {});
        let results = {
            correct: room.question.correctIndex,
            scores: scores,
            choices: room.question.answers
        };
        console.log("question finished");
        player.to(room.code).emit('question closed');
        spectator.to(room.code).emit('question results', results);
    }

    function onUserChange() {
        let usernames = Object.keys(room.players).reduce((prev, curr) => {
            prev[curr] = {
                name: room.players[curr].name
            };
            return prev;
        }, {});
        console.log("user change");
        spectator.to(room.code).emit('user list', usernames);
    }

    function onQuestionGenerated(question) {
        let formattedQuestion = {
            question: question.prompt,
            choices: question.options
        };
        player.to(room.code).emit('question', formattedQuestion);
        spectator.to(room.code).emit('question', formattedQuestion);
    }

    room.on('question closed', onQuestionClosed);
    room.on('userchange', onUserChange);
    room.on('question-generated', onQuestionGenerated);

    function onNewQuestionRequested() {
        room.newQuestion();
    }

    socket.on('next question',onNewQuestionRequested);

    socket.on('disconnect', () => {
        console.log("Spectator disconnected");
        model.closeRoom(room);
        // Tell clients that the room is closed so they go back to home screen.
        player.to(room.code).emit('room closed');
    });
});

function sendNewQuestion2() {
    answers = {};
    // Make da question.
    var q1 = {
        choice: "@SHAQ",
        url: "https://pbs.twimg.com/profile_images/1673907275/image_400x400.jpg"
    };

    var q2 = {
        choice: "@jimmykimmel",
        url: "https://pbs.twimg.com/profile_images/979404042240630785/AcHnkDGC_400x400.jpg"
    };

    var q3 = {
        choice: "@VancityReynolds",
        url: "https://pbs.twimg.com/profile_images/741703039355064320/ClVbjlG-_400x400.jpg"
    };

    var q4 = {
        choice: "@britneyspears",
        url: "https://pbs.twimg.com/profile_images/955803874463571969/-R8etznz_400x400.jpg"
    };
    var nquestion = {
        'question': 'If u feel alone and by yourself, look in the mirror, and wow, theres two of you.  Be who you are. Who are you. I am me. Ugly, lol. ',
        'answer': 0,
        'choices': [q1, q2, q3, q4]
    };
    question = nquestion;

    // Clone question but erase answer before sending.
    var questionToSend = Object.assign({}, nquestion);
    delete questionToSend.answer;
    player.emit('question', questionToSend);
    spectator.emit('question', questionToSend);
}
