var rhit = rhit || {};
var countdown = 25;
var secCountdown = 00;
var timerOn = false;

//From: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.ListPageController = class {
	constructor() {

		document.querySelector("#addTaskButton").addEventListener("click", (event) => {

			const list = document.querySelector("#cardsContainer");
			const card = htmlToElement(`<div class = "card"> 
		<div class = "card-body"> 
		<h5 class = "card-title"> Default Task </h5> 
		<h6 class = "card-subtitle" mb-2 text-muted">Default Date</h6> 
		</div> </div>`);
			list.appendChild(card);

		});

		document.querySelector("#startButton").addEventListener("click", (event) => {
			timerOn = true;
			rhit.startTimer();
			document.querySelector("#startButton").style.display = "none";
			document.querySelector("#pauseButton").style.display = "inline";
		

	});
	document.querySelector("#stopButton").addEventListener("click", (event) => {
		timerOn = false;
		rhit.stopTimer();
		document.querySelector("#startButton").style.display = "inline";
		document.querySelector("#pauseButton").style.display = "none";
	

});


		document.querySelector("#pauseButton").addEventListener("click", (event) => {
			timerOn = false;
			rhit.pauseTimer();
			
			
			document.querySelector("#startButton").style.display = "inline";
			document.querySelector("#pauseButton").style.display = "none";

	});




	}
}
rhit.stopTimer = function(){
	countdown = 25;
	secCountdown = 00;
	var countdownNumberEl = document.getElementById('countdown-number');
	countdownNumberEl.textContent = `${countdown} : ${secCountdown}`;

}
rhit.pauseTimer = function () {
	var countdownNumberEl = document.getElementById('countdown-number');
	countdownNumberEl.textContent = `${countdown} : ${secCountdown}`;


}
rhit.startTimer = function () {
	//timer

	//need to start css stroke as well
	
		var countdownNumberEl = document.getElementById('countdown-number');


		countdownNumberEl.textContent = `${countdown} : ${secCountdown}0`;
		countdown = 24;

		setInterval(function () {
				if (timerOn) {
				while (countdown != 0) {
					countdown = --countdown;
				}

				countdownNumberEl.textContent = `${countdown} : ${secCountdown}`;
				}
		}, 60000);

	setInterval(function () {
		if(timerOn){
			if(countdown != 0){secCountdown = --secCountdown <= 0 ? 59 : secCountdown;
			} else{
				while (secCountdown != 0) {
					secCountdown = --secCountdown;
				}
			}
		

		countdownNumberEl.textContent = `${countdown} : ${secCountdown}`;
		}
	}, 1000);

// end timer
}

rhit.main = function () {
	console.log("Ready");
	new rhit.ListPageController();
	$("#evoCalendar").evoCalendar({
		todayHighlight: true,
		sidebarDisplayDefault: false,
		sidebarToggler: false,
		eventDisplayDefault: false,
		eventListToggler: false,
		calendarEvents: [{
			id: 'bHay68s', // Event's ID (required)
			name: "Task 1", // Event name (required)
			date: "October/12/2021", // Event date (required)
			type: "event", // Event type (required)
			everyYear: false // Same event every year (optional)
		}]
	});



};

rhit.main();