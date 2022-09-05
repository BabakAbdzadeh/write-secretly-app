//jshint esversion:6
//  ---------------- requirments    ------------
require('dotenv').config();
const bodyParser = require("body-parser");
const ejs = require("ejs");

// requires for Cookies and session, no need to require passport-local
const session = require('express-session');
const passport = require('passport');
const passortLocalMongoose = require("passport-local-mongoose");


// --------- framework initialization  ----------------------
const express = require("express");
const app = express();

app.use(express.static("public"))
  .set('view engine', 'ejs')
  .use(bodyParser.urlencoded({
    extended: true
  }))

  // initialization for express-session and passport libraries:
  .use(session({
    secret: "desired string!",
    // Forces the session to be saved back to the session store, even if the session was never modified during the request.
    resave: false,
    // Forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified.
    saveUninitialized: true,
    cookie: {
      // HTTPS is necessary for secure cookies
      secure: false
    }
  }))
  .use(passport.initialize())
  .use(passport.session());

//  ------------------ initialization variables ----------------



//  --------------- DB initialization  ------------------------

const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// for Authentication porpuse:
userSchema.plugin(passortLocalMongoose);

const User = new mongoose.model('user', userSchema);

// for Auth porpuse:
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//  ------------------------ Application   ------------------------------
app
  .get("/", (req, res) => {
    res.render("home");
  })
  .get("/login", (req, res) => {
    res.render("login");
  })
  .get("/register", (req, res) => {
    res.render("register");
  })
  .get("/logout", (req, res) => {
    // from passport library
    req.logout((err) => {
      if (err) console.log(err);
    });
    res.redirect("/");
  })
  .get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
      res.render("secrets");
    } else {
      res.redirect("/login");
    }
  })
  .post("/register", (req, res) => {
    User.register({
      username: req.body.username,
    }, req.body.password, function(err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register")
      }
      // passport.authenticate() is middleware which will authenticate the request.
      // In the route down here, the 'local' strategy is used to verify a username and password. passport-local library
      else {
        const authenticate = passport.authenticate('local');
        authenticate(req, res, () => {
          res.redirect("/secrets");
        });
      }
    });

  })
  .post("/login", (req, res) => {

    const user = new User({
      password: req.body.password,
      username: req.body.username
    });

    // this method comes from passport:
    req.login(user, (err) => {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate('local')(req, res, function() {
          res.redirect("/secrets");
        })
      }
    })

  });



app.listen(3000, function() {
  console.log("Server started on port: 3000");
})
