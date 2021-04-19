const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const e = require("express");

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
  secret: "ThisIsMySecret.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/secrets", function (req, res) {
  res.set(
    'Cache-Control', 
    'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0'
  );
  if (req.isAuthenticated())
  {
    res.render("secrets");
  }
  else
  {
    res.redirect("/login");
  }
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.post("/register", function (req, res) {
  User.register({ username: req.body.username }, req.body.password, function (err, User) {
    if (err)
    {
      console.log(err);
      res.redirect("/register");
    }
    else
    {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});

app.post("/login", function (req, res) {
  User.findOne({ username: req.body.username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    }
    if (!foundUser) {
      res.redirect("/login");
    }
    else {
      const user = new User({
        username: req.body.username,
        password: req.body.password
      });
    }
    passport.authenticate("local", function (err, user) {
      if (err) {
        console.log(err);
      }
      if (!user) {
        res.redirect("/login");
      }
      else {
        req.login(user, function (err) {
          if (err) {
            console.log(err);
            res.redirect("/login");
          }
          else {
            res.redirect("/secrets");
          }
        });
      }
    })(req, res);
  });
});

app.listen(3000, function () {
  console.log("Server is up and running on port 3000.");
});