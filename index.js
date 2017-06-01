var express = require('express')
var app = express()
require('dotenv').config({
  silent: true
})

var mongoose = require('mongoose')

var port = process.env.PORT || 5000;

var dbURI = process.env.PROD_MONGODB || 'mongodb://localhost:27017/lastproject'
mongoose.connect(dbURI)
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log('connected!')
})
mongoose.Promise = global.Promise
var bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
var methodOverride = require('method-override')
app.use(methodOverride('_method'))
app.set('view engine', 'ejs')
var flash = require('connect-flash')
var session = require('express-session')
var passport = require('./config/ppConfig')

app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(function(req, res, next) {
  // before every route, attach the flash messages and current user to res.locals
  // res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

//
// app.use(function(req, res, next) {
//   res.locals.success_msg = req.flash('success_msg')
//   res.locals.error_msg = req.flash('error_msg')
//   res.locals.error = req.flash('error')
//   next()
// })
//+++++++++++++STANDARD STUFF+++++++++++++++++++++++++++++++++++++++++

// TRYING TO LINK CSS
var path = require('path')
app.use(express.static(path.join(__dirname, 'public')))
var ejsLayouts = require('express-ejs-layouts')
app.use(ejsLayouts)

var cloudinary = require('cloudinary')
var multer = require('multer')
var upload = multer({dest: './uploads/'})
var fs = require('fs')
cloudinary.config({
  cloud_name: 'programbao',
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// CONNECTING AND USING THE CONTROLLERS FILES
var main = require('./routes/indexroute')
var admin = require('./routes/adminroute')
app.use('/admin', admin)
app.use('/', main)



app.listen(port, function() {
  console.log('listening to ' + port)
})
