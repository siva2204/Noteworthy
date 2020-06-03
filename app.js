const express = require('express');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');
require('dotenv').config();

const app = express();
const port =  3000;

//static file
app.use(express.static(__dirname));

app.use(methodOverride('_method'));

//passport
require('./passport/passport')(passport);

//db
mongoose.connect(process.env.db,{ useNewUrlParser: true ,useUnifiedTopology: true,useCreateIndex: true })
.then(() => console.log("DB connected"))
.catch(err => console.log(err));

//ejs
app.set('view engine','ejs');

//bodyParser
app.use(express.urlencoded({ extended: false }));

//express - session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,

}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

// flash msg global variable
app.use((req,res,next)=>{
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//routes
app.use(require('./routes/index'));
app.use('/users', require('./routes/users'));


app.listen(port , () => {
  console.log(`server up and running ${port}`);
});
