var index = 0;
var started = false;
var key = "";
var SpeechSDK;
var recognizer;

function getKey() {
    return key;
}

function getRegion() {
    return "japaneast";
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
	document.getElementById("user_answer").innerText = text;
	sendResult(text);
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
	hide("done");
	$('#progress_bar')
//		.attr('transition-duration', 0)
		.removeClass("active")
		.css('width', '0%');
}

function start() {
	if (started) {
		return;
	}
	started = true;
	sendedSpeech = false;
	hide("mic_off");
	show("mic_on");
	show("done");
    clearText();
	var speechConfig = SpeechSDK.SpeechConfig.fromSubscription(getKey(), getRegion());
	speechConfig.speechRecognitionLanguage = getLanguage();

	var audioConfig  = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
	recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
	recognizer.recognizeOnceAsync(
		function (result) {
            console.log(result);
			setText(result.text);
			recognizer.close();
			recognizer = undefined;
		},
		function (err) {
            console.log(err);
			clearText();
			recognizer.close();
			recognizer = undefined;
		}
	);
	document.getElementById("result").innerText = "(Start!!)";
	$('#progress_bar')
//		.attr('transition-duration', (calcSpeechMilliSeconds() / 1000) + 's')
		.addClass("active")
		.css('width', '100%');
    setTimeout(function () {
    	done();
    }, calcSpeechMilliSeconds());
}

function calcSpeechMilliSeconds() {
	var sentenceCount = (question.sentence.split(".").length - 1) + (question.sentence.split(",").length - 1);
	//return 2000 + sentenceCount * 3000;
	return 7000;
}

var sendedSpeech = false;

function done() {
	if (sendedSpeech) {
		return;
	}
	sendedSpeech = true;
	show("loading");
	stop();
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
	    processData: false
	}).always(function() {
		hide("loading");
        console.log("answer success");
	}).done(function(data) {
		console.log(data.cos);
    	document.getElementById("result").innerText = data.comment;
	});
}

function listen() {
	player.play();
}

function initialize(callback) {
	show("loading");
	$.ajax({
	    url: "https://speech-eng.azurewebsites.net/api/oxfordkey",
	    type: "get",
		contentType: "application/json",
	    processData: false
	}).always(function() {
		hide("loading");
	}).done(function(data) {
		key = data.key;
		callback();
	});
}

document.addEventListener("DOMContentLoaded", function () {
	if (!!window.SpeechSDK) {
		SpeechSDK = window.SpeechSDK;
	}
	initialize(function () {
		setNextQuestion();
	});
});
