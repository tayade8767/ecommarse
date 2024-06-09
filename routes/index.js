var express = require('express');
var router = express.Router();

const db = require('../config/mongooseconnection');

const ownerModel = require('./owner');
const productModel = require('./product');
const userModel = require('./users');

const path = require("path");
const cookiesParser = require('cookies-parser');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { generateToken } = require('../utils/generateToken');
require("dotenv").config();

const flash = require("connect-flash");
const expressSession = require("express-session");

const upload = require('../config/multer-config');

/* GET home page. */
router.get('/', function(req, res, next) {
  let error = req.flash('error');
  res.render('index', { error });
  });
//  to create the user model
router.get('/user', function(req, res, next) {
  res.send('user');
});

router.post('/users/register',async function(req, res, next) {
  
  let { fullname,email,password} = req.body;

  let user = await userModel.findOne({ email: email});

  console.log(user);
  console.log(fullname+" "+email+"  "+password);

  if(user) {
    return res.status(401).send("You Already Have an Account Please LogIn");
  } else {

  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt,async function (err, hash) {
        if (err) {
          return next(err);
        } else {
          try {
            let createduser =await userModel.create({
              fullname,
              email,
              password:hash
            });
              // let token = jwt.sign({email, id: userModel._id}, "akakakakak");
            let token = generateToken(createduser);
            res.cookie("token", token);
            // res.send(token);
            // res.status(201).send(createduser);
            res.redirect("/shop");
          } catch (err) {
            console.log(err.message);
          }

        }
      });
  });

  }
  

});



//   this route is for the User Is login or not

router.post('/users/login',async function(req, res, next) {
  let { email,password } = req.body;
  let user = await userModel.findOne({ email: email });

  if(!user) {
    return res.status(401).send("Incorrect Password Or Email");
  } else {
    bcrypt.compare(password,user.password, function(err, result) {
        if(err) {
          return res.status(401).send("Password is Incorrect");
        } else {
          let token = generateToken(user);
          res.cookie("token", token);
          res.redirect("/shop");
          // res.send("you can login");
        }
    });
  }
});

//  to login the owner account

router.get('/owner-login', function(req, res, next) {
  res.render('owner-login');
});

router.post('/owner-login', async (req, res, next) => {
  let { email,password } = req.body;
  let user = await ownerModel.findOne({ email: email });
  if(!user) {
    return res.status(401).send("Incorrect Password Or Email");
    } else {
      bcrypt.compare(password,user.password, function(err, result) {
      console.log(result);
      if (!result) {
        return res.status(401).send("Password is Incorrect");
      }
        if(err) {
          return res.status(401).send("Password is Incorrect");
        } else {
          // let token = generateToken(user);
          // res.cookie("token", token);
          res.redirect("/admin");
          // res.send("you can login");
        }
    });
  }
});
  
  // to register a owner account
  router.get('/owner-create', function(req, res, next) {
    res.render('owner-create');
    });
    
router.post('/owner-create',async function(req, res, next) {
  let { fullname,email,password } = req.body;
    let owner = await ownerModel.find();
    if(owner.length > 0) {
      res.send(503).send("you dont have permission to create new owner");
    } else {


      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt,async function (err, hash) {
            if (err) {
              return next(err);
            } else {
              try {
                let createdOwner = await ownerModel.create({
                  fullname,
                  email,
                  password:hash
                })
                res.redirect("/admin");
                  // let token = jwt.sign({email, id: userModel._id}, "akakakakak");
                let token = generateToken(createduser);
                res.cookie("token", token);
                // res.send(token);
                // res.status(201).send(createduser);
                res.redirect("/shop");
              } catch (err) {
                console.log(err.message);
              }
    
            }
          });
      });      
      // res.status(201).send(createdOwner);
    }
});



//  this is route is for to add the products to the cart
router.get("/createproducts",(req,res,next) => {
  let success = req.flash('success');
  res.render("createproducts",{ success });
  });
  
  
  router.post("/products/create", upload.single('image') ,async (req,res,next) => {
     try {
      let  {image, name, price, discount, bgcolor, panelcolor, textcolor,} = req.body;
      
      let product = await productModel.create({
        image:req.file.buffer,
        name,
        price,
        discount,
        bgcolor,
        panelcolor,
        textcolor,
      });
    
    req.flash("success","PRoduct Created Successfully");
    res.redirect("/admin");

    } catch (err ) {
        res.send(err);
      }
  });
  
  

  //  to show all the products in the shop route
  router.get("/shop",async (req,res,next) => {
    let products = await productModel.find();
    res.render("shop",{ products:products });
  });
  
  
router.get('/admin', function(req, res, next) {
  res.render('admin');
});


router.get('/cart', function(req, res, next) {
  res.render('cart');
});


//   isloggedin is required to check if user is logges in or not

async function isloggedin(req, res, next) {
  let token = req.cookies.token;
  if(!token){
    req.flash("error","You need to login first");
    res.redirect("/");
  } else {
    try {
      let decoded = jwt.verify(req.cookies.token,process.env.JWT_KEY);
      let user = await findOne({ email: decoded.email }).select("-password");
      req.user = user;
      next();
    } catch (err){
        req.flash("error","Something went wrong");
        res.redirect("/");
    }
  }
}




module.exports = router;
