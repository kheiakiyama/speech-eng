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

function getQuestions() {
	return [
		{ id: 1, total: 10, correct: 5, sentence: "This is a Pen." }, 
		{ id: 2, total: 8, correct: 6, sentence: "This is a Apple." }, 
		{ id: 3, total: 10, correct: 7, sentence: "Apple pen." },
		{ id: 4, total: 10, correct: 3, sentence: "Make America great again." },
		{ id: 5, total: 14, correct: 5, sentence: "America is going to be strong again." },
		{ id: 6, total: 10, correct: 9, sentence: "We are losing but start winning again." }
	];
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
    	if (json[0].display === getQuestion().sentence) {
	    	document.getElementById("result").innerText = "Congratulations!!";
    	} else {
	    	document.getElementById("result").innerText = "Oops!";
    	}
    }
}

function getQuestion() {
	return getQuestions()[index];
}

function setQuestion() {
	var question = getQuestion();
    document.getElementById("correct_answer").innerText = question.sentence;
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
}

function setNextIssue() {
	index += 1;
	var array = getQuestions();
	if (index >= array.length) {
		index = 0;
	}
	setQuestion();
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
	setNextIssue();
}

function sendResult(result) {
	var question = getQuestion();
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

setQuestion();