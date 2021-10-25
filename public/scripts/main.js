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

		if(document.querySelector("#addTaskButton") != null){
		document.querySelector("#addTaskButton").addEventListener("click", (event) => {


			document.location.href = "./addTask.html"

			
		// 	const list = document.querySelector("#cardsContainer");
		// 	const card = htmlToElement(`<div class = "card"> 
		// <div class = "card-body"> 
		// <h5 class = "card-title"> Default Task </h5> 
		// <h6 class = "card-subtitle" mb-2 text-muted">Default Date</h6> 
		// </div> </div>`);
		// 	list.appendChild(card);

		});
	}
		if(document.querySelector("#addButton") != null){
		document.querySelector("#addButton").addEventListener("click", (event) => {
			const name = document.querySelector("#taskName").value;
			const date = document.querySelector("#dueDate").value;
			const desc = document.querySelector("#desc").value;
			
			rhit.fbTasksManager.add(name, date, desc);
			document.location.href = "index.html";
		});
	}	
	if(document.querySelector("#startButton") != null){
		document.querySelector("#startButton").addEventListener("click", (event) => {

			timerOn = true;
			rhit.startTimer();
			document.querySelector("#startButton").style.display = "none";
			document.querySelector("#pauseButton").style.display = "inline";
			const animation = document.querySelector(".timerCircle");
			animation.style.animationPlayState = "running";


		});
	}
	if(document.querySelector("#stopButton") != null){
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
	}

if(document.querySelector("#pauseButton") != null){
		document.querySelector("#pauseButton").addEventListener("click", (event) => {
			timerOn = false;
			rhit.pauseTimer();

			const animation = document.querySelector(".timerCircle");
			animation.style.animationPlayState = "paused";
			

			document.querySelector("#startButton").style.display = "inline";
			document.querySelector("#pauseButton").style.display = "none";

		});
	}

		rhit.fbTasksManager.beginListening(this.updateList.bind(this));
	}
	_createCard(task) {
		return htmlToElement(`<div class="card">
		<div class="card-body">
		  <input type="checkbox">
		  <h5 class="card-title"> ${task.name}</h5>
		  <h6 class="card-subtitle mb2 ">${task.date}</h6>
		</div>
	  </div>`);
	}
	updateList() {
		
		const newList = htmlToElement('<div id = "cardsContainer"></div>');

		for (let i = 0; i < rhit.fbTasksManager.length; i++) {
			const task = rhit.fbTasksManager.getTaskAtIndex(i);
			const newCard = this._createCard(task);


			newCard.onclick = (event) => {
				
			//	window.location.href = `/task.html?id=${task.id}`;

			}
			newList.appendChild(newCard);

		}
	
		const oldList = document.querySelector("#cardsContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
	
		oldList.parentElement.appendChild(newList);

	}
}
rhit.FbTasksManager = class {
	constructor() {
		console.log("created tasks manager");
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection("Tasks");
		this._unsubscribe = null;
	}
	add(name, date, desc) {
		console.log("adding a task");
		this._ref.add({
			//trouble with adding to firebase
				["Name"]: name,
				["Due Date"]: date,
				["Date Created"]:firebase.firestore.Timestamp.now(),
				["Description"]: desc,
			})
			.then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding document: ", error);
			})

	}
	beginListening(changeListener) {
		this._unsubscribe = this._ref.orderBy("Date Created", "desc").limit(50).onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			changeListener();

		});
	}
	stopListening() {
		this._unsubscribe();
	}
	
	get length() {
		return this._documentSnapshots.length;
	}
	getTaskAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const task = new rhit.Task(docSnapshot.id,
			docSnapshot.get("Name"),
			docSnapshot.get("Due Date"));
		return task;
	}
}
rhit.Task= class {
	constructor(id, name, date) {
		this.id = id;
		this.name = name;
		this.date = date;
	}
}
rhit.stopTimer = function () {
	countdown = 25;
	secCountdown = 00;
	var countdownNumberEl = document.getElementById('countdown-number');
	secString = secCountdown.toString().padStart(2, '0');
	countdownNumberEl.textContent = `${countdown} : ${secString}`;
	clearInterval(countMin);
	clearInterval(countSec);

}
rhit.pauseTimer = function () {
	var countdownNumberEl = document.getElementById('countdown-number');
	secString = secCountdown.toString().padStart(2, '0');
	countdownNumberEl.textContent = `${countdown} : ${secString}`;
	clearInterval(countMin);
	clearInterval(countSec);


}
rhit.startTimer = function () {
	//timer

	
	var countdownNumberEl = document.getElementById('countdown-number');


	secString = secCountdown.toString().padStart(2, '0');
	countdownNumberEl.textContent = `${countdown} : ${secString}`;


	countMin = setInterval(function () {
		if (timerOn) {

			if (countdown != 0) {
				if (timerOn) {
					countdown = --countdown;
					console.log(countdown);
				}
			}

			secString = secCountdown.toString().padStart(2, '0');
			countdownNumberEl.textContent = `${countdown} : ${secString}`;
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
				console.log(countdown);
			} else {
				while (secCountdown != 0) {
					if (timerOn) {
						secCountdown = --secCountdown;
					}
				}
			}


			secString = secCountdown.toString().padStart(2, '0');
			countdownNumberEl.textContent = `${countdown} : ${secString}`;
		}
	}, 1000);

	// end timer
}

rhit.main = function () {
	console.log("Ready");
	if (document.querySelector("#mainPage")) {
		rhit.fbTasksManager = new rhit.FbTasksManager();
		new rhit.ListPageController();
	}
	new rhit.ListPageController();
	$("#evoCalendar").evoCalendar({
		todayHighlight: true,
		sidebarDisplayDefault: true,
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