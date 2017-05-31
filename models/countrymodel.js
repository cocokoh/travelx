var mongoose = require('mongoose')

var countrySchema = new mongoose.Schema({
  country: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  picture: {
    type: String
  },
  continent: {
    type: String
  }
})

var Country = mongoose.model('Country', countrySchema)

module.exports = Country
