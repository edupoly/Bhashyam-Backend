var mongoose = require('mongoose');
var zonalSchema = mongoose.Schema({
    zonalname : String,
    mobile : Number,
    branches : Array
});
var Zonals = mongoose.model('zonalofficer',zonalSchema);
module.exports = Zonals;