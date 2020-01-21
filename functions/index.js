const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const engines = require('consolidate');
const cors = require('cors');

const serviceAccount = require("./serviceAccountKey.json");

const firebaseApp = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://fir-test-be60a.firebaseio.com"
});


// const firebaseApp = firebase.initializeApp(
// 	functions.config().firebase
// );

// fetch all employee values from database
function getEmployees(){
	const ref = firebaseApp.database().ref('employees');
	console.log("Employees Database URL: "+ ref);
	return ref.once('value').then(snap => snap.val());
	// return ref.once('value').then(function (snap) {
	// 	 console.log('snap.val()', snap.val());
	// 	 });
}

 // to findAll and findByName employees api
 let findAll = (request, response) =>{
	response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	getEmployees().then(employees => {

		var result = {};
	    let name = request.query.name;
	    if (name) {
	        let result = employees.filter(employee => (employee.firstName +  ' ' + employee.lastName).toUpperCase().indexOf(name.toUpperCase()) > -1);
	        result = response.json(result);
	    } else {
	        result = response.json(employees);
	    }
	    return result;
	}).catch(error => {
	    console.error(error);
	    res.error(500);
	});
};

// to findById employee api
let findById = (request, response) =>{
	response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	getEmployees().then(employees => {

		var result = {};

		let id = request.params.id;
	    let employee = employees[id - 1];
	    result = response.json({
	        firstName: employee.firstName,
	        lastName: employee.lastName,
	        empId: employee.empId,
	        title: employee.title,
	        email: employee.email,
	        phone: employee.phone,
	        mobilePhone: employee.mobilePhone,
	        picture: employee.picture,
	        manager: employees[employee.managerId - 1],
	        reports: employees.filter(item => item.managerId == id)
	    });
		return result;
	}).catch(error => {
	    console.error(error);
	    res.error(500);
	});
};

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const app = express();
app.use(cors());
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');


app.get('/',(request, response) =>{
	response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	getEmployees().then(employees => {
		response.render('index',{employees});
		return 1;
	}).catch(error => {
	    console.error(error);
	    res.error(500);
	});
});

// SED API Webservices
app.get('/sarvikaemployees',findAll); //findAll and findByName togather

app.get('/sarvikaemployees/:id',findById);



exports.app = functions.https.onRequest(app);
