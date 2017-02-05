var client;
var request;
var index = 0;
var started = false;

function getMode() {
    return Microsoft.CognitiveServices.SpeechRecognition.SpeechRecognitionMode.shortPhrase;
}

function getKey() {
    return "73a0f2bbad2548428435f980818c4239";
}

function getLanguage() {
    return "en-us";
}

function clearText() {
    document.getElementById("user_answer").innerText = "(You say ...)";
    document.getElementById("output").value = "";
	document.getElementById("result").innerText = "(Result)";
	hide("loading");
}

function setText(text) {
    document.getElementById("output").value += text;
    var json = JSON.parse(text);
    if (json.length > 0) {
    	document.getElementById("user_answer").innerText = json[0].display;
		sendResult(json[0].display);
    	if (json[0].display === question.sentence) {
	    	document.getElementById("result").innerText = "Congratulations!!";
    	} else {
	    	document.getElementById("result").innerText = "Oops!";
    	}
    }
}

var currentTimeStamp = new Date();
var question = {};

function getQuestionFromServer(callBack) {
	show("loading");
	$.ajax({
	    url: "https://speech-eng.azurewebsites.net/api/questions",
	    type: "get",
	    data: {
	    	time: currentTimeStamp.toLocaleString()
	    },
		contentType: "application/json",
	    success: function(response) {
			hide("loading");
			question = response;
			currentTimeStamp = response.time;
	        console.log("get question success");
	        callBack();
	    }
	});
}

function setNextQuestion() {
	getQuestionFromServer(function() {
	    document.getElementById("correct_answer").innerText = question.sentence;
	    document.getElementById("player").src = question.url;
	    document.getElementById("user_answer").innerText = "(You say ...)";
	    var ctx = document.getElementById("chart");
	    var myPieChart = new Chart("chart",{
		    type: 'pie',
		    data: {
		    	labels: ["OK", "NG"],
		    	datasets: [{
		    		data: [question.correct, question.total - question.correct],
		    		backgroundColor: [
		                "#36A2EB",
		                "#FF6384"
		            ],
		            hoverBackgroundColor: [
		                "#36A2EB",
		                "#FF6384"
		            ]
		    	}]
		    },
		    animation:{
		        animateScale:true
		    },
		    options: {}
		});
	});
}

function show(id) {
	document.getElementById(id).className = "";
}

function hide(id) {
	document.getElementById(id).className = "no-display";
}

function stop() {
	started = false;
	show("mic_off");
	hide("mic_on");
	$('#progress_bar')
		.removeClass("active")
		.css('width', '0%');
}

function start() {
	if (started) {
		return;
	}
	started = true;
	hide("mic_off");
	show("mic_on");
    var mode = getMode();
    clearText();
    client = Microsoft.CognitiveServices.SpeechRecognition.SpeechRecognitionServiceFactory.createMicrophoneClient(
        mode,
        getLanguage(),
        getKey());
    client.startMicAndRecognition();
	document.getElementById("result").innerText = "(Start!!)";
	$('#progress_bar')
		.addClass("active")
		.css('width', '100%');
    setTimeout(function () {
        client.endMicAndRecognition();
		show("loading");
	    stop();
    }, 5000);

    client.onPartialResponseReceived = function (response) {
        setText(response);
    }

    client.onFinalResponseReceived = function (response) {
        setText(JSON.stringify(response));
    }

    client.onIntentReceived = function (response) {
        setText(response);
    };

    client.onError = function (response) {
    	clearText();
    };
}

function next() {
	setNextQuestion();
}

function sendResult(result) {
	$.ajax({
	    url: "https://speech-eng.azurewebsites.net/api/questions",
	    type: "post",
	    data: JSON.stringify({
	    	id: question.id,
	    	sentence: result
	    }),
		contentType: "application/json",
	    processData: false,
	    success: function(msg) {
			hide("loading");
	        console.log("answer success");
	    }
	});
}

function listen() {
	player.play();
}

setNextQuestion();
