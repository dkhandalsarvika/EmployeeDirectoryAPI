const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const engines = require('consolidate');

const serviceAccount = require("./serviceAccountKey.json");

const firebaseApp = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://fir-test-be60a.firebaseio.com"
});


// const firebaseApp = firebase.initializeApp(
// 	functions.config().firebase
// );

function getEmployees(){
	const ref = firebaseApp.database().ref('employees');
	console.log("Employees URL: "+ ref);
	return ref.once('value').then(snap => snap.val());
}

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const app = express();
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

app.get('/employees.json',(request, response) =>{
	response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	getEmployees().then(employees => {
		response.json(employees);
		return 1;
	}).catch(error => {
	    console.error(error);
	    res.error(500);
	});
});

exports.app = functions.https.onRequest(app);
