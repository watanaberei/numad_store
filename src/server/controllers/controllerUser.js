// controllers/UserProfile.js
const collection = require("../mongodb");

module.exports.signup_get = (req, res) => {
    console.log("signup get");
    res.render('SignupScreen');
};

module.exports.login_get = (req, res) => {
    console.log("login get");
    res.render('LoginScreen');
};

module.exports.signup_post = async (req, res) => {
    res.render('SignupScreen');
    console.log("signup post");
    const data = {
        email:req.body.email,
        password:req.body.password,
       //  firstName:req.body.firstName,
       //  lastName:req.body.lastName,
       //  birthdate:req.body.birthdate
    }
    await collection.insertMany([data]);  
    res.send('new signup');
};

module.exports.login_post = async (req, res) => {
    console.log("login post");
    const { email, password } = req.body;
    const user = await collection.findOne({ email, password });
    if (user) {
        console.log("User found");
        res.send('user login');
    } else {
        console.log("User not found");
        res.status(400).send('Invalid credentials');
    }
};























// const User = require('../models/User'); // Adjust the path as necessary

// const getUserProfile = async (req, res) => {
//     try {
//         const user = await User.findOne({ auth0Id: req.oidc.user.sub });
//         if (!user) {
//             return res.status(404).send('User not found');
//         }
//         res.json(user);
//     } catch (error) {
//         res.status(500).send('Server error');
//     }
// };

// const updateUserProfile = async (req, res) => {
//     // Implement logic to update user profile
// };

// module.exports = {
//     getUserProfile,
//     updateUserProfile
// };