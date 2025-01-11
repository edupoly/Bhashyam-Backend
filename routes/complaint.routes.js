var express = require("express");
var app = express();
var cors = require("cors");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
app.use(bodyParser.json());
var jwt = require("jsonwebtoken");
app.use(cors());
app.use(express.json());
var route = express.Router();
// var Zonal = require('../models/zonal.model')
var Complaint = require("../models/complaints.model");
const router = require("./branch.routes");
var mcurl = mongodb+srv://infoedupoly:edupoly83@cluster0.eitlw5l.mongodb.net/Schoolproject?retryWrites=true&w=majority&appName=Cluster0;
  // "mongodb+srv://jvdimvp:Pradeep903@cluster0.d2cwd.mongodb.net/Bhashyam?retryWrites=true&w=majority&appName=Cluster0";
  //"mongodb+srv://lakshman:ramu123@cluster0.mmeuw.mongodb.net/Schoolproject?retryWrites=true&w=majority&appName=Cluster0"

mongoose
  .connect(mcurl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

route.get("/", (req, res) => {
  Complaint.find()
    .then((data) => {
      console.log(data);
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

route.post("/addcomplaint", (req, res) => {
  var newcom = new Complaint(req.body);
  newcom.status.push({ code: "registered", timestamp: Date.now() });
  newcom
    .save()
    .then((complaint) => {
      console.log(complaint);
      res.json({ msg: "Complaint Added" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ msg: "complaint add failed", error: err.message });
    });
});

route.put("/assigncomplaint/:id", (req, res) => {
  var updstatus = { code: "assigned", timestamp: Date.now() };
  var updcomplaint = Complaint.findOneAndUpdate(
    { _id: req.params.id },
    { $push: { status: updstatus } }
  );
  updcomplaint
    .then((complaint) => {
      console.log(complaint);
      res.json({ msg: "Assigned Complaint" });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json({ msg: "Complaint Not Assigned ", error: err.message });
    });
});

route.put("/acceptcomplaint/:id", (req, res) => {
  var updstatus = { code: "accepted", timestamp: Date.now() };
  var updcomplaint = Complaint.findOneAndUpdate(
    { _id: req.params.id },
    { $push: { status: updstatus } }
  );
  updcomplaint
    .then((complaint) => {
      console.log(complaint);
      res.json({ msg: "Complaint Accepted" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ msg: "Not Accepted", error: err.message });
    });
});

route.put("/complaintsolved/:id", (req, res) => {
  var updstatus = { code: "solved", timestamp: Date.now() };
  var updcomplaint = Complaint.findOneAndUpdate(
    { _id: req.params.id },
    { $push: { status: updstatus } }
  );
  updcomplaint
    .then((complaint) => {
      console.log(complaint);
      res.json({ msg: "Complaint Solved" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ msg: "Not Solved", error: err.message });
    });
});

route.put("/complaintclosed/:id", (req, res) => {
  var updstatus = { code: "closed", timestamp: Date.now() };
  var updcomplaint = Complaint.findOneAndUpdate(
    { _id: req.params.id },
    { $push: { status: updstatus } }
  );
  updcomplaint
    .then((complaint) => {
      console.log(complaint);
      res.json({ msg: "Complaint Closed" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        msg: "Something went wrong in closing complaint",
        error: err.message,
      });
    });
});

route.get('/allcomplaints',(req,res)=>{
    var token = req.headers.authorization;
    if (!token) {
      return res.status(400).json({ msg: "Token missing" });
    }
  
    var customercare;
    jwt.verify(token, "secretkey", (err, decoded) => {
      if (err) {
        return res.status(401).json({ msg: "Invalid token" });
      }
      console.log("decoded",decoded);
      if(decoded._doc?.role === 'Customercare')
        customercare = decoded
      
    });
  
    if (!customercare) {
      return res.status(401).json({ msg: "Unauthorized access" });
    }
  
   var { branches = '', status, mobile } = req.query;
   console.log("all", branches, status, mobile);

   var branchFilter = branches.length ? { branch : { $in :branches.split(',').map((branch) =>{return branch.trim()})}} : {};
   const statusFilter = status ? { "status.code": status } : {};
    
   var mobileFilter = {};
   if(mobile){
      var parsemobile = parseInt(mobile,10);
      if(!isNaN(parsemobile)){
        mobileFilter = { mobile : parsemobile};
      }else{
        return res.json({msg:"Invalid mobile number format"})
      }
   }
   var filter = { ...branchFilter ,...statusFilter ,...mobileFilter}
   Complaint.find(filter)
   .then((data)=>{
    res.json(data);
   })
   .catch((err)=>{
    console.log(err);
    res.json({msg:'Failed to fetch complaints'})
   })
})

module.exports = route;
