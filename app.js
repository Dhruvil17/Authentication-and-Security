const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 12;

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/register", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    const user = new User({
      email: req.body.email,
      password: hash
    });
    user.save(function (err) {
      if (err)
      {
        console.log(err);
      }
      else {
        res.render("secrets");
      }
    });
  });
});

app.post("/login", function (req, res) {
  User.findOne({ email: req.body.email }, function (err, foundDetails) {
    if (err)
    {
      console.log(err);
    }
    else
    {
      if (!foundDetails)
      {
        res.send("Invalid Username or Password. Please try again!");
      }
      else
      {
        bcrypt.compare(req.body.password, foundDetails.password, function (err, result) {
          if (result === true)
          {
            res.render("secrets");
          }
          else
          {
            res.send("Invalid Username or Password. Please try again!");
          }
        });  
      }
    }
  });
});

app.listen(3000, function () {
  console.log("Server is up and running on port 3000.");
});