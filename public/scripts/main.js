//const { data } = require("jquery");

var rhit = rhit || {};
rhit.FB_COLLECTION_TASKS = "Tasks";
rhit.FB_KEY_NAME = "Name";
rhit.FB_KEY_AUTHOR = "Author";
rhit.FB_KEY_DUE_DATE = "Due Date";
rhit.FB_KEY_DESC = "Description";
rhit.FB_KEY_DATE_CREATED = "Date Created";
rhit.FB_COLLECTION_SUBTASKS = "SubTasks";
rhit.FB_KEY_PARENT = "Parent";
rhit.FB_KEY_PNAME = "ParentName";

var countdown = 24;
var secCountdown = 59;
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
		this.askNotificationPermission();
		console.log("creating list page controller");
		console.log("hello!");
		console.log(document.querySelector("#logoutButton") + "logoutButon");
		if (document.querySelector("#logoutButton") != null) {
			console.log("logout button exists");
			document.querySelector("#logoutButton").addEventListener("click", (event) => {
				console.log("clicked logout");
				rhit.fbAuthManager.signOut();

			});
		}


		document.querySelector("#logoutButton").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		});

		if (document.querySelector("#addTaskButton") != null) {
			document.querySelector("#addTaskButton").onclick = (event) => {
				document.location.href = "./addTask.html"
			};
		}
		if (document.querySelector("#trophiesButton") != null) {
			document.querySelector("#trophiesButton").onclick = (event) => {
				document.location.href = "trophies.html";

			};
		}
		if (document.querySelector("#addButton") != null) {
			document.querySelector("#addButton").onclick = (event) => {
				const name = document.querySelector("#taskName").value;
				const date = document.querySelector("#dueDate").value;
				const desc = document.querySelector("#desc").value;
				console.log("called add");
				rhit.fbTasksManager.add(name, date, desc);
				document.querySelector("#taskName").value = "";
				document.querySelector("#dueDate").value = "";
				document.querySelector("#desc").value = "";


			};
		}
		if (document.querySelector("#returnButton") != null) {
			document.querySelector("#returnButton").onclick = (event) => {
				document.location.href = "index.html";

			};
		}
		if (document.querySelector("#startButton") != null) {
			document.querySelector("#startButton").onclick = (event) => {

				timerOn = true;
				rhit.startTimer();
				document.querySelector("#startButton").style.display = "none";
				document.querySelector("#pauseButton").style.display = "inline";
				const animation = document.querySelector(".timerCircle");
				animation.style.animationPlayState = "running";


			};
		}
		if (document.querySelector("#stopButton") != null) {
			document.querySelector("#stopButton").onclick = (event) => {
				timerOn = false;
				rhit.stopTimer();
				const animation = document.querySelector(".timerCircle");
				animation.style.animationPlayState = "paused";

				var newone = animation.cloneNode(true);
				animation.parentNode.replaceChild(newone, animation);

				document.querySelector("#startButton").style.display = "inline";
				document.querySelector("#pauseButton").style.display = "none";


			};
		}

		if (document.querySelector("#pauseButton") != null) {
			const pause = document.querySelector("#pauseButton");

			pause.onclick = (event) => {
				timerOn = false;
				rhit.pauseTimer();

				const animation = document.querySelector(".timerCircle");
				animation.style.animationPlayState = "paused";
				document.querySelector("#startButton").style.display = "inline";
				document.querySelector("#pauseButton").style.display = "none";

			}

		}
		if (document.querySelector("#enable") != null) {
			document.querySelector("#enable").onclick = (event) => {
				this.askNotificationPermission();
			};
		}
		if (document.querySelectorAll(".checkbox") != null) {
			const checkBoxes = document.querySelectorAll(".checkbox");
			for (const box of checkBoxes) {
				box.onclick = (event) => {

					fbTasksManager.checkBox(box.id);
				}
			}

		}
		if (document.querySelectorAll(".subcheckbox") != null) {

			const checkBoxes = document.querySelectorAll(".subcheckbox");
			for (const box of checkBoxes) {
				box.onclick = (event) => {
					console.log("box checked");
					fbSubTasksManager.checkBox(box.id);
				}
			}

		}


		//create calendar
		$("#evoCalendar").evoCalendar({
			todayHighlight: true,
			sidebarDisplayDefault: true,
			sidebarToggler: false,
			eventDisplayDefault: false,
			eventListToggler: false
		});


		rhit.fbTasksManager.beginListening(this.updateList.bind(this));
		rhit.fbSubTasksManager.beginListening(this.updateList.bind(this));

	}
	askNotificationPermission() {
		// function to actually ask the permissions
		function handlePermission(permission) {
			let notificationBtn = document.querySelector("#enable");
			// set the button to shown or hidden, depending on what the user answers
			if (Notification.permission === 'denied' || Notification.permission === 'default') {
				notificationBtn.style.display = 'block';
			} else {
				notificationBtn.style.display = 'none';
			}
		}

		// Let's check if the browser supports notifications
		if (!('Notification' in window)) {
			console.log("This browser does not support notifications.");
		} else {
			if (this.checkNotificationPromise()) {
				Notification.requestPermission()
					.then((permission) => {
						handlePermission(permission);
					})
			} else {
				Notification.requestPermission(function (permission) {
					handlePermission(permission);
				});
			}
		}
	}

	 checkNotificationPromise() {
		try {
		  Notification.requestPermission().then();
		} catch(e) {
		  return false;
		}
	
		return true;
	  }

	_createCard(task) {
		console.log(task.color + "is color ");
		return htmlToElement(`<div  class="${task.color} card">
		<div class="card-body">
		  <input id = "${task.id}" type="checkbox" class="checkbox">
		  <h5 class="card-title"> ${task.name}</h5>
		  <h6 class="card-subtitle mb2 ">${task.date}</h6>
		</div>
	  </div>`);
	}
	_createSubCard(subtask) {
		console.log(subtask.color);
		return htmlToElement(`<div  class=" ${subtask.color} card" >
		<div class="card-body">
		  <input id = "${subtask.id}" type="checkbox" class="subcheckbox">
		  <h5 class="card-title"> ${subtask.name}</h5>
		  <h6 class="card-subtitle mb2 ">${subtask.date}</h6>
		  <br>
		  <h6 class="card-subtitle mb2 ">Parent: ${subtask.parent}</h6>
		</div>
	  </div>`);
	}

	updateList() {


		const newList = htmlToElement('<div id = "cardsContainer"></div>');

		if ((rhit.fbTasksManager.length == 0)) {
			newList.appendChild(htmlToElement(`<div style = "font-size: 2rem; text-align: center"> No Tasks </div>`));
		}
		for (let i = 0; i < rhit.fbTasksManager.length; i++) {
			const task = rhit.fbTasksManager.getTaskAtIndex(i);
			task.isClicked = false;
			const newCard = this._createCard(task);

			newCard.onclick = (event) => {
				const checkBoxes = document.querySelectorAll(".checkbox");
				for (const box of checkBoxes) {
					if (box.checked) {
						rhit.fbTasksManager.checkBox(box.id);

						if (box.id == task.id) {
							let n = new Notification('Task Completed!');
							
							task.isClicked = true;
						}
					}

				}
				if (task.isClicked) {} else {
					window.location.href = `/task.html?id=${task.id}`;
				}


			}
			newList.appendChild(newCard);

			$('#evoCalendar').evoCalendar('addCalendarEvent', {
				id: task.id,
				name: task.name,
				description: task.description,
				date: task.date,
				type: 'event',
				color: `#${task.color}`
			});

		}

		console.log(rhit.fbSubTasksManager.length);
		for (let i = 0; i < rhit.fbSubTasksManager.length; i++) {
			const subtask = rhit.fbSubTasksManager.getSubTaskAtIndex(i);
			const newCard = this._createSubCard(subtask);
			console.log("subtask gotten", subtask);
			console.log(subtask.parent);

			newCard.onclick = (event) => {


				const checkBoxes = document.querySelectorAll(".subcheckbox");
				for (const box of checkBoxes) {
					if (box.checked) {
						rhit.fbSubTasksManager.checkBox(box.id);

						if (box.id == subtask.id) {
							let n = new Notification('SubTask Completed!');
							subtask.isClicked = true;
						}
					}

				}
				if (subtask.isClicked) {} else {
					window.location.href = `/subtask.html?id=${subtask.id}`;
				}


			}
			newList.appendChild(newCard);

			$('#evoCalendar').evoCalendar('addCalendarEvent', {
				id: subtask.id,
				name: subtask.name,
				description: subtask.description,
				date: subtask.date,
				type: 'event',
				color: `#${subtask.color}`

			});

		}


		const oldList = document.querySelector("#cardsContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;

		oldList.parentElement.appendChild(newList);

	}
}
rhit.FbTasksManager = class {
	constructor(uid) {
		console.log("created tasks manager");
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_TASKS);
		this._unsubscribe = null;
	}
	add(name, date, desc) {

		this._ref.add({

				[rhit.FB_KEY_NAME]: name,
				[rhit.FB_KEY_AUTHOR]: rhit.fbAuthManager.uid,
				[rhit.FB_KEY_DUE_DATE]: date,
				[rhit.FB_KEY_DATE_CREATED]: firebase.firestore.Timestamp.now(),
				[rhit.FB_KEY_DESC]: desc,
			})
			.then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding document: ", error);
			})

		setTimeout(() => {
			console.log("stop!");
		}, 2000);

		console.log("task added");
	}
	beginListening(changeListener) {

		let query = this._ref.orderBy(rhit.FB_KEY_DATE_CREATED, "desc").limit(50);
		if (this._uid) {
			query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		}
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
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
			docSnapshot.get("Due Date"), docSnapshot.get(rhit.FB_KEY_DATE_CREATED));
		return task;
	}

	checkBox(id) {
		console.log(id);
		console.log("inside checkBox");
		let dependents = false;
		for (let i = 0; i < rhit.fbSubTasksManager.length; i++) {
			const subtask = rhit.fbSubTasksManager.getSubTaskAtIndex(i);
			if (subtask.pid == id) {
				dependents = true;
				break;
			}
		}
		if (!dependents) {
			this._ref.doc(id).delete();
		}

	}
}
rhit.FbSubTasksManager = class {
	constructor(uid) {
		console.log("created subtasks manager");
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_SUBTASKS);
		this._unsubscribe = null;
	}
	add(name, date, desc, pid, pname) {

		this._ref.add({

				//trouble with adding to firebase
				[rhit.FB_KEY_NAME]: name,
				[rhit.FB_KEY_AUTHOR]: rhit.fbAuthManager.uid,
				[rhit.FB_KEY_DUE_DATE]: date,
				[rhit.FB_KEY_DATE_CREATED]: firebase.firestore.Timestamp.now(),
				[rhit.FB_KEY_DESC]: desc,
				[rhit.FB_KEY_PARENT]: pid,
				[rhit.FB_KEY_PNAME]: pname
			})
			.then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding document: ", error);
			})

		setTimeout(() => {
			console.log("stop!");
		}, 2000);

		console.log("subtask added");
	}
	beginListening(changeListener) {

		let query = this._ref.orderBy(rhit.FB_KEY_DATE_CREATED, "desc").limit(50);
		if (this._uid) {
			query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		}
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
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
	getSubTaskAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const task = new rhit.SubTask(docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_NAME),
			docSnapshot.get(rhit.FB_KEY_DUE_DATE), docSnapshot.get(rhit.FB_KEY_PARENT), docSnapshot.get(rhit.FB_KEY_PNAME), docSnapshot.get(rhit.FB_KEY_DATE_CREATED));
		return task;
	}
	checkBox(id) {
		console.log(id);
		console.log("inside checkBox for subtask");

		this._ref.doc(id).delete();


	}
}

rhit.DetailPageController = class {
	constructor() {
		let link = document.querySelector("#title");
		link.href = `/main.html?uid=${rhit.fbAuthManager.uid}`;
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		});
		document.querySelector("#submitEditQuote").addEventListener("click", (event) => {
			const quote = document.querySelector("#inputQuote").value;
			const movie = document.querySelector("#inputMovie").value;
			rhit.fbSingleQuoteManager.update(quote, movie);
		});

		document.querySelector("#submitAddSubtask").addEventListener("click", (event) => {
			const name = document.querySelector("#inputName").value;
			const date = document.querySelector("#inputDate").value;
			const desc = document.querySelector("#inputDesc").value;
			const pname = document.querySelector("#parentName").innerHTML;
			rhit.fbSubTasksManager.add(name, date, desc, rhit.fbSingleTaskManager.id, rhit.fbSingleTaskManager.name);
		});

		$("#addSubtaskDialog").on("show.bs.modal", (event) => {
			// Pre animation
			document.querySelector("#inputName").value = "";
			document.querySelector("#inputDate").value = "";
			document.querySelector("#inputDesc").value = "";
			document.querySelector("#parentName").innerHTML = "Parent: " + rhit.fbSingleTaskManager.name;

		});
		$("#addSubtaskDialog").on("shown.bs.modal", (event) => {
			// Post animation
			document.querySelector("#inputName").focus();
		});


		$("#editQuoteDialog").on("show.bs.modal", (event) => {
			// Pre animation
			document.querySelector("#inputQuote").value = rhit.fbSingleQuoteManager.quote;
			document.querySelector("#inputMovie").value = rhit.fbSingleQuoteManager.movie;
		});
		$("#editQuoteDialog").on("shown.bs.modal", (event) => {
			// Post animation
			document.querySelector("#inputQuote").focus();
		});



		document.querySelector("#submitDeleteQuote").addEventListener("click", (event) => {
			rhit.fbSingleTaskManager.delete().then(function () {
				console.log("Document successfully deleted!");
				window.location.href = `/main.html?uid=${rhit.fbAuthManager.uid}`;
			}).catch(function (error) {
				console.error("Error removing document: ", error);
			});
		});
		rhit.fbSubTasksManager.beginListening(this.updateView.bind(this));
		rhit.fbSingleTaskManager.beginListening(this.updateView.bind(this));
	}
	_createSubCard(subtask) {
		return htmlToElement(`<div class=" ${subtask.color} card" ">
		<div class="card-body">
		  <input type="checkbox">
		  <h5 class="card-title"> ${subtask.name}</h5>
		  <h6 class="card-subtitle mb2 ">${subtask.date}</h6>
		  <br>
		  <h6 class="card-subtitle mb2 ">Parent: ${rhit.fbSingleTaskManager.name}</h6>
		</div>
	  </div>`);
	}
	updateView() {
		document.querySelector("#cardName").innerHTML = rhit.fbSingleTaskManager.name;
		document.querySelector("#cardDate").innerHTML = rhit.fbSingleTaskManager.date;
		document.querySelector("#cardDesc").innerHTML = rhit.fbSingleTaskManager.desc;
		if (rhit.fbSingleTaskManager.author == rhit.fbAuthManager.uid) {
			document.querySelector("#menuEdit").style.display = "flex";
			document.querySelector("#menuDelete").style.display = "flex";
		}
		const newList = htmlToElement('<div id = "cardsContainer"></div>');



		console.log("length" + rhit.fbSubTasksManager.length);

		for (let i = 0; i < rhit.fbSubTasksManager.length; i++) {
			const subtask = rhit.fbSubTasksManager.getSubTaskAtIndex(i);
			console.log("parent" + subtask.parent);
			console.log("task " + rhit.fbSingleTaskManager.name);

			if (subtask.pid == rhit.fbSingleTaskManager.id) {
				const newCard = this._createSubCard(subtask);

				newCard.onclick = (event) => {

					window.location.href = `/subtask.html?id=${subtask.id}`;

				}

				newList.appendChild(newCard);
			}
		}




		const oldList = document.querySelector("#cardsContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;

		oldList.parentElement.appendChild(newList);



	}
}
rhit.SubDetailPageController = class {
	constructor() {
		let link = document.querySelector("#title");
		link.href = `/main.html?uid=${rhit.fbAuthManager.uid}`;
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		});


		$("#editQuoteDialog").on("show.bs.modal", (event) => {
			// Pre animation
			document.querySelector("#inputQuote").value = rhit.fbSingleQuoteManager.quote;
			document.querySelector("#inputMovie").value = rhit.fbSingleQuoteManager.movie;
		});
		$("#editQuoteDialog").on("shown.bs.modal", (event) => {
			// Post animation
			document.querySelector("#inputQuote").focus();
		});

		document.querySelector("#submitDeleteQuote").addEventListener("click", (event) => {
			rhit.fbSingleSubTaskManager.delete().then(function () {
				console.log("Document successfully deleted!");
				window.location.href = "/main.html";
			}).catch(function (error) {
				console.error("Error removing document: ", error);
			});
		});

		rhit.fbSingleSubTaskManager.beginListening(this.updateView.bind(this));
	}
	updateView() {
		document.querySelector("#cardName").innerHTML = rhit.fbSingleSubTaskManager.name;
		document.querySelector("#cardDate").innerHTML = rhit.fbSingleSubTaskManager.date;
		document.querySelector("#cardDesc").innerHTML = rhit.fbSingleSubTaskManager.desc;
		document.querySelector("#cardParent").innerHTML = "Parent: " + rhit.fbSingleSubTaskManager.parent;
		if (rhit.fbSingleSubTaskManager.author == rhit.fbAuthManager.uid) {
			document.querySelector("#menuEdit").style.display = "flex";
			document.querySelector("#menuDelete").style.display = "flex";
		}
	}
}
rhit.FbSingleTaskManager = class {
	constructor(taskId) {
		this._id = taskId;
		this._documentSnapshot = [];
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_TASKS).doc(taskId);
	}

	beginListening(changeListener) {
		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data());
				this._documentSnapshot = doc;
				changeListener();
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");
				//window.location.href = "/";
			}
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	update(name, date, desc) {
		this._ref.update({
				[rhit.FB_KEY_NAME]: name,
				[rhit.FB_KEY_AUTHOR]: rhit.fbAuthManager.uid,
				[rhit.FB_KEY_DUE_DATE]: date,
				[rhit.FB_KEY_DATE_CREATED]: firebase.firestore.Timestamp.now(),
				[rhit.FB_KEY_DESC]: desc,
			})
			.then(() => {
				console.log("Document successfully updated!");
			})
			.catch(function (error) {
				// The document probably doesn't exist.
				console.error("Error updating document: ", error);
			});
	}

	delete() {
		return this._ref.delete();
	}

	get name() {

		return this._documentSnapshot.get(rhit.FB_KEY_NAME);
	}
	get desc() {
		return this._documentSnapshot.get(rhit.FB_KEY_DESC);
	}
	get date() {
		return this._documentSnapshot.get(rhit.FB_KEY_DUE_DATE);
	}

	get author() {
		return this._documentSnapshot.get(rhit.FB_KEY_AUTHOR);
	}
	get id() {
		return this._id;
	}
}
rhit.FbSingleSubTaskManager = class {
	constructor(subtaskId) {
		console.log(subtaskId);
		this._documentSnapshot = [];
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_SUBTASKS).doc(subtaskId);
	}

	beginListening(changeListener) {
		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data());
				this._documentSnapshot = doc;
				changeListener();
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");
				//window.location.href = "/";
			}
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	update(name, date, desc, parentId) {
		this._ref.update({
				[rhit.FB_KEY_NAME]: name,
				[rhit.FB_KEY_PARENT]: parentId,
				[rhit.FB_KEY_AUTHOR]: rhit.fbAuthManager.uid,
				[rhit.FB_KEY_DUE_DATE]: date,
				[rhit.FB_KEY_DATE_CREATED]: firebase.firestore.Timestamp.now(),
				[rhit.FB_KEY_DESC]: desc,
			})
			.then(() => {
				console.log("Document successfully updated!");
			})
			.catch(function (error) {
				// The document probably doesn't exist.
				console.error("Error updating document: ", error);
			});
	}

	delete() {
		return this._ref.delete();
	}

	get name() {
		return this._documentSnapshot.get(rhit.FB_KEY_NAME);
	}
	get desc() {
		return this._documentSnapshot.get(rhit.FB_KEY_DESC);
	}
	get date() {
		return this._documentSnapshot.get(rhit.FB_KEY_DUE_DATE);
	}

	get author() {
		return this._documentSnapshot.get(rhit.FB_KEY_AUTHOR);
	}
	get parent() {
		return this._documentSnapshot.get(rhit.FB_KEY_PARENT);
	}
}
rhit.Task = class {
	constructor(id, name, date, creationDate) {
		this.id = id;
		this.name = name;
		this.date = date;
		this._isClicked = false;
		this.color = this.calculateColor(date, creationDate);
	}
	get isClicked() {
		return this._isClicked;
	}

	set isClicked(value) {
		this._isClicked = value;
	}

	calculateColor(dueDate, creationDate) {
		let dd = new Date(dueDate);
		let cd = creationDate.toDate();

		console.log(dd);
		console.log(cd);
		let Difference_In_Time = dd.getTime() - cd.getTime();
		let days = Math.floor(Difference_In_Time / (1000 * 3600 * 24));

		console.log("days is " + days);
		if (days >= 7) {
			return "d41067";
			//pink
		}
		if (days == 6) {
			return "8821be"; //purple
		}
		if (days == 5) {
			return "16bdfc"; //blue
		}
		if (days == 4) {
			return "9ad53b"; //green
		}
		if (days == 3) {
			return "ffc717"; //yellow
		}
		if (days == 2) {
			return "f58929"; //orange
		}
		if (days <= 1) {
			return "fb0000"; //red
		}
		return "000000";
	}

}

rhit.SubTask = class {
	constructor(id, name, date, pId, pName, creationDate) {
		this.id = id;
		this.name = name;
		this.date = date;
		this.pid = pId;
		this.parent = pName;
		console.log(pName);
		this._isClicked = false;
		this.color = this.calculateColor(date, creationDate);
	}
	get isClicked() {
		return this._isClicked;
	}

	set isClicked(value) {
		this._isClicked = value;
	}
	calculateColor(dueDate, creationDate) {
		let dd = new Date(dueDate);
		let cd = creationDate.toDate();

		console.log(dd);
		console.log(cd);
		let Difference_In_Time = dd.getTime() - cd.getTime();
		let days = Math.floor(Difference_In_Time / (1000 * 3600 * 24));

		console.log("days is " + days);
		if (days >= 7) {
			return "e385a9";
		}
		if (days == 6) {
			return "b19ad6";
		}
		if (days == 5) {
			return "b4e9fe";
		}
		if (days == 4) {
			return "cdea9e";
		}
		if (days == 3) {
			return "ffe38b";
		}
		if (days == 2) {
			return "f8ad68";
		}
		if (days <= 1) {

			return "ff8b8b";
		}
		
		console.log("returning grey");
		return "525252";
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
				let n = new Notification('Timer Complete!');
			}


			secString = secCountdown.toString().padStart(2, '0');
			countdownNumberEl.textContent = `${countdown} : ${secString}`;
		}
	}, 1000);

	// end timer
}

rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#roseFireButton").onclick = (event) => {
			rhit.fbAuthManager.signIn();
		};
	}
}
rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
	}

	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._access
			this._user = user;
			changeListener();
		});
	}

	signIn() {
		console.log("Sign in using Rosefire");
		Rosefire.signIn("dfbc3abf-4ecb-4d15-b2ae-2bf0b169ecbc", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				if (errorCode === 'auth/invalid-custom-token') {
					alert('The token you provided is not valid.');
				} else {
					console.error("Custom auth error", errorCode, errorMessage);
				}
			});
		});

	}

	signOut() {
		firebase.auth().signOut().catch((error) => {
			console.log("Sign out error");
		});
	}

	get isSignedIn() {
		return !!this._user;
	}

	get uid() {
		return this._user.uid;
	}
}
rhit.checkForRedirects = function () {
	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = `/main.html?uid=${rhit.fbAuthManager.uid}`;
	}
	if (!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/";
	}
};

rhit.initializePage = function () {
	const urlParams = new URLSearchParams(window.location.search);
	if (document.querySelector("#mainPage")) {
		console.log("You are on the main page.");
		console.log("yee");
		const uid = urlParams.get("uid");
		console.log(uid + "is the user id");
		rhit.fbTasksManager = new rhit.FbTasksManager(uid);
		rhit.fbSubTasksManager = new rhit.FbSubTasksManager(uid);
		new rhit.ListPageController();
		console.log("called new list page");
	}
	if (document.querySelector("#detailPage")) {
		console.log("You are on the detail page.");
		const taskId = urlParams.get("id");
		if (!taskId) {
			window.location.href = "/";
		}
		const uid = urlParams.get("uid");
		rhit.fbSubTasksManager = new rhit.FbSubTasksManager(uid);
		rhit.fbSingleTaskManager = new rhit.FbSingleTaskManager(taskId);
		new rhit.DetailPageController();
	}
	if (document.querySelector("#subDetailPage")) {
		console.log("You are on the subtask detail page.");
		const taskId = urlParams.get("id");
		if (!taskId) {
			window.location.href = "/";
		}
		rhit.fbSingleSubTaskManager = new rhit.FbSingleSubTaskManager(taskId);
		new rhit.SubDetailPageController();
	}

	if (document.querySelector("#loginPage")) {
		console.log("You are on the login page.");
		new rhit.LoginPageController();
	}
};



rhit.main = function () {
	console.log("Ready");
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log("isSignedIn = ", rhit.fbAuthManager.isSignedIn);
		rhit.checkForRedirects();
		rhit.initializePage();
	});





};

rhit.main();