$(function() {
    var socket = io('/spectator');
    var theQuestion = "";
    var choiceArray = {};
    var urlArray = ["", "", "", ""];
    var users = {};
    // HIDE ALL DIVS
    $("#SETTINGS").show();
    $("#MAIN_GAME").hide();
    $("#VOTE_TALLY").hide();
    $("#CORRECT_ANSWER_SCREEN").hide();
    $("#SCORES_DISPLAY").hide();
    $("#WAITING").hide();




    // Client to Server

    // Client to Server
    $(document).ready(function() {

        // player name
        $("#startGameNow").click(function() {
            var name = $('#playerName').val();
            console.log("registered");
            socket.emit('start');
            $("#SETTINGS").hide();
            $("#WAITING").show();
        });



    });

    // ============== Server to Client =================

    // Display room code
    socket.on('room code', function(code) {
        $('#roomCode').text("Room " + code);
    });

    // Display User List
    socket.on('user list', function(updatedUsers) {
        console.log("Received User List");
        $('#joined_players').empty();
        users = updatedUsers;
        for (var id in users) {
            var msg = users[id].name;
            $('#joined_players').append($('<p>').text(msg));
        }
    });

    // Display Questions
    socket.on('question', function(questions) {
        $("#WAITING").hide();
        $("#MAIN_GAME").show();

        var q = Object.values(questions)[0];
        theQuestion = q;
        var choices = Object.values(questions)[1];

        $('#aboveTweetSpacer').empty();
        $('#aboveTweetSpacer').append($('<p>').text(q));

        setAnswerTimer(10);

        for (var c in choices) {
            var msg = choices[c].choice;
            choiceArray[c] = msg;

            var url = choices[c].url;
            urlArray[c] = url;
            var urlId = "#profilePic" + c;
            var id = "#choice_" + c;
            $(id).empty();
            $(id).append($('<p>').text(msg));
            $(urlId).attr('src', url);
        }
    });

    function setAnswerTimer(timeleft) {
        function update() {
            timeleft--;
            $("#countdowntimer").text(timeleft);
            if (timeleft <= 0)
                clearInterval(count);
        }
        let count = setInterval(update, 1000);
        update();
    }

    socket.on('question results', function(results) {
        console.log(results);
        displayUserChoices(results.choices);
        setTimeout(displayCorrectAnswer, 5000, choiceArray[results.correct]);
        setTimeout(displayScoreboard, 10000, results.scores);
        setTimeout(requestNextQuestion, 15000);
    });

    // Display User Choices
    function displayUserChoices(usrChoices) {
        $("#MAIN_GAME").hide();
        $("#VOTE_TALLY").show();

        for (var i = 0; i < 4; i++) {
            var id = "#choice_" + i + "_players";
            var id2 = "#choice_0" + i;
            var id3 = "#profilePic0" + i;
            $(id).empty();
            $(id2).empty();
            //$(id3).empty();
            var url = urlArray[i];
            $(id3).attr('src', url);

            var handle = choiceArray[i];
            $(id2).append($('<p>').text(handle));
        }

        for (var uid in usrChoices) {
            var username = users[uid].name;
            var votelist = "#choice_" + usrChoices[uid] + "_players";
            $(votelist).append($('<p>').text(username));
        }
    }

    // Display Correct Answer
    function displayCorrectAnswer(answer) {
        $("#VOTE_TALLY").hide();
        $("#CORRECT_ANSWER_SCREEN").show();
        console.log("SHOW CorrectAnswer");
        $('#CorrectAnswer').empty();
        $("#CorrectAnswer").append($('<p>').text(answer));
    }

    // Display User Scores
    function displayScoreboard(usrScores) {
        $("#CORRECT_ANSWER_SCREEN").hide();
        $("#SCORES_DISPLAY").show();
        console.log("SHOW Score Display");
        $('#scoreList').empty();

        for (var uid in usrScores) {
            var msg = users[uid].name + ": " + usrScores[uid] + "pts";
            $('#scoreList').append($('<p>').text(msg));
        }
    }

    // Ask for the next question
    function requestNextQuestion() {
        socket.emit('next question');
    }

});
