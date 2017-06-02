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

router.get('/', function (req, res) {
  res.render('homepage')
})

router.post('/choosepictures', function (req, res) {
  Country.find({
    continent: req.body.continent
  }, function (err, data) {
    var currentIndex = data.length,
      temporaryValue,
      randomIndex

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1

      // And swap it with the current element.
      temporaryValue = data[currentIndex]
      data[currentIndex] = data[randomIndex]
      data[randomIndex] = temporaryValue
    }
    res.render('pictures', {picture: data})
  })
})

router.get('/results', function (req, res) {
  res.render('results')
})

router.post('/results', function (req, res) {
  Country.find({
    picture: req.body.picture
  }, function (err, data) {
    var h = []
    var z = []
    var b = []
    var k = []
    data.map(function (each, index) {
      request(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${each.city}+top+sights&key=AIzaSyC113IEaSViRdL1wg8-IuqM4jLsUofRuME`, function (err, response, body1) {
        h.push(JSON.parse(body1))
        request(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${each.city}+good+restaurants&key=AIzaSyC113IEaSViRdL1wg8-IuqM4jLsUofRuME`, function (err, response, body2) {
          z.push(JSON.parse(body2))
          // h.forEach(function (data2) {
          //   data2.results.forEach(function (data1) {
          //     request(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${data1.place_id}&key=AIzaSyC113IEaSViRdL1wg8-IuqM4jLsUofRuME`, function (err, response, body3) {
          //       b.push(JSON.parse(body3))
          //       z.forEach(function (data3) {
          //         data3.results.forEach(function (data4) {
          //           request(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${data4.place_id}&key=AIzaSyC113IEaSViRdL1wg8-IuqM4jLsUofRuME`, function (err, response, body4) {
          //             k.push(JSON.parse(body4))
          //
                      if (index === data.length - 1) {
                        console.log('done', b)
                        res.render('results', {
                          infos: data,
                          locals: h,
                          second: z})
                        }
          //           })
          //         })
          //       })
          //     })
          //   })
          // })
        })
      })
    })
  })
})

router.get('/register', function (req, res) {
  res.render('signup')
})

router.post('/register', function (req, res) {
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
    newUser.save(function (err, data) {
      if (err) {
        throw err
      }
      res.redirect('/')
    })
  }
})

router.get('/logout', function (req, res) {
  req.logout()
    // FLASH
  req.flash('success', 'You have logged out')
  res.redirect('/')
})

router.post('/login', passport.authenticate('local', {
  failureFlash: 'Unsuccessful',
  failureRedirect: '/login'
}), (req, res) => {
  User.findOne({
    _id: req.user.id
  }, function (err, data) {
    console.log(data)
    if (err) {
      throw err
    } else {
      res.redirect('/admin/countries')
    }
  })
})

module.exports = router
