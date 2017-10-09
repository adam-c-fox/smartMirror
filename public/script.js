var Location = "Bristol,United Kingdom" //Weather location
var interval = 60000 //Data refresh interval: News, Weather
var socket = io();
listen = true;

annyang.debug(true);

// LOCAL HOTWORD DETECTION ---- CURRENTLY NOT WORKING
socket.on('Hotword', function(){
 
	if (listen == true && annyang.isListening()==false){
		console.log('Hotword')
		runAnnyang();
		annyang.start()
		$('#recDot').animate({opacity: '1'})

		setTimeout(function(){
			var state = annyang.isListening();
			if (state == true) {
				noMatch();}
		}, 5000)		
	}
})

var main = function() {
	getTime();
	getDate();
	getWeather();
	getNews();
	runAnnyang();
	loadAvailableCommands();
	var listen = true;
	//annyang.start();
}

var getWeather = function() {
	$.get("http://api.openweathermap.org/data/2.5/weather?q="+ Location +"&units=metric&APPID=bf286bd970435106b763bcfba362d4ff", function (current) {
		document.getElementById("roundTemp").innerHTML = ((current.main.temp).toFixed(1)) + '&#176';
		document.getElementById('desc').innerHTML = ((current.weather[0].description));
		document.getElementById('icon').className = 'wi wi-owm-' + (current.weather[0].id);

		var sunrise = new Date((current.sys.sunrise)*1000);
		var sunset = new Date((current.sys.sunset)*1000);

		var riseMin = minZeroAdder(sunrise.getMinutes());
		var setMin = minZeroAdder(sunset.getMinutes());

		document.getElementById('sunrise').innerHTML = sunrise.getHours() + ':' + riseMin;
		document.getElementById('sunset').innerHTML = sunset.getHours() + ':' + setMin;
	})

	$.get("http://api.openweathermap.org/data/2.5/forecast/daily?q="+ Location +"&units=metric&cnt=7&APPID=bf286bd970435106b763bcfba362d4ff", function (forecast) {

		document.getElementById('hilow').innerHTML = '&#10514' + ' ' + ((forecast.list[0].temp.max).toFixed(1)) + '&#176' + '  ' + '&#10515' + ' ' + (forecast.list[0].temp.min).toFixed(1) + '&#176';

		$('#forecastTbl tr').remove(); //Clears table

		for (i=0; i < 7; i++) {
			var date = new Date((forecast.list[i].dt)*1000)

			if (date.getDate()<10) {
				dateCalc = '0' + (date.getDate());
			}	else {
				dateCalc = (date.getDate());
			}

			hilow = '&#10514' + ' ' + ((forecast.list[i].temp.max).toFixed(0)) + '&#176' + '  ' + '&#10515' + ' ' + (forecast.list[i].temp.min).toFixed(0) + '&#176';
			description = (forecast.list[i].weather[0].description);
			iconClass = 'wi wi-owm-' + (forecast.list[i].weather[0].id)

			forecastTbl = document.getElementById('forecastTbl')
			forecastTbl.insertRow(i);

			forecastTbl.rows[i].insertCell(0);
			forecastTbl.rows[i].cells[0].innerHTML=getDayWordShort(date.getDay());

			forecastTbl.rows[i].insertCell(1);
			forecastTbl.rows[i].cells[1].innerHTML=dateCalc;
			forecastTbl.rows[i].cells[1].style = 'width: 60px';

			forecastTbl.rows[i].insertCell(2);
			forecastTbl.rows[i].cells[2].innerHTML=hilow;

			forecastTbl.rows[i].insertCell(3);
			forecastTbl.rows[i].cells[3].className = iconClass;
			forecastTbl.rows[i].cells[3].style = 'font-size: 25px';

			//forecastTbl.rows[i].insertCell(4);
			//forecastTbl.rows[i].cells[4].innerHTML=description;
			//Text description
		}

			for (i=0; i<4; i++) {
				forecastTbl.rows[1].cells[i].style = 'border-top: 2px solid white';
			}
	})
}

var getDate = function() {
	var currentTime = new Date();
	var day = currentTime.getDay();
	var month = currentTime.getMonth();
	var dayNo = currentTime.getDate();

	document.getElementById('date').innerHTML = (getDayWord(day) + ', ' + getMonthWord(month) + ' ' + dayNo);
}

var getTime = function() {
	var currentTime = new Date();
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	var seconds = currentTime.getSeconds();

		if (minutes < 10) {
			minutes = '0' + minutes;
		}

		if (seconds < 10) {
			seconds = '0' + seconds;
		}
	document.getElementById('time').innerHTML = (hours + ':' + minutes + ':' + seconds);
}

var getNews = function() {
	YUI().use('yql', function(Y){
    var query = "select * from xml where url = 'http://feeds.bbci.co.uk/news/world/rss.xml'";
    var q = Y.YQL(query, function(r) {

    	$('#newsTbl tr').remove();

    	for (i=0; i<newsNo; i++) {
    		var title = (r.query.results.rss.channel.item[i].title);

    		document.getElementById('newsTbl').insertRow(i);
    		document.getElementById('newsTbl').rows[i].insertCell(0);
    		document.getElementById('newsTbl').rows[i].cells[0].innerHTML=(title);
    	}
    })
})
}

var runAnnyang = function() {

	commands = {

		'cancel':function() {
			// var cancelBeep = new Audio('Audio/201.wav');
			// cancelBeep.play();
		},

		'refresh':function() {
			location.reload();
		},

		'stop':function() {
			location.reload();
		},

		// WEATHER ------------------------------------------------

		"what's the weather like":function() {
			var temp = document.getElementById("roundTemp").innerHTML;
			var conditions = document.getElementById('desc').innerHTML;
			speakOut('The conditions are currently ' + conditions + ', and the temperature is' + temp);
		},

		"what's today's forecast":function() {
			$.get("http://api.openweathermap.org/data/2.5/forecast/daily?q="+ Location +"&units=metric&cnt=7&APPID=bf286bd970435106b763bcfba362d4ff", function (forecast) {
				speakOut('The weather today in' + Location + 'will be,' + forecast.list[0].weather[0].description+ ',with highs of' + forecast.list[0].temp.max.toFixed(1)  + ',and lows of' + forecast.list[0].temp.min.toFixed(1));
			})
		},

		"what's the extended forecast":function() {
			$.get("http://api.openweathermap.org/data/2.5/forecast/daily?q="+ Location +"&units=metric&cnt=7&APPID=bf286bd970435106b763bcfba362d4ff", function (forecast) {
				output = '';
				for (i=0; i<7; i++) {
					var date = new Date((forecast.list[i].dt)*1000);
					var output = output + '  ' + getDayWord(date.getDay()) + ' ' + forecast.list[i].temp.max.toFixed(0) + ' . ' + forecast.list[i].weather[0].description + '. ';
				}
				speakOut(output);
			})
		},

		//NEWS

		'what are the headlines':function() {
			var table = document.getElementById('newsTbl');	
			var output = '';		
			for (i=0; i<newsNo; i++) {
				var output = output + table.rows[i].cells[0].innerHTML + '.';
			}
			speakOut(output);
		},

		// MISC ---------------------------------------------------

		'stop listening':function(){
			listen = false;
			$('#muteDot').animate({opacity: '1'});	
		},

		"what's the time":function(){
			var currentTime = new Date();

			if (currentTime.getHours() > 12) {
				var hours = currentTime.getHours()-12;
				speakOut('Its' + hours + ' ' + currentTime.getMinutes() + ' pm');
			} else {
			speakOut('Its' + currentTime.getHours() + ' ' + currentTime.getMinutes() + ' am');
			}
		},

		'what time is sunset':function() {
			speakOut('Sunset is at ' + document.getElementById('sunset').innerHTML);
		},

		'what time is sunrise':function() {
			speakOut('Sunrise is at ' + document.getElementById('sunrise').innerHTML);
		},

		'what can you do':function() {
			speakOut('Nothing');
		},

		'watch me tear up the dance floor':function() {
			$.get('http://192.168.1.26:8080/led?cmd=led_on');
			$.get('http://192.168.1.26:8080/led?cmd=led_fade');
			var music = new Audio('Music/Get down saturday night.mp3');
			music.play();
		},

		'hide main screen':function() {
			$('#main').animate({opacity: '0'});
		},

		'what can I say':function() {
			$('#main').animate({opacity: '0'});
			$('#cmdList').animate({opacity: '1'});
		},

		'on screen':function() {
			$('#cmdList').animate({opacity: '0'});
			$('#main').animate({opacity: '1'});
		},

		'turn off display':function() {
			socket.emit('screenOff');
		},

		'turn on display':function() {
			socket.emit('screenOn');
		}

	}

	annyang.addCallback('resultMatch', function(userSaid, commandText, phrases) {
		console.log(commandText)
		var acknowledge = new Audio('Audio/205.wav');
		acknowledge.play();
		annyang.abort();
		$('#recDot').animate({opacity: '0'})
	})

	annyang.addCallback('resultNoMatch', function(userSaid, commandText, phrases){
		noMatch()	
	})

	annyang.addCommands(commands);
	annyang.setLanguage('en-GB');
}

$(document).keydown((function(key){ //Run annyang on spacebar
	if (key=32) {annyang.start();}
		// listen = true
		// $('#muteDot').animate({opacity: '0'});
}))

var noMatch = function() {
	var cancelBeep = new Audio('Audio/201.wav');
	cancelBeep.play();
	annyang.abort();
	$('#recDot').animate({opacity: '0'})
}

//UTILS --------------------------------

var loadAvailableCommands = function() {
	commandsTbl = document.getElementById('cmdTbl');
	var i = 0;

	while (i < Object.keys(commands).length) {
		commandsTbl.insertRow(i);
		commandsTbl.rows[i].insertCell(0);
		commandsTbl.rows[i].cells[0].innerHTML = Object.keys(commands)[i];
		i++;
	}
}

var minZeroAdder = function(minIn) {
	if (minIn < 10){
		minIn = '0' + minIn;
	}

	return (minIn);
}

var speakOut = function(string) {
	responsiveVoice.speak(string);
}

var getDayWordShort = function(num) {

	var dayAr = new Array();
		dayAr[0] = 'Sun';
		dayAr[1] = 'Mon';
		dayAr[2] = 'Tue';
		dayAr[3] = 'Wed';
		dayAr[4] = 'Thu';
		dayAr[5] = 'Fri';
		dayAr[6] = 'Sat';

	return(dayAr[num]);
}

var getDayWord = function(num) {

	var dayAr = new Array();
		dayAr[0] = 'Sunday';
		dayAr[1] = 'Monday';
		dayAr[2] = 'Tuesday';
		dayAr[3] = 'Wednesday';
		dayAr[4] = 'Thursday';
		dayAr[5] = 'Friday';
		dayAr[6] = 'Saturday';

	return(dayAr[num]);
}

var getMonthWord = function(num) {

	var monthAr = new Array();
		monthAr[0] = "January";
		monthAr[1] = "February";
		monthAr[2] = "March";
		monthAr[3] = "April";
		monthAr[4] = "May";
		monthAr[5] = "June";
		monthAr[6] = "July";
		monthAr[7] = "August";
		monthAr[8] = "September";
		monthAr[9] = "October";
		monthAr[10] = "November";
		monthAr[11] = "December";

	return(monthAr[num]);
}

//SETUP --------------------------------

//responsiveVoice.setDefaultVoice("US English Female");
var newsNo = 6;
var newsTmr = setInterval(getNews, interval)
var TTmr = setInterval(getTime, 100)
var WTmr = setInterval(getWeather, interval) 
$(document).ready(main);
