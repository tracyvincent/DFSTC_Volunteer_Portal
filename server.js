//NODE MODULE IMPORTS
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local').Strategy;
const env = require('dotenv').config();
const multer = require('multer');

//ROUTE AND MODEL IMPORTS
const User = require('./models/user.js');
const index = require('./routes/index.js');
const register = require('./routes/register.js');
const login = require('./routes/login.js');
const api = require('./routes/api.js');

//DECLARE SERVER APP
const app = express();

//MONGO CONNECTION
const MongoURI = 'mongodb://localhost:27017/dfstc'
const MongoDB = mongoose.connect(MongoURI).connection;

MongoDB.on('error', function(err) {
  console.log('MongoDB Connection Error:', err);
})

MongoDB.once('open', function() {
  console.log('MongoDB Connection Open!');
})

//PASSPORT AND SESSION CONFIG
app.use(session({
  secret: process.env.SECRET,
  key: 'user',
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: 24 * 60 * 60 * 1000, secure: false}
}));

passport.use('local', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
  },
  function(email, password, done) {
    User.findOne({email: email}, function(err, user) {
      if(err) {
        return done(err);
      }
      if(!user) {
        return done(null, false, {message: 'Incorrect email and password'})
      }
      user.passwordCheck(password, function(err, isMatch) {
        if(err) {
          return done(err)
        }
        if(isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {message: 'Incorrect email and password'});
        }
      });
    });
  }
));

//passport serializing/deserializing users
passport.serializeUser(function(user, done) {
  done(null, user.id);
})

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    if(err) {
      return done(err);
    }
    //determine what info is passed in the request.user object - set password field to null.
    var userInfo = user;
    userInfo.password = null;
    done(null, userInfo);
  })
})

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Multer functionality
var storage  = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './userImages')
  },
  // filename: filename
  // function(req, file, cb){
  //   var datetimestamp = Date.now();
  //   cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length-1])
  // }
});
var upload = multer({
  storage:storage
}).single('file');


//STATIC AND SERVER CONFIG
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//ROUTES
app.post('/upload', function(req, res){
  upload(req, res, function(err){
    if(err){
      res.jason({error_code:1, err_desc:err});
      return;
    }
    res.json({error_code:0, err_desc:null});
  })
});
app.use('/register', register);
app.use('/login', login);
app.get('/logout', function(request, response) {
  request.logout();
  response.sendStatus(200);
})
app.use('/api', api);
app.use('*', index);

const port = process.env.PORT || 3000;
const server = app.listen(port, function() {
  console.log('listening on port:', port);
})
