var mongoose = require('mongoose');
var branchSchema = mongoose.Schema({
    branchname : String,
    principalname : String,
    mobile : Number,
    image : String
});
var Branch = mongoose.model('branche',branchSchema);
module.exports = Branch;