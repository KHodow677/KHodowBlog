const express = require("express");
const router = express.Router();
const post = require("../models/post");
const user = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

const authMiddleware = (req, res, next ) => {
  const token = req.cookies.token;
  if(!token) {
    res.redirect("/admin");
    return;
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } 
  catch(error) {
    res.redirect("/admin");
    return;
  }
}

// Routes
// Admin
router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "simple blog created with nodejs, express, & mongodb."
    }
    res.render("admin/index", { locals, layout: adminLayout });
  }
  catch (error) {
    console.log(error);
  }
});

// Admin Check Login
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const returningUser = await user.findOne({ username });
    if (!returningUser) {
      res.redirect("/admin");
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, returningUser.password);
    if (!isPasswordValid) {
      res.redirect("/admin");
      return;
    }
    const token = jwt.sign({ userID: returningUser._id }, jwtSecret );
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  }
  catch (error) {
    console.log(error);
  }
});

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }
    const data = await post.find();
    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout
    });
  } 
  catch (error) {
    console.log(error);
  }
});

// Admin Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const newUser = await user.create({ username, password:hashedPassword });
      res.status(201).json({ message: 'User Created', newUser });
    } 
    catch (error) {
      if(error.code === 11000) {
        res.status(409).json({ message: 'User already in use'});
      }
      res.status(500).json({ message: 'Internal server error'})
    }
  } 
  catch (error) {
    console.log(error);
  }
});

router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Add Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }
    const data = await post.find();
    res.render('admin/add-post', {
      locals,
      layout: adminLayout
    });
  } catch (error) {
    console.log(error);
  }
});

router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    try {
      const newPost = new post({
        title: req.body.title,
        body: req.body.body
      });
      await post.create(newPost);
      res.redirect('/dashboard');
    } 
    catch (error) {
      console.log(error);
    }
  } 
  catch (error) {
    console.log(error);
  }
});

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    const locals = {
      title: "Edit Post",
      description: "Free NodeJs User Management System",
    };
    const data = await post.findOne({ _id: req.params.id });
    res.render('admin/edit-post', {
      locals,
      data,
      layout: adminLayout
    })
  } 
  catch (error) {
    console.log(error);
  }
});

router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    await post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });
    res.redirect(`/edit-post/${req.params.id}`);
  } 
  catch (error) {
    console.log(error);
  }
});

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    await post.deleteOne( { _id: req.params.id } );
    res.redirect('/dashboard');
  } 
  catch (error) {
    console.log(error);
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});


module.exports = router;
