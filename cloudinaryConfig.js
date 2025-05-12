// cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'dookenuyd', // Replace with your cloud name
  api_key: '528969816536445', // Replace with your API key
  api_secret: 'lY5so__hbH0Mif1Xpsjfg-qe7Gg' // Replace with your API secret
});

module.exports = cloudinary;
