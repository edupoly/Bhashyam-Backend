var mongoose = require('mongoose');

var statusSchema = mongoose.Schema({
    code: String,
    timestamp: Number
});
var complaintSchema = mongoose.Schema({
    studentname : String,
    mobile : Number,
    branch : String,
    status : [statusSchema],
    complaint : String
},{timestamps:true});
var Complaint = mongoose.model('complaint',complaintSchema);
module.exports = Complaint;