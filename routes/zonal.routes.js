var express = require("express");
var app = express();
var cors = require("cors");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
var jwt = require("jsonwebtoken");
var routers = express.Router();
var Complaint = require("../models/complaints.model");
var Zonal = require("../models/zonal.model");
const router = require("./branch.routes");

var mcurl =
  // "mongodb+srv://jvdimvp:Pradeep903@cluster0.d2cwd.mongodb.net/Bhashyam?retryWrites=true&w=majority&appName=Cluster0";
  "mongodb+srv://lakshman:ramu123@cluster0.mmeuw.mongodb.net/Schoolproject?retryWrites=true&w=majority&appName=Cluster0"

mongoose
  .connect(mcurl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

// routers.post("/zonallogin", (req, res) => {
//   console.log(req.body);
//   Zonal.findOne({ mobile: req.body.mobile })
//     .then((zonal) => {
//       var token = jwt.sign({ ...zonal }, "secretkey");
//       console.log(token);
//       res.json({ msg: "zonal login success", token });
//     })
//     .catch((err) => {
//       console.log(err);
//       res.json({ msg: "zonal login failed" });
//     });
// });

routers.get("/complaintsbybranch", (req, res) => {
  Complaint.find()
    .then((data) => {
      console.log(data);
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

routers.post("/addzonal", (req, res) => {
  var newBranch = new Zonal(req.body);
  newBranch
    .save()
    .then((zonalofficer) => {
      console.log(zonalofficer);
      res.json({ msg: "Zonal Added" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ msg: "zonal add failed", error: err.message });
    });
});

// routers.get("/zonalscomplaints", async (req, res) => {
//   var token = req.headers.authorization;
//   console.log("tokenjj", token);
//   if (!token) {
//     res.json({ msg: "token missing" });
//   }
//   var zonal = jwt.verify(token, "secretkey");
//   console.log("pdata", zonal);

//   Complaint.find({ branch: { $in: zonal?._doc?.branches } })
//     .then((complaints) => {
//       console.log("comp", complaints);
//       res.status(200).json(complaints);
//     })
//     .catch((error) => {
//       res
//         .status(500)
//         .json({ error: "Failed to fetch complaints", details: error.message });
//     });
// });


routers.get("/zonalscomplaints", (req, res) => {
  var token = req.headers.authorization;
  if (!token) {
    return res.status(400).json({ msg: "Token missing" });
  }

  var zonal;
  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) {
      return res.status(401).json({ msg: "Invalid token" });
    }
    zonal = decoded;
  });

  if (!zonal) {
    return res.status(401).json({ msg: "Unauthorized access" });
  }

  var { branches = '', status, mobile } = req.query;

  console.log("req.query", req.query);

  var branchArray = branches ? branches.split(',').map(branch => branch.trim()) : [];
  console.log("branchArray (from query):", branchArray);

  var validBranches = branchArray.filter(branch => zonal._doc?.branches.includes(branch));
  console.log("Valid branches (assigned to zonal):", validBranches);

  var branchFilter = validBranches.length ? { branch: { $in: validBranches } } : { branch: { $in: zonal._doc?.branches || [] } }; 

  var statusFilter = status ? { "status.code": status } : {};

  // var mobileFilter = mobile ? { mobile: { $regex: `^${mobile}$`, $options: "i" } } : {};
  var mobileFilter = {};
  if(mobile){
    var parsemobile = parseInt(mobile,10);
    if(!isNaN(parsemobile)){
      mobileFilter = {mobile:parsemobile}
    }else{
      return res.json({msg:"Invalid mobile number format"})
    }
  }
  console.log("Branch filter:", branchFilter);
  console.log("Status filter:", statusFilter);
  console.log("Mobile filter:", mobileFilter);

  var filter = { ...branchFilter, ...statusFilter, ...mobileFilter };

  Complaint.find(filter)
    .then((complaints) => {
      res.json(complaints);
    })
    .catch((error) => {
      console.error("Error fetching complaints:", error);
      res.status(500).json({ error: "Failed to fetch complaints", details: error.message });
    });
});

module.exports = routers; 
