var rhit = rhit || {};
var countdown = 25;
var secCountdown = 00;
var timerOn = false;
var countMin = null;
var countSec = null;

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
			const animation = document.querySelector(".timerCircle");
			animation.style.animationPlayState = "running";


		});
		document.querySelector("#stopButton").addEventListener("click", (event) => {
			timerOn = false;
			rhit.stopTimer();
			const animation = document.querySelector(".timerCircle");
			animation.style.animationPlayState = "paused";

			var newone = animation.cloneNode(true);
			animation.parentNode.replaceChild(newone, animation);

			document.querySelector("#startButton").style.display = "inline";
			document.querySelector("#pauseButton").style.display = "none";


		});


		document.querySelector("#pauseButton").addEventListener("click", (event) => {
			timerOn = false;
			rhit.pauseTimer();

			const animation = document.querySelector(".timerCircle");
			animation.style.animationPlayState = "paused";
			

			document.querySelector("#startButton").style.display = "inline";
			document.querySelector("#pauseButton").style.display = "none";

		});




	}
}
rhit.stopTimer = function () {
	countdown = 25;
	secCountdown = 00;
	var countdownNumberEl = document.getElementById('countdown-number');
	countdownNumberEl.textContent = `${countdown} : ${secCountdown}0`;
	clearInterval(countMin);
	clearInterval(countSec);

}
rhit.pauseTimer = function () {
	var countdownNumberEl = document.getElementById('countdown-number');
	countdownNumberEl.textContent = `${countdown} : ${secCountdown}`;
	clearInterval(countMin);
	clearInterval(countSec);


}
rhit.startTimer = function () {
	//timer

	//need to start css stroke as well

	var countdownNumberEl = document.getElementById('countdown-number');


	countdownNumberEl.textContent = `${countdown} : ${secCountdown}`;


	countMin = setInterval(function () {
		if (timerOn) {

			while (countdown != 0) {
				if (timerOn) {
					countdown = --countdown;
				}
			}

			countdownNumberEl.textContent = `${countdown} : ${secCountdown}`;
		}
	}, 60000);

	countSec = setInterval(function () {
		//format as double digits
		if (timerOn) {
			if (countdown == 25) {
				countdown = 24;
			}
			if (countdown != 0) {
				secCountdown = --secCountdown <= 0 ? 59 : secCountdown;
			} else {
				while (secCountdown != 0) {
					if (timerOn) {
						secCountdown = --secCountdown;
					}
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