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


//************************ Mobile App Start ***************************************//

// fetch all employee values from database
function getEmployees(){
	const ref = firebaseApp.database().ref(databaseName);
	console.log("Employees Database URL mobile listing: "+ ref);
	return ref.once('value').then(snap => snap.val().filter(item => (item.isActive == true)));
	// return ref.orderByChild('isActive').equalTo(true).once('value', function(snapshot) {
	// 			// var totalRecords =  snapshot.numChildren();
 //    // 			console.log("Total Records : " + totalRecords);
	// 		    // console.log(snapshot.val());
	// 		    // snapshot.forEach(function(data) {
	// 		    //     console.log(data.key);
	// 		    // });
	// 		});
	// return ref.orderByChild('isActive').equalTo(true).once('value').then(snap => snap.val());
	
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
	      	console.log("Update employee details successfully for " + (request.body.id - 1) + " - " + request.body.firstName);	
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
	    if(employee == undefined){
	    	console.log("employee not found with this id: " + id);
	    	return response.json(result);
	    }
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
	    // response.error(500);
	    var result = {};
	    response.json(result);
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

//************************ Mobile App End ***************************************//


//************************ Admin website Start **********************************//

// fetch all employee values from database by admin whether employee active or inactive
function getEmployeesAdmin(request){
	var ref = firebaseApp.database().ref(databaseName);
	console.log("Employees Database URL Admin listing: "+ ref);

		let isActive = request.query.isActive;

		if(isActive){
		    if (isActive == "true") {
				// return ref.orderByChild('isActive').equalTo(true).once('value').then(snap => snap.val().filter(item => item));
				return ref.once('value').then(snap => snap.val().filter(item => (item.isActive == true)));
		    }else if (isActive == "false") {
		    	// return ref.orderByChild('isActive').equalTo(false).once('value').then(snap => snap.val().filter(item => item));
		    	return ref.once('value').then(snap => snap.val().filter(item => (item.isActive == false)));
		    }else if (isActive == "all") {
		    	return ref.once('value').then(snap => snap.val());
		    }
		}else{
			return ref.once('value').then(snap => snap.val());
		}
}

 // to findAllAdmin and findByName employees api
 let findAllAdmin = (request, response) =>{
	// response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	getEmployeesAdmin(request).then(employees => {

		var result = [];
		let searchtext = request.query.searchtext;
	    var name = undefined;
	    var email = undefined;

	    if(searchtext.includes('@')){
	    	// console.log('email search');
	    	email = searchtext;
	    }else{
	    	// console.log('name search');
	    	name = searchtext;
	    }
	    if (name) {
	        result = employees.filter(employee => (employee.firstName +  ' ' + employee.lastName).toUpperCase().indexOf(name.toUpperCase()) > -1);
	        // result = response.json(result);
	    }else if (email) {
	    	var searchEmailResult = employees.filter(employee => employee.email == email)[0];
	    	if(searchEmailResult != undefined){
	     	   result.push(searchEmailResult);
	    	}
	        // result = response.json(result);
	        // console.log(result);
	    }else {
	        // result = response.json(employees);
	        result = employees;
	    }
	    
	    // console.log(result);

	    var employeeStatus = {};

		var activeEmployee = 0;
		var inactiveEmployee = 0;
		var totalRecords = 0;
		var newEmpArr = result.map(employee => {

			if(employee.isActive){
				activeEmployee++;
			}else{
				inactiveEmployee++;
			}
			totalRecords++;

			employeeStatus.activeEmployee = activeEmployee;
			employeeStatus.inactiveEmployee = inactiveEmployee;
			employeeStatus.totalRecords = totalRecords;

			return employeeStatus

		})

		if(result.length == 0){
			employeeStatus.activeEmployee = activeEmployee;
			employeeStatus.inactiveEmployee = inactiveEmployee;
			employeeStatus.totalRecords = totalRecords;
		}

		employees = result;
		response.render('emplisting',{employees,employeeStatus});
		return 1;

	}).catch(error => {
	    console.error(error);
	    // response.error(500);
	    response.redirect('/404.html');
	});
};

// update employee values from database by Admin
function updateEmployeesAdmin(request){
	var ref = firebaseApp.database().ref(databaseName + '/' + (request.body.id - 1));
	console.log("Employees Database update URL by Admin: " + ref);
	// console.log(request.body);

	var empObject = { };

	if(request.body.id == 1){
		console.log("CEO update");
		// CEO
		empObject = {
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
			pan: request.body.pan,
	        isActive: request.body.isActive ? true : false,
	        isAdmin: request.body.isAdmin ? true : false
		};
	}else{
		console.log("Other Employee update");
		// Other Employee
		empObject = {
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
			pan: request.body.pan,
	        isActive: request.body.isActive ? true : false,
	        isAdmin: request.body.isAdmin ? true : false,
	        managerId: parseInt(request.body.managerId),
	        managerName: request.body.managerName			
		};
	}

	ref.update(
		empObject
	  , error => {
	    if (error) {
	      // The write failed...
	      	console.log("Updating failed");	
	    } else {
	      // Data saved successfully!
	      	console.log("Update employee details successfully for " + (request.body.id - 1) + " - " + request.body.firstName);	
	    }
	  });

	return ref.once('value').then(snap => snap.val());
}

// to updateByIdAdmin employee api web
let updateByIdAdmin = (request, response) =>{
	// response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	updateEmployeesAdmin(request).then(employee => {

		// response.render('empdetails',{employee});
		var message = "Details updated successfully";
		// response.redirect('/empdetails/' + employee.id + '');
		// var empdetailspage = `String('/empdetails/'+employee.id)`;
		// response.redirect('/empdetails/'+employee.id+'');
		var empdetail = employee;
		response.render('empdetails',{empdetail,message});
		return 1;
	}).catch(error => {
	    console.error(error);
	    // response.error(500);
	    response.redirect('/404.html');
	});
};




// to addEmpDetail employee api web
let addEmpDetail = (request, response) =>{

	getEmployeesAdmin(request).then(employees => {

		var newEmpId = employees.length + 1;

		response.render('addempdetail',{newEmpId});
		return 1;
	}).catch(error => {
	    console.error(error);
	    // response.error(500);
	    response.redirect('/404.html');
	});
};

// add employee values to database
function addEmployees(request){
	var ref = firebaseApp.database().ref(databaseName + '/' + (request.body.id - 1));
	console.log("Employees Database URL Admin: "+ ref);
	// console.log(request.body);
	// var newchildnode = (request.body.id - 1);
	// console.log(newchildnode);
	ref.set({
		id: parseInt(request.body.id),
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
		pan: request.body.pan,
        isActive: request.body.isActive ? true : false,
        isAdmin: request.body.isAdmin ? true : false,
        managerId: parseInt(request.body.managerId),
        managerName: request.body.managerName
	  }, error => {
	    if (error) {
	      // The write failed...
	      	console.log("Insert failed");	
	    } else {
	      // Data saved successfully!
	      	console.log("New employee details inserted successfully for " + (request.body.id - 1) + " - " + request.body.firstName);	
	    }
	  });

	return ref.once('value').then(snap => snap.val());
}

// to empAddByAdmin employee api web
let empAddByAdmin = (request, response) =>{

	addEmployees(request).then(employee => {

		console.log(employee);

		// response.redirect('/emplisting');
		// response.redirect('/empdetails/'+employee.id+'');
		var message = "Details added successfully. Do you want add more?";
		var newEmpId = employee.length + 1;

		response.render('addempdetail',{newEmpId,message});
		return 1;
	}).catch(error => {
	    console.error(error);
	    // response.error(500);
	    response.redirect('/404.html');
	});
};

// to getManagerList employee api web
let getManagerList = (request, response) =>{
	
	request.query.isActive = "true"; // to get now only active users

	getEmployeesAdmin(request).then(employees => {

		const employeesarray = employees.map(employee => {

			const container = {};

		    container.managerId = employee.id;
		    container.managerName = employee.firstName + " " + employee.lastName;

		    return container;
		})

		response.json(employeesarray);
		return 1;
	}).catch(error => {
	    console.error(error);
	    // response.error(500);
	    var result = {};
	    response.json(result);
	});
};

// to emplisting employee api web
let emplisting = (request, response) =>{
	response.set('Cache-Control', 'public, max-age=150, s-maxage=300');
	getEmployeesAdmin(request).then(employees => {

		var employeeStatus = {};

		var activeEmployee = 0;
		var inactiveEmployee = 0;
		var totalRecords = 0;
		var newEmpArr = employees.map(employee => {

			if(employee.isActive){
				activeEmployee++;
			}else{
				inactiveEmployee++;
			}
			totalRecords++;

			employeeStatus.activeEmployee = activeEmployee;
			employeeStatus.inactiveEmployee = inactiveEmployee;
			employeeStatus.totalRecords = totalRecords;

			return employeeStatus

		})

		// console.log(newEmpArr);

		// var employeeStatus = {};
		// employeeStatus.activeEmployee = activeEmployee;
		// employeeStatus.inactiveEmployee = inactiveEmployee;
		// employeeStatus.totalRecords = totalRecords;

		// console.log(employeeStatus);

		response.render('emplisting',{employees,employeeStatus});
		return 1;
	}).catch(error => {
	    console.error(error);
	    response.redirect('/404.html');
	});
};

// to empDetailsById employee api web
let empDetailsById = (request, response) =>{
	// response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	response.set('content-type', 'text/html; charset=utf-8');

	getEmployeesAdmin(request).then(employees => {

		var empdetail ;

		let id = request.params.id;
	    empdetail = employees.filter(employee => employee.id == id)[0];

	    response.render('empdetails',{empdetail});
		return 1;
	}).catch(error => {
	    console.error(error);
	    response.redirect('/404.html');
	});
};

// to loginAdmin employee api web
let loginAdmin = (request, response) =>{
	var username = request.body.username;
	var password = request.body.password;
	var message = "";

	if (username && password) {

			if (username == adminUserName && password == adminPassword) {
				response.redirect('/emplisting');
			} else {
				message = 'Incorrect Username and/or Password!';
				response.render('index',{message});
			}			
	}else {
		message = 'Please enter Username and Password!';
		response.render('index',{message});
	}
};

// to logOut employee api web
let logOut = (request, response) =>{
	response.redirect('/');
};

// delete employee values from database
function deleteEmployees(request){
	var ref = firebaseApp.database().ref(databaseName + '/' + (request.params.id - 1));
	console.log("Employees Database URL Admin: "+ ref);
	ref.remove()
	console.log("Delete record successfully");	

	return ref.once('value').then(snap => snap.val());
}

// to deleteEmpByAdmin employee api web
let deleteEmpByAdmin = (request, response) =>{

	deleteEmployees(request).then(employee => {

		response.redirect('/emplisting');
		return 1;
	}).catch(error => {
	    console.error(error);
	    // response.error(500);
	    response.redirect('/404.html');
	});
};

//************************ Admin website End **********************************//

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const app = express();
app.use(cors());
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');


app.get('/',(request, response) =>{
	response.render('index', { title: 'SED Login' });
});


// SED API Webservices for Mobile and Admin site

//************************ Mobile app start **********************************//

app.get('/sarvikaemployees',findAll); //findAll and findByName , findByEmail all together

app.get('/sarvikaemployees/:id',findById); // open page for edit from listing

app.put('/empdetailsupdate',updateById); // to update emplyee with in app

//************************ Mobile app end ***********************************//


//************************ Admin website Start ********************************//

app.post('/login',loginAdmin); // to login by admin

app.get('/logout',logOut); // to logout by admin

app.get('/emplisting',emplisting); // to get all employee listing

app.get('/empdetails/:id',empDetailsById); // to get employee detail by id

app.get('/sarvikaemployeesadmin',findAllAdmin); //findAll and findByName , findByEmail all together

app.post('/empdetailsupdateadmin',updateByIdAdmin); // to update existing employee details

app.get('/addempdetail',addEmpDetail); // to show add employee detail page

app.post('/empaddbyadmin',empAddByAdmin); // to add new employee detail to database

app.get('/managerlist',getManagerList); // to get all employee name for reporting manager to assign

app.get('/deleteemployee/:id',deleteEmpByAdmin); // to delete employee by id



//************************ Admin website End **********************************//

let listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

exports.app = functions.https.onRequest(app);
