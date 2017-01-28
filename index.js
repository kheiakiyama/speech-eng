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
		{ id: 1, sentence: "This is a Pen." }, 
		{ id: 2, sentence: "This is a Apple." }, 
		{ id: 3, sentence: "Apple pen." },
		{ id: 4, sentence: "Make America great again." },
		{ id: 5, sentence: "America is going to be strong again." },
		{ id: 6, sentence: "We are losing but start winning again." }
	];
}

function clearText() {
    document.getElementById("user_answer").innerText = "(You say ...)";
    document.getElementById("output").value = "";
	document.getElementById("result").innerText = "(Result)";
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
    document.getElementById("correct_answer").innerText = getQuestion().sentence;
    document.getElementById("user_answer").innerText = "(You say ...)";
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
    setTimeout(function () {
        client.endMicAndRecognition();
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
}

function next() {
	setNextIssue();
}

function sendResult(result) {
	var question = getQuestion();
	show("loading");
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