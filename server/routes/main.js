const express = require("express");
const router = express.Router();
const { marked } = require("marked");
const post = require("../models/post");

// Routes
// Home
router.get("", async (req, res) => {
  try {
    const locals = {
      title: "NodeJs Blog",
      description: "Simple Blog created with NodeJS, Express, & MongoDB"
    }
    let perPage = 5;
    let page = req.query.page || 1;
    const data = await post.aggregate([ { $sort: { createdAt: -1 } } ]).skip(perPage * page - perPage).limit(perPage).exec();
    const count = await post.countDocuments({});
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);
    res.render("index", { 
      locals, 
      data, 
      current: page, 
      nextPage: hasNextPage ? nextPage : null, 
      currentRoute: "/" 
    });
  }
  catch(error){
    console.log(error);
  }
});

// Post: ID
router.get("/post/:id", async (req, res) => {
  try {
    let slug = req.params.id;
    const data = await post.findById({ _id: slug });
    const locals = {
      title: data.title,
      description: "Simple Blog created with NodeJS, Express, & MongoDB"
    }
    data.body = marked(data.body);
    res.render("post", { 
      locals, 
      data, 
      currentRoute: `/post/${slug}`});
  }
  catch (error) {
    console.log(error);
  }
});

// Post: Search Term
router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "Search",
      description: "Simple Blog created with NodeJS, Express, & MongoDB"
    }
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
    const data = await post.find({ 
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") }},
        { body: { $regex: new RegExp(searchNoSpecialChar, "i") }}
      ]
    });
    res.render("search", { 
      data, 
      locals,
      currentRoute: "/"
    });
  }
  catch(error){
    console.log(error);
  }
});

// Contact
router.get("/blog", async (req, res) => {
  try {
    const locals = {
      title: "KHodow Blog",
      description: "Simple Blog created with NodeJS, Express, & MongoDB"
    }
    let page = req.query.page || 1;
    const data = await post.aggregate([ { $sort: { createdAt: -1 } } ]).exec();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = false;
    res.render("blog", { 
      locals, 
      data, 
      current: page, 
      nextPage: hasNextPage ? nextPage : null, 
      currentRoute: "/blog" 
    });
  }
  catch(error){
    console.log(error);
  }
});

// About
router.get("/about", (req, res) => {
  res.render("about", { currentRoute: "/about" });
});

module.exports = router;
