const mongoose = require('mongoose')

// instantiate a mongoose schema
const urlSchema = new mongoose.Schema({
    urlCode : {
        type : String,
        unique : true,
        required : true,
        lowercase : true,
        trim : true
    },
    longUrl : {
        type : String,
        required : true,
        trim : true
    },
    shortUrl : {
        type : String,
        required : true,
        unique : true
    }}, {timestamps : true})

    // create a model from schema and export it
    module.exports = mongoose.model('Url', urlSchema)