var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var db = mongoose.connection
var User = require('../models/usermodel')
var passport = require('passport')
var config = require('../config/ppConfig')
var isLoggedIn = require('../middleware/isLoggedIn')
var Country = require('../models/countrymodel')
var geocoder = require('geocoder')
var request = require('request')

router.get('/', function(req, res) {
  res.render('homepage')
})

router.post('/choosepictures', function(req, res) {
  Country.find({
    continent: req.body.continent
  }, function(err, data) {
    var currentIndex = data.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = data[currentIndex];
      data[currentIndex] = data[randomIndex];
      data[randomIndex] = temporaryValue;
    }
    res.render('pictures', {picture: data})
  })
})

router.get('/results', function(req, res) {
  res.render('results')
})

router.post('/results', function(req, res) {
  Country.find({
    picture: req.body.picture
  }, function(err, data) {
    var h = []
    data.map(function(each, index) {
      request(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${each.city}+top+sights&key=AIzaSyAi5L8HFipThJzDSh6bghqzZD6NWp_pDh4`, function(err, response, body1) {
        h.push(JSON.parse(body1))
        if (index === data.length - 1) {
          res.render('results', {
            infos: data,
            locals: h
          })
        }
      })
    })
  })
})

router.get('/register', function(req, res) {
  res.render('signup')
})

router.post('/register', function(req, res) {
  var first_name = req.body.first_name
  var email = req.body.email
  var password = req.body.password
  var contact = req.body.contact
  var admin = true
  var address = req.body.address

  var newUser = new User({
    first_name: first_name,
    password: password,
    contact: contact,
    email: email,
    admin: admin,
    address: address
  })

  if (newUser.first_name === '' || newUser.email === '' || newUser.password === '') {
    res.send('error')
  } else {
    newUser.save(function(err, data) {
      if (err)
        throw err
      res.redirect('/')
    })
  }
})

router.post('/login', passport.authenticate('local', {
  failureFlash: 'Unsuccessful',
  failureRedirect: '/login'
}), (req, res) => {
  User.findOne({
    _id: req.user.id
  }, function(err, data) {
    if (err)
      throw err
      console.log(data)
    var datas = data
    // console.log(datas)
    // console.log(req.user.id)
    if (datas) {
      if (datas._id.equals(req.user.id) && req.user.admin === true) {
        req.flash("success", "successfully logged in")
        res.redirect('/admin/profile')
      }
    } else {
      res.redirect('/profile')
    }
  })
})
module.exports = router
