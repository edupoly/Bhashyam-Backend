var mongoose = require('mongoose');

var customerCareSchema = mongoose.Schema({
    name : String,
    id : String,
    password : String,
    role : String
})
var CustomerCare = mongoose.model('customercare',customerCareSchema);
module.exports = CustomerCare;
