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

function stop() {
	started = false;
	document.getElementById("mic_off").className = "";
	document.getElementById("mic_on").className = "no-display";
}

function start() {
	if (started) {
		return;
	}
	started = true;
	document.getElementById("mic_off").className = "no-display";
	document.getElementById("mic_on").className = "";
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
	        console.log("answer success");
	    }
	});
}

setQuestion();