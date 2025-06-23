// controllers/authController.js

const User = require("../server/mongodb");


// controllers/authController.js
module.exports.logout_get = (req, res) => {
    console.log("logout get");
    res.render('HomeScreen');
  };
  
module.exports.admin_get = (req, res) => {
    console.log("admin get");
    res.render('HomeScreen');
};

module.exports.signup_get = (req, res) => {
    console.log("signup get");
    res.render('SignupScreen');
};

module.exports.login_get = (req, res) => {
    console.log("login get");
    res.render('LoginScreen');
};

module.exports.signup_post = async (req, res) => {
    console.log("signup post");
    const { email, password } = req.body;
    const user = { email, password };
    await collection.insertOne(user);
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

// module.exports.signup_post = async (req, res) => {
//     res.render('SignupScreen');
//     console.log("signup post");
//     const data = {
//         email:req.body.email,
//         password:req.body.password,
//        //  firstName:req.body.firstName,
//        //  lastName:req.body.lastName,
//        //  birthdate:req.body.birthdate
//     }
//     await collection.insertMany([data]);  
//     res.send('new signup');
// };

// module.exports.login_post = async (req, res) => {
//     console.log("login post");
//     const { email, password } = req.body;
//     const user = await collection.findOne({ email, password });
//     if (user) {
//         console.log("User found");
//         res.send('user login');
//     } else {
//         console.log("User not found");
//         res.status(400).send('Invalid credentials');
//     }
// };