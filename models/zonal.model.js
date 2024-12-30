var mongoose = require('mongoose');
var zonalSchema = mongoose.Schema({
    zonal_id : String,
    zonalname : String,
    mobile : Number,
    branches : Array,
    password : String
});
var Zonals = mongoose.model('zonalofficer',zonalSchema);
module.exports = Zonals;