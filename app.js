//jshint esversion:6
//  ---------------- requirments    ------------
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

 //  --------------- DB part  ---------------------

const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET_KEY, encryptionFields: ['password']});

const User = new mongoose.model('user', userSchema);







//  ----------------- App ----------------------
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
  const newUser = new User({
    email : req.body.username ,
    password: req.body.password
  });

  newUser.save((err)=>{
    if(!err){
      res.render("secrets");
    }else{
      console.log(err);
    };
  });
})
.post("/login",(req, res)=>{
  const user ={
    username : req.body.username,
    password: req.body.password
  };

  User.findOne({email: user['username']}, (err, foundUser)=>{
    if(!err){
      if(foundUser){
        res.render("secrets");
      }
    }else{
      console.log(err);
    };
  });

});



app.listen(3000, function(){
  console.log("Server started on port: 3000");
})
