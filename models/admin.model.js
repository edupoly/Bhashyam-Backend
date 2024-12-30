var mongoose = require('mongoose');

var admninSchema = mongoose.Schema({
    name : String,
    id : String,
    password : String
})
var Admin = mongoose.model()