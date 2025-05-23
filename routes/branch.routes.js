var express = require("express");
var app = express();
var cors = require("cors");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
var jwt = require("jsonwebtoken");
var router = express.Router();
var Branch = require("../models/branch.model");
// var Zonal = require('../models/zonal.model');
var Complaint = require("../models/complaints.model");
var Zonal = require("../models/zonal.model");
var CustomerCare = require('../models/customercare.model');
var mcurl = "mongodb+srv://infoedupoly:edupoly83@cluster0.eitlw5l.mongodb.net/Schoolproject?retryWrites=true&w=majority&appName=Cluster0"
  // "mongodb+srv://jvdimvp:Pradeep903@cluster0.d2cwd.mongodb.net/Bhashyam?retryWrites=true&w=majority&appName=Cluster0";
  // "mongodb+srv://lakshman:ramu123@cluster0.mmeuw.mongodb.net/Schoolproject?retryWrites=true&w=majority&appName=Cluster0"

mongoose
  .connect(mcurl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

router.get("/", (req, res) => {
  Branch.find()
    .then((data) => {
      console.log(data);
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
});
router.post('/addcustomercare',(req,res)=>{
  var newCustomercare = new CustomerCare(  { ... req.body,role :'customercare'});
  newCustomercare
  .save()
  .then((customercare)=>{
    console.log(customercare);
    res.json({msg:"Customer care added"})
  })
  .catch((err)=>{
    console.log(err);
    res.status(500).json({msg:"customer care add failed", error: err.message});
  })
 })
router.post("/login", (req, res) => {
  console.log(req.body);
  if (req.body.empid.charAt(0) === "p") {
    Branch.findOne({ principal_id: req.body.empid })
      .then((principal) => {
        console.log("principald", principal);
        if (!principal) {
          return res.status(404).json({ msg: "Principal not found" });
        }

        if (principal.password !== req.body.password) {
          return res.status(401).json({ msg: "Incorrect password" });
        }
        var token = jwt.sign({ ...principal }, "secretkey");
        console.log(token);
        res.json({ msg: "success", token, role: "principal" , principalname : principal.principalname});
      })
      .catch((err) => {
        console.log(err);
        res.json({ msg: "login failed" });
      });
  } else if(req.body.empid.charAt(0) === 'a'){
    CustomerCare.findOne({ id : req.body.empid })
    .then((customercare)=>{
      if (!customercare) {
        return res.status(404).json({ msg: "Customer care not found" });
      }
      if(customercare.password !== req.body.password){
        return res.status(401).json({msg: "Incorrect Password"})
      }
      console.log('ccare',customercare);
      var token = jwt.sign({ ...customercare } ,"secretkey");
      console.log(token);
      res.json({msg:"success" , token, role :customercare.role,name : customercare.name})
    })
    .catch((err)=>{
      console.log(err);
      res.json({msg: "customer login failed"})
    })
  } else {
    Zonal.findOne({ zonal_id: req.body.empid })
      .then((zonal) => {
        if (!zonal) {
          return res.status(404).json({ msg: "Zonal officer not found" });
        }

        if (zonal.password !== req.body.password) {
          return res.status(401).json({ msg: "Incorrect password" });
        }
        var token = jwt.sign({ ...zonal }, "secretkey");
        console.log(token);
        res.json({ msg: "success", token, role: "zonalofficer", zonalname : zonal.zonalname});
      })
      .catch((err) => {
        console.log(err);
        res.json({ msg: "zonal login failed" });
      });
  }
});

// router.get("/principalcomplaints", (req, res, next) => {
//   console.log("pheaders", req.headers.authorization);
//   var token = req.headers.authorization;
//   if (!token) {
//     res.json({ msg: "token missing" });
//   }
//   var principal = jwt.verify(token, "secretkey");
//   console.log("pdata", principal);

//   Complaint.find({ branch: principal._doc.branchname })
//     .then((data) => {
//       console.log("comp", data);
//       res.json(data);
//     })
//     .catch((err) => {
//       console.log(err);
//       res.json({ msg: "error" });
//     });
// });

router.post("/addbranch", (req, res) => {
  var newBranch = new Branch(req.body);
  newBranch
    .save()
    .then((branch) => {
      console.log(branch);
      res.json({ msg: "Branch Added" });
    })
    .catch((err) => { 
      console.log(err);
      res.status(500).json({ msg: "branch add failed", error: err.message });
    });
});

router.delete("/deletebranch/:id", (req, res) => {
  var branchId = req.params.id;
  Branch.findByIdAndDelete(branchId)
    .then((result) => {
      if (!result) {
        res.json({ msg: "Branch not found" });
      }
      res.json({ msg: "Branch Deleted Successfully" });
    })
    .catch((err) => {
      console.log(err);
      res.json({ msg: "Error deleting branch", error: err.message });
    });
});

router.put("/updatebranch/:id", (req, res) => {
  var branchId = req.params.id;
  var branchData = req.body;
  Branch.findByIdAndUpdate(branchId, branchData, { new: true })
    .then((updbranch) => {
      if (!updbranch) {
        return res.json({ msg: "Branch not found" });
      }
      res.json({ msg: "Branch updated Successfully", updbranch });
    })
    .catch((err) => {
      console.log(err);
      res.json({ msg: "Error in Updating branch" });
    });
});


router.get('/principalcomplaints',(req,res)=>{
  var token = req.headers.authorization;
  if (!token) {
    return res.status(400).json({ msg: "Token missing" });
  }

  var principal = jwt.verify(token, "secretkey");
  if (!principal) {
    return res.status(401).json({ msg: "Unauthorized access" });
  }
  var { status ,mobile} = req.query;
  var statusFilter = status ? { "status.code": status } : {};
  var mobileFilter = {};
  if(mobile){
    var parsemobile = parseInt(mobile,10);
    if(!isNaN(parsemobile)){
      mobileFilter = { mobile : parsemobile};
    }else{
      return res.json({msg:'Invalid number format'})
    }
  }
  var filter = { branch: principal._doc.branchname, ...statusFilter  ,...mobileFilter };
  Complaint.find(filter)
    .then((complaints) => {
      res.json(complaints);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({msg:"Failed to fetch complaints",err: err.message });
    });
})
module.exports = router;
