var express = require('express');
var router = express.Router();
var passport = require('passport');
var db;
const MongoClient = require('mongodb').MongoClient;

var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user.js');

var session = require('express-session');
var sess;


router.use(session({secret: 'ssshhhhh'}));

MongoClient.connect('mongodb://metalmount:metalmount%4082@ds163940.mlab.com:63940/notice-board',(err,database)=>{
  if(err) return console.log(err)
  db = database;

});

//Register
router.get('/register', function(req,res){
	res.render('register.ejs',{errors:""});
});

//login

router.get('/login',function(req,res){
	res.render('login.ejs');
});

router.get('/home',function(req,res){
	res.render('home.ejs');
});

router.get('/general', (req,res)=>{
	db.collection('announcements').find().sort({priority:-1}).toArray((err,result)=>{
		res.render('general.ejs',{announcements:result})
	})
})

router.get('/fellow', (req,res)=>{
	db.collection('announcements').find().sort({"id":-1}).toArray((err,result)=>{
		res.render('fellow.ejs',{announcements:result})
	})
})

router.get('/staff', (req,res)=>{
	db.collection('announcements').find().sort({priority:-1}).toArray((err,result)=>{
		res.render('staff.ejs',{announcements:result})
	})
})
router.post('/home',(req,res)=>{
	db.collection('announcements').save(req.body,(err,result)=>{
	  if(err) return console.log(err)	
	
	  console.log("saved to the database");
	  db.collection('announcements').find().toArray((err,results)=>{
	  	console.log(results)
	  })
	  res.redirect('/users/general');
	})
	
})

router.post('/register', function(req,res){
var name = req.body.name;	
var email = req.body.email;
var username = req.body.username;
var password = req.body.password;
var password2 = req.body.password2;

sess=req.session;
sess.username=req.body.username;
//validation

req.checkBody('name','Name is required').notEmpty();
req.checkBody('email','Email is required').notEmpty();
req.checkBody('email','Email is not valid').isEmail();
req.checkBody('username','Username is required').notEmpty();
req.checkBody('password','password is required').notEmpty();
req.checkBody('password2','password do not').equals(req.body.password);

var errors = req.validationErrors();

if(errors){
	res.render('register.ejs',{errors:errors});
}else{
	var newUser = new User({
		name: name,
		email: email,
		username: username,
		password: password
	});
	User.createUser(newUser, function(err,user){
		if(err) throw err;
		console.log(user);
	});
	req.flash('success_msg','You are registered and can now login');

	res.redirect('/users/login');
}

});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err,user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message:'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err,isMatch){
   	  if(err) throw err;
   	  if(isMatch){
   	  	return done(null,user); 
   	  }else{
   	  	return done(null, false, {message:'Invalid Password'});
   	  }

   	})
   });

  }
));



passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local',{successRedirect:'./home', failureRedirect:'/users/login', failureFlash:true}),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.

    res.redirect('/users/home' + req.user.username);
  });

router.get('/logout', function(req,res){
	req.logout();
	req.flash('success_msg',"You are logged out");
	res.redirect('/users/login');
})

module.exports = router;