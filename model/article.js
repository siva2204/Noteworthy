const mongoose = require('mongoose');
const marked = require('marked');
const slugify = require('slugify');
const createdompurify = require('dompurify');
const{ JSDOM } = require('jsdom');
const dompurify = createdompurify(new JSDOM().window);

const articleSchema = new mongoose.Schema({
  title: {
    type:String,
    required: true
  },
  description: {
    type:String,
    required: true
  },
  markdown: {
    type:String,
    required: true
  },
  author: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
  },
  createdAt:{
    type:Date,
    default: new Date()
  },
  slug:{
    type: String,
    required: true,
    unique: true
  },
  sanitizedHtml: {
    type: String,
    required: true
  }
});

articleSchema.pre('validate',function (next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower:true, strict: true});
  }
  if (this.markdown) {
    this.sanitizedHtml = dompurify.sanitize(marked(this.markdown));
  }
  next();
});

module.exports =mongoose.model('articles',articleSchema);
