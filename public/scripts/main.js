/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.variableName = "";

/** function and class syntax examples */
rhit.functionName = function () {
	/** function body */
};

rhit.ClassName = class {
	constructor() {

	}

	methodName() {

	}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	$("#evoCalendar").evoCalendar({
		todayHighlight: true,
		sidebarDisplayDefault: false,
		sidebarToggler: false,
		eventDisplayDefault: false,
		eventListToggler: false,
		calendarEvents: [
			{
			  id: 'bHay68s', // Event's ID (required)
			  name: "Task 1", // Event name (required)
			  date: "October/12/2021", // Event date (required)
			  type: "event", // Event type (required)
			  everyYear: false // Same event every year (optional)
			}
		]
	});
		
};

rhit.main();
