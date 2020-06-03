const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../passport/auth');
const Article = require('../model/article');
const User = require('../model/User');

function ensurenotAuthenticated(req,res,next) {
  if (req.isAuthenticated()) {
    return res.redirect('/home');
  }
  next();
}

router.get('/home/profile',ensureAuthenticated,async(req,res)=>{
  let articles = await Article.find({author:req.user.id},function (err,articles) {
    //console.log(articles);
  });
  res.render('profile',{user:req.user,articles:articles});

});



router.get('/' ,ensurenotAuthenticated,(req,res) =>{
  res.render("front");
});

router.get('/home',ensureAuthenticated,async (req,res)=>{
  const articles = await Article.find().sort({ createdAt : "desc"});
  res.render('home', {name:req.user.name,articles:articles});
});

router.get('/articles/new',ensureAuthenticated ,(req,res)=>{
  res.render('newarticle',{article: new Article()});
});

router.get('/articles/:slug',async (req,res)=>{
   const article = await Article.findOne({ slug:req.params.slug});
   if (article==null) {
     res.redirect('/home');
   }
   res.render('showarticle',{ article: article});
});

router.get('/articles/edit/:id',async (req,res)=>{
  const article = await Article.findById(req.params.id);
  res.render('editarticle',{article: article});
});

router.post('/articles',ensureAuthenticated , async (req,res)=>{
  let article = new Article({
    title: req.body.title,
    description: req.body.description,
    markdown: req.body.markdown,
    author: req.user._id
  });
  try {
    article = await article.save();
    res.redirect(`/articles/${article.slug}`);
  } catch (e) {
      console.log(e);
      res.render('newarticle',{article: article});
  }

});

router.delete('/articles/:id',async (req,res)=>{
  let articles = await Article.findByIdAndDelete(req.params.id);


  res.redirect('/home');
});

router.put('/articles/:id', async(req,res)=>{
    let article = await Article.findById(req.params.id);
    article.title = req.body.title;
    article.description = req.body.description;
    article.markdown = req.body.markdown;

    try {
      article = await article.save();
      res.redirect(`/articles/${article.slug}`);
    } catch (e) {
      console.log(e);
      res.render('editarticle',{article: article});
    }
});

router.post('/username', async (req,res)=>{

  let user = await  User.findOne({name:req.body.search});
  let articles = await Article.find({author:user.id});
  try {
   if (user == null || undefined) {
     res.redirect('/home');
   }
    res.render('showprofile',{user:user,articles:articles})

  } catch (e) {
    console.log(e);
    res.redirect('home');
  }


});


module.exports = router;
