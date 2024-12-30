var mongoose = require("mongoose");
var branchSchema = mongoose.Schema({
  branchname: String,
  principal_id: String,
  principalname: String,
  mobile: Number,
  // image: String,
  password: String
});
var Branch = mongoose.model("branche", branchSchema);
module.exports = Branch;
