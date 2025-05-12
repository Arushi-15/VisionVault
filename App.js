
const express = require("express");
const path = require("path");
const app = express();
// config/passport.js
const passport = require('passport');
const User = require('./models/user');
const session = require('express-session');
const mongoose = require('mongoose');
require('./config/passport');

const port = 8080;
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
    

app.set("views engine","ejs");
app.set("views",path.join(__dirname,"views"));

mongoose.connect('mongodb+srv://myAppUser:StrongPassword%40123@cluster0.hitaswv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

app.get('/', (req, res) => {
    res.send('Hello, Node.js!');
});
app.get("/home",(req,res)=>{
    res.render("index.ejs",{ user: req.user });
});
app.get("/login",(req,res)=>{
    res.render("Login.ejs");
});
app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
});

app.post('/signup', async (req, res) => {
    try {
      const { username, password , email } = req.body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send('Username already exists');
      }
  
      const newUser = new User({ username, password, email });
      await newUser.save();
      res.redirect('/login');
    } catch (error) {
      res.status(500).send('Error registering user');
    }
  });

app.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  });  
  
app.listen(port, () => {
    console.log(`App is listening on port ${8080}`);
});