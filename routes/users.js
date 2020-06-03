// users registration and login routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const ensureAuthenticated= require('../passport/auth');

function ensurenotAuthenticated(req,res,next) {
  if (req.isAuthenticated()) {

    return res.redirect('/home');
  }
  next();
}

//User model
const User = require('../model/User');

router.get('/login',ensurenotAuthenticated ,(req,res) =>{
  res.render("login");

});

router.get('/register',ensurenotAuthenticated ,(req,res) =>{
  res.render("register");
});

router.post('/register',ensurenotAuthenticated , (req,res) => {
  const{ name,email,password,password2 } = req.body;
  let errors=[];
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'Password should be atleast 6 characters' });
  }

  if (errors.length >0) {
     res.render('register' ,{errors,name,email})
  }else {
    //pass
    User.findOne({email: email})
    .then(user => {
      if (user) {
        errors.push({ msg: 'Email is already registered'});
        res.render('register',{errors})
      }else {
        const users = new User({name,email,password});
        //hash password
        bcrypt.genSalt(10,(err,salt) => bcrypt.hash(users.password,salt, (err,hash) =>{
          if (err) {
            throw err
          }
          users.password = hash;
          //save user
          users.save().then(() => {req.flash('success_msg','You are now registered and can login'); res.redirect("/users/login"); }).catch(err => console.log(err));
        }));
      }
    })

  }

});

router.post('/login',ensurenotAuthenticated, passport.authenticate('local',{
  successRedirect: '/home',
  failureRedirect: '/users/login',
  failureFlash: true

}));


router.get('/update',ensureAuthenticated,(req,res)=>{
  res.render("updateuser");
});

router.put('/updating',ensureAuthenticated,async(req,res)=>{
  const{ name,password,password2 } = req.body;
  let errors=[];
  if (!name ||  !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'Password should be atleast 6 characters' });
  }

  if (errors.length >0) {
     res.render('updateuser',{errors});
  }else {
    try {
      let users = await User.findById(req.user.id);
      users.name = req.body.name;
      //users.email = req.user.email;
      users.password = await bcrypt.hash(req.body.password,10);
      await users.save();
      res.redirect('/home');
      req.flash('success_msg','You are now registered and can login');

    } catch (e) {
      console.log(e);
      res.render("updateuser");
      req.flash('error_msg','profile Updated please login now');


    }



  }
});

//logout handle
router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success_msg',"You are logged out");
  res.redirect('/users/login');
});

module.exports = router;
