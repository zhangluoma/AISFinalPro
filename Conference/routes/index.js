var express = require('express');
var router = express.Router();
var um = require('userManagment');


/* GET home page. */


router.get('/', function(req, res, next) {
  if(req.session.userName){
  	um.login(req.session.userName,req.session.password,function(){
  		res.render('join', { title: 'Welcome', roomNumber:req.session.roomNumber ,userName:req.session.userName,logedIn: "yes",footer: '' });
	},function(){
		res.render('index', { title: 'Welcome', logedIn: "no", footer: '' });
	});
  }else{
  	res.render('index', { title: 'Welcome', logedIn: "no", footer: '' });
  }
});


//===========upload============
router.get('/upload', function(req,res,next){
	if(req.session.roomNumber!=undefined && req.session.userName!=undefined){
			res.render('page_after_login/upload', {roomNumber: req.session.roomNumber, userName: req.session.userName});
		}else{
			res.render('index', { title: 'Welcome', logedIn: "no", footer: '' });
		}
});
//=============================


router.get('/profile', function(req, res, next) {
   um.login(req.session.userName,req.session.password,function(){
  		um.getProfile(req.session.userName,function(lastName,firstName,suffix,description){
  			res.render('profile', {title: 'profile', lastName: lastName, firstName: firstName, suffix: suffix, description: description, userName:req.session.userName, logedIn: "yes", footer: ''});
  		},function(){
  			res.send("can't get your profile!");
  		});
	},function(){
		res.render('index', { title: 'Welcome', logedIn: "no", footer: '' });
	});
});


router.get('/logout', function(req, res, next) {
   req.session.destroy();
   res.redirect('/');
});


router.get('/back', function(req, res, next) {
	um.login(req.session.userName,req.session.password,function(){
		res.render('join', { title: 'Welcome', roomNumber:'' ,userName:req.session.userName,logedIn: "yes", userId:req.session.userId,footer: '', roomPassword: req.session.roomPassword, alert: " " });
	}, function(){
		res.render('index', { title: 'Welcome', logedIn: "no", footer: '' });
	});
});


router.post('/signUp',function(req,res,next){
	console.log(req.body.userId+req.body.password);
	um.createUser(req.body.userId,req.body.password,function(){
		console.log("good");
		res.redirect(307,'/login');
	},function(){
		res.redirect('/');
	});
});


router.get('/dashboard', function(req, res, next) {
   um.login(req.session.userName,req.session.password,function(){
  		if(req.session.roomNumber!=undefined){
  			res.render('page_after_login/body', {userName:req.session.userName,roomNumber: req.session.roomNumber});
  		}else{
  			res.render('join', { title: 'Welcome', userName:req.session.userName, logedIn: "yes", userId:req.session.userName,footer: '' });
  		}
	},function(){
		res.render('index', { title: 'Welcome', logedIn: "no", footer: '' });
	});
});


router.get('/changeProfile',function(req,res,next){
	um.setProfile(req.param('userId'),req.param('lastName'),req.param('firstName'),req.param('suffix'),req.param('description'),function(){
		res.redirect('/profile');
	},function(){
		res.redirect('/profile');
	});
});


router.post('/login', function(req, res, next) {
	var userId = req.body.userId;
	var password = req.body.password;
	var sess;
	um.login(userId,password,function(){
		sess = req.session;
		sess.userName=userId;
		sess.password=password;
		res.render('join', { title: 'Welcome', roomNumber:'' ,userName:req.session.userName,logedIn: "yes", userId:userId,footer: '', roomPassword: req.session.roomPassword, alert: " " });
	},function(){
		res.send("fail!");
	});
  	//res.send(userId+password);
});


router.post('/joinRoomRequest', function(req, res, next) {
	um.login(req.session.userName,req.session.password,function(){	
	//on login success	
		var roomNumber = req.body.roomNumber;
		var roomPassword = req.body.roomPassword;
		var requestType = req.body.requestType;
		req.session.roomNumber=roomNumber;
		req.session.roomPassword=roomPassword;
		var db = require('dbHelper');

		console.log("request type = "+requestType);

		if (requestType==="join"){
			//verify room credential function
			var checkRoomCredential = function(roomNumber, password, onSuccess, onFailure){
				db.query("select * from room where roomnumber = '"+roomNumber+"' AND password = '"+roomPassword+"'",function(error,results){
					if(error || results.length==0){
						onFailure();
					}else{
						onSuccess();
					}
				});
			}
			//verify room credential
		  	checkRoomCredential(roomNumber, roomPassword,
		  	function(){	//room credential good
		  		res.render('page_after_login/body', {userName:req.session.userName,roomNumber: roomNumber, roomPassword: req.session.roomPassword});
			},
			function(){	//room credential bad
				res.render('join', { title: 'Welcome', roomNumber:'' ,userName:req.session.userName,logedIn: "yes", userId:req.session.userId,footer: '', roomPassword: req.session.roomPassword, alert: "room does not exist or incorrect password." });
			});
		}else{
			//verify existance function
			var checkRoomExistance = function(roomNumber, onSuccess, onFailure){
				db.query("select * from room where roomnumber = '"+roomNumber+"'",function(error,results){
					if(error || results.length==0){
						onFailure();
					}else{
						onSuccess();
					}
				});
			}
			//verify existance 
		  	checkRoomExistance(roomNumber,
		  	function(){	//room already existed
				res.render('join', { title: 'Welcome', roomNumber:'' ,userName:req.session.userName,logedIn: "yes", userId:req.session.userId,footer: '', roomPassword: req.session.roomPassword, alert: "room with this room number already exists." });
			},
			function(){	//room not exist
				db.query("insert into room(roomNumber,password) values('"+roomNumber+"','"+roomPassword+"')",function(error,results){});
		  		res.render('page_after_login/body', {userName:req.session.userName,roomNumber: roomNumber, roomPassword: req.session.roomPassword});
			});
		}

	},function(){	//on login fail
		res.render('index', { title: 'Welcome', logedIn: "no", footer: '' });
	});
});


module.exports = router;
