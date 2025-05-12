
const express = require("express");
const path = require("path");
const app = express();
// config/passport.js
const passport = require('passport');
const User = require('./models/user');
const session = require('express-session');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('./cloudinaryConfig');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
require('./config/passport');

const port = 8080;

app.set("views engine","ejs");
app.set("views",path.join(__dirname,"views"));

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
    
mongoose.connect('mongodb+srv://myAppUser:StrongPassword%40123@cluster0.hitaswv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).send('You must be logged in to upload files.');
  }
  

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
    failureFlash: false
}));

app.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/home');
    });
});  

app.get('/upload', isAuthenticated, (req, res) => {
    res.render('Upload.ejs', { user: req.user });
});

app.post('/upload', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
  
      // Upload file to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'raw' },  // Automatically detects file type (image/video)
          (error, result) => {
            if (error) {
              console.log('Cloudinary upload error:', error);
              return reject(error);
            }
            resolve(result);
          }
        ).end(req.file.buffer);  // Pipe the file buffer to Cloudinary
      });
  
      // Store file details in MongoDB
      const uploadedFileDetails = {
        url: result.secure_url,
        public_id: result.public_id,
        filename: req.file.originalname
      };
  
      const user = req.user;  // Assuming the user is authenticated
      await User.findByIdAndUpdate(user._id, {
        $push: { uploadedFiles: uploadedFileDetails }
      });
  
      // Send success response and render the success page
      res.render('Upload_submit.ejs', {
        projectTitle: req.body.title,
        fileUrl: result.secure_url,
        user: req.user,
        fileName: req.file.originalname
      });
  
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).send('Error uploading file.');
    }
  });
  
  
  
app.listen(port, () => {
    console.log(`App is listening on port ${8080}`);
});