var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
 
// Set up spectating and playing namespsaces for the sockets.
var spectator = io.of('/spectator');
var player = io.of('/player');

// Listen at port 80.
http.listen(80, function(){
    console.log('listening on *:' + 80);
});

app.use(express.static('public'));

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
        console.log(name);
        if(typeof name == 'string'){
            names[socket.id] = name;
            scores[name] = 0;
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
        console.log(ans);
        answers[names[socket.id]] = ans;

        console.log(Object.keys(answers).length);
        console.log(Object.keys(names).length);
        // Check if we got answers from everyone.
        if(Object.keys(answers).length == Object.keys(names).length){
            console.log("Display User Choices");
            sendUserChoices();
            

            console.log("Display Correct Answer");
            setTimeout(sendCorrectAnswer, 10000);

            console.log("Display User Scores");
            updateScores(question.answer, answers);
            setTimeout(sendUserScores, 20000);
            
            // Send the new question in 10 seconds.
           setTimeout(sendNewQuestion, 30000);
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
        if(userAnswers[user] == correctAnswer){
            scores[user] += 100;
            console.log("Score");
            console.log(scores[user]);
        }
    }
}

function sendCorrectAnswer(){
    //spectator.emit('correct answer', question.choices[question.answer]);
    spectator.emit('correct answer', "@KanyeWest");

}

function sendUserChoices(){
     spectator.emit('user choices', answers);
}

function sendUserScores(){
    spectator.emit('user scores', scores);
}
function sendNewQuestion(){
    responses = {};
    // Make da question.
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
    var nquestion = {
        'question':'I make awesome decisions in bike stores!!!',
        'answer':3,
        'choices':[q1,q2,q3,q4]};
    question = nquestion;

    // Clone question but erase answer before sending.
    var questionToSend = Object.assign({}, nquestion);
    delete questionToSend.answer;
    player.emit('question', questionToSend);
    spectator.emit('question', questionToSend);
}

