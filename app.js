var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Set up spectating and playing namespsaces for the sockets.
var spectator = io.of('/spectator');
var player = io.of('/player');

// Listen at port 3000.
http.listen(8080, function(){
    console.log('listening on *:' + 8080);
});

// Serve index.html at the root.
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// Store a mapping between socketId and user names.
var names = {};

// Store a mapping between user name and scores.
var scores = {};

// Stores the question as {'question':String,'choices': [String]}
var question = {};

// Stores user responses. Key = username, Value = number
var answers = {};

// Socket connection for players.
player.on('connection', function(socket){
    console.log("Player Connected");

    // player name should receive a string name.
    socket.on('player name', function(name){
        // Check it is valid msg with player info.
        if(typeof name == 'string'){
            names[socket.id] = name;
        } 
        sendUserList();
    });
    // Delete the user from names{} when disconnect.
    socket.on('disconnect', function(){
        console.log(names[socket.id] + " disconnected");
        delete names[socket.id];
        sendUserList();
    });

    // Handle user answer. Receives int for answer chosen.
    socket.on('answer selected', function(ans){
        answers[names[socket.id]] = ans;

        // Check if we got answers from everyone.
        if(Object.keys(answers).length == Object.keys(names).length){
            spectator.emit('correct answer', question.choices[question.answer]);
            spectator.emit('user choices', answers);
            updateScores(question.answer, answers);
            spectator.emit('user scores', scores);
            // Send the new question in 10 seconds.
            setTimeout(sendNewQuestion, 10000);
        }
    });
});

// Socket connection for spectators.
spectator.on('connection', function(socket){
    console.log("Spectator Connected");
    socket.on('start', function(msg){
        sendNewQuestion();
    });
});

function sendUserList(){
    var usrs = Object.keys(names).map(k => names[k]);
    spectator.emit('user list', usrs);
}

function updateScores(correctAnswer, userAnswers){
    for(user in userAnswers){
        if(userAnswers[user] == corrrectAnswer){
            scores[user] += 100;
        }
    }
}

function sendNewQuestion(){
    responses = {};
    // Make da question.
    var nquestion = {
        'question':'I am trump',
        'answer':1,
        'choices':['trump','arun','wendys']};
    question = nquestion;

    // Clone question but erase answer before sending.
    var questionToSend = Object.assign({}, nquestion);
    delete questionToSend.answer;
    player.emit('question', questionToSend);
    spectator.emit('question', questionToSend);
}

