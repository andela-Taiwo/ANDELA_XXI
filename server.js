console.log("Server starting...");
const express =require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const dbConfig = require('./db.js');

var db


// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var path = require('path');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var localStrategy = require('passport-local').Strategy;

var mongoose = require('mongoose');

var routes =require('./routes/index');
var users = require('./routes/users');




// Middleware
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');
app.use(expressSession({secret: 'mySecretKey'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());

//set static  folder
app.use(express.static( path.join(__dirname, 'public')));


//database connection
mongoose.connect(dbConfig.url);


// set expression session

app.use(session({
	secret:'secret',
	saveUnintialized: true,
	resave: true
}));

// passport
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//connect flash
app.use(flash());


// global variable
app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  next();
});

app.use(function(req,res,next){
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
	next();
});

// routing
app.use('/',routes);
app.use('/users',users);

app.set('port', (process.env.PORT || 3000));


MongoClient.connect('mongodb://metalmount:metalmount%4082@ds163940.mlab.com:63940/notice-board',(err,database)=>{
  if(err) return console.log(err)
  	db = database;
  app.listen(app.get('port'), function(){
  console.log("listening on 3000");
})
});

