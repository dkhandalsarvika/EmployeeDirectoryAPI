const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const engines = require('consolidate');
const cors = require('cors');

const databaseName = 'employees';

const adminUserName = 'admin';
const adminPassword = 'admin#123';

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
	const ref = firebaseApp.database().ref(databaseName);
	console.log("Employees Database URL: "+ ref);
	// return ref.orderByChild('isActive').equalTo(true).once('value', function(snapshot) {
	// 			// var totalRecords =  snapshot.numChildren();
 //    // 			console.log("Total Records : " + totalRecords);
	// 		    // console.log(snapshot.val());
	// 		    // snapshot.forEach(function(data) {
	// 		    //     console.log(data.key);
	// 		    // });
	// 		});
	return ref.orderByChild('isActive').equalTo(true).once('value').then(snap => snap.val());
	// return ref.once('value').then(snap => snap.val());
	// return ref.once('value').then(function (snap) {
	// 	 console.log('snap.val()', snap.val());
	// 	 });
}

// update employee values from database
function updateEmployees(request){
	var ref = firebaseApp.database().ref(databaseName + '/' + (request.body.id - 1));
	console.log("Employees Database update URL: " + ref);
	ref.update({
	    empId:request.body.empId,
		firstName:request.body.firstName,
		lastName:request.body.lastName,
		title:request.body.title,
		email:request.body.email,
		phone:request.body.phone,
		mobilePhone:request.body.mobilePhone,
		picture: request.body.picture,
		dob: request.body.dob,
		doj: request.body.doj,
		bloodGrp: request.body.bloodGrp,
		passportNo: request.body.passportNo,
		passportExpiry: request.body.passportExpiry,
		pan: request.body.pan
	  }, error => {
	    if (error) {
	      // The write failed...
	      	console.log("Updating failed");	
	    } else {
	      // Data saved successfully!
	      	console.log("Update employee details successfully for " + (request.body.id - 1) + "-" + request.body.firstName);	
	    }
	  });

	return ref.once('value').then(snap => snap.val());
}

 // to findAll and findByName employees api
 let findAll = (request, response) =>{
	response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	getEmployees().then(employees => {

		var result = {};
	    let name = request.query.name;
	    let email = request.query.email;
	    if (name) {
	        let result = employees.filter(employee => (employee.firstName +  ' ' + employee.lastName).toUpperCase().indexOf(name.toUpperCase()) > -1);
	        result = response.json(result);
	    }else if (email) {
	        let result = employees.filter(employee => employee.email == email)[0];
	        result = response.json(result);
	    }else {
	        result = response.json(employees);
	    }
	    return result;
	}).catch(error => {
	    console.error(error);
	    response.error(500);
	});
};

// to findById employee api
let findById = (request, response) =>{
	response.set('Cache-Control', 'no-store');
	getEmployees().then(employees => {

		var result = {};

		let id = request.params.id;
	    let employee = employees.filter(employee => employee.id == id)[0];
	    result = response.json({
	    	id: employee.id,
	        empId: employee.empId,
	        firstName: employee.firstName,
	        lastName: employee.lastName,
	        title: employee.title,
	        email: employee.email,
	        phone: employee.phone,
	        mobilePhone: employee.mobilePhone,
	        picture: employee.picture,
	        dob: employee.dob,
	        doj: employee.doj,
	        bloodGrp: employee.bloodGrp,
	        passportNo: employee.passportNo,
			passportExpiry: employee.passportExpiry,
			pan: employee.pan,
	        isActive: employee.isActive,
	        isAdmin: employee.isAdmin,
	        manager: employees.filter(item => employee.managerId == item.id)[0],
	        reports: employees.filter(item => item.managerId == id)
	    });
		return result;
	}).catch(error => {
	    console.error(error);
	    response.error(500);
	});
};

// to updateById employee api
let updateById = (request, response) =>{
	// response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	updateEmployees(request).then(employee => {
		var result = {};
	    result = response.json({
	    	id: employee.id,
	        empId: employee.empId,
	        firstName: employee.firstName,
	        lastName: employee.lastName,
	        title: employee.title,
	        email: employee.email,
	        phone: employee.phone,
	        mobilePhone: employee.mobilePhone,
	        picture: employee.picture,
	        dob: employee.dob,
	        doj: employee.doj,
	        bloodGrp: employee.bloodGrp,
	        passportNo: employee.passportNo,
			passportExpiry: employee.passportExpiry,
			pan: employee.pan,	        
	        isActive: employee.isActive,
	        isAdmin: employee.isAdmin	        
	    });
	    // console.log(result);
		return result;
	}).catch(error => {
	    console.error(error);
	    response.error(500);
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
	response.render('index', { title: 'SED Login' });
});


app.post('/login',(request, response) =>{

	var username = request.body.username;
	var password = request.body.password;
	var message = "";

	if (username && password) {

			if (username == adminUserName&& password == adminPassword) {
				response.redirect(307,'/emplisting');
			} else {
				message = 'Incorrect Username and/or Password!';
				response.render('index',{message});
			}			
	}else {
		message = 'Please enter Username and Password!';
		response.render('index',{message});
	}
});

app.get('/logout',(request, response) =>{
	response.redirect(307,'/');
});

app.post('/emplisting',(request, response) =>{
	response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	getEmployees().then(employees => {
		response.render('emplisting',{employees});
		return 1;
	}).catch(error => {
	    console.error(error);
	    // response.error(500);
	    response.redirect(307,'/');
	});
});

app.get('/empdetails/:id',(request, response) =>{
	// response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	response.set('content-type', 'text/html; charset=utf-8');

		getEmployees().then(employees => {

		var empdetail ;

		let id = request.params.id;
	    empdetail = employees.filter(employee => employee.id == id)[0];
	    // empdetail = response.json({
	    //     empId: employee.empId,
	    //     firstName: employee.firstName,
	    //     lastName: employee.lastName,
	    //     title: employee.title,
	    //     email: employee.email,
	    //     phone: employee.phone,
	    //     mobilePhone: employee.mobilePhone,
	    //     picture: employee.picture,
	    //     manager: employees.filter(item => employee.managerId == item.id)[0],
	    //     reports: employees.filter(item => item.managerId == id)
	    // });
	    // console.log(empdetail);

	    response.render('empdetails',{empdetail});
		return 1;
	}).catch(error => {
	    console.error(error);
	    response.error(500);
	});
	// getEmployees().then(employees => {
	// 	response.render('empdetails',{employees});
	// 	return 1;
	// }).catch(error => {
	//     console.error(error);
	//     res.error(500);
	// });
});

// SED API Webservices
app.get('/sarvikaemployees',findAll); //findAll and findByName , findByEmail all together

app.get('/sarvikaemployees/:id',findById);

app.put('/empdetailsupdate',updateById);

let listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

exports.app = functions.https.onRequest(app);
