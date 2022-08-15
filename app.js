//jshint esversion:6
//  ---------------- requirments    ------------
require('dotenv').config();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const bcrypt = require('bcrypt');

 // --------- framework initialization  ----------------------
const express = require("express");
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

//  ------------------ initialization variables ----------------
const saltRounds = 10;


 //  --------------- DB initialization  ------------------------

const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});


const User = new mongoose.model('user', userSchema);


//  ------------------------ Application   ------------------------------
app
.get("/", (req, res)=>{
  res.render("home");
})
.get("/login", (req, res)=>{
  res.render("login");
})
.get("/register", (req, res)=>{
  res.render("register");
})
.post("/register", (req, res)=>{

  // Hashing and Salting
  bcrypt.hash(req.body.password, saltRounds, function(err,hash){
    const newUser = new User({
      email : req.body.username,
      password: hash
    });
      console.log(newUser);
    newUser.save((err)=>{
      if(!err){
        res.render("secrets");
      }else{
        console.log(err);
      };
    });
  })
})
.post("/login",(req, res)=>{

  const loginUser ={
    username : req.body.username,
    password: req.body.password
  };
  User.findOne({email: loginUser['username']}, (err, foundUser)=>{
    if(!err){

      console.log(foundUser);
      if(foundUser){

        bcrypt.compare(loginUser['password'], foundUser['password'], (err, result)=>{
          if(result === true){
  
            res.render("secrets");
          };
        });
      };
    }else{
      console.log(err);
    };
  });

});



app.listen(3000, function(){
  console.log("Server started on port: 3000");
})
