var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var db = mongoose.connection
var passport = require('passport')
var config = require('../config/ppConfig')
var isLoggedIn = require('../middleware/isLoggedIn')
var Country = require('../models/countrymodel')
var cloudinary = require('cloudinary')
var multer = require('multer')
var upload = multer({dest: '../uploads/'})
var fs = require('fs');

router.get('/countries', function(req, res) {
  Country.find({}, function(err, data){
      res.render('countries', {
      country: data
    })
  })
})

router.post('/countries/add', upload.single('cityPicture'), function(req, res) {
  cloudinary.uploader.upload(req.file.path, function(result) {
    if (result)
    var country = req.body.country
    var city = req.body.city
    var price = req.body.price
    var picture = result.secure_url
    var continent = req.body.continen

    var newCountry = new Country({country: country, city: city, price: price, picture: picture, continent: continent})

    newCountry.save(function(err, data) {
      if (err)
        throw err
      res.redirect('/admin/countries')
    })
  })
})
module.exports = router
