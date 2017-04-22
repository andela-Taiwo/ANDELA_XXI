var express = require('express');
var router = express.Router();
var session = require('express-session');


var sess;


router.use(session({secret: 'ssshhhhh'}));



  // if the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }else{
    req.flash("error_msg","You are not logged in");
    res.redirect('/users/login');


  }
}

//login
//Register
router.get('/',ensureAuthenticated, function(req,res){
  res.render('login.ejs');
});



module.exports = router;


