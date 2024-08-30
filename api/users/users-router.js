const express = require('express');
const {
validateUserId,
validateUser,
validatePost,
} = require('../middleware/middleware')

const User = require('./users-model')
const Post = require('../posts/posts-model')
// You will need `users-model.js` and `posts-model.js` both
// The middleware functions also need to be required

const router = express.Router();

router.get('/', (req, res, next) => {
  User.get()
    .then(users => {
      res.json(users)
    })
    .catch(next)
  // RETURN AN ARRAY WITH ALL THE USERS
});

router.get('/:id', validateUserId, (req, res) => {
    res.json(req.user)
});
  // this needs a middleware to verify user id

router.post('/', validateUser, (req, res, next) => {
  User.insert({name: req.name})
    .then(newUser => {
      res.status(201).json(newUser)
    })
    .catch(next)
});

router.put('/:id', validateUserId, validateUser, (req, res, next) => {
  User.update(req.params.id, {name:req.name})
    .then(()=> {
      return User.getById(req.params.id)
    })
    .then(user => {
      res.json(user)
    })
    .catch(next)
});

router.delete('/:id', validateUserId, async (req, res, next) => {
  // RETURN THE FRESHLY DELETED USER OBJECT
  try {
    await User.remove(req.params.id)
    res.json(req.user)
  }
  catch(err) {
    next(err)
  }
  // this needs a middleware to verify user id
});

router.get('/:id/posts', validateUserId, async (req, res, next ) => {
  try {
   const result = await User.getUserPosts(req.params.id)
   res.json(result)
  }
  catch(err) {
    next(err)
  }
  // RETURN THE ARRAY OF USER POSTS
  // this needs a middleware to verify user id
});

router.post('/:id/posts', validateUserId,validatePost, async (req, res, next) => {
  try {
    const result = await Post.insert({
      user_id: req.params.id,
      text: req.text,
    })
    res.json(result)
  } catch(err) {
    next(err)
  } 
  })
  // RETURN THE NEWLY CREATED USER POST
  // this needs a middleware to verify user id
 // and another middleware to check that the request body is valid

router.use((err,res,req,next) => {
  res.status(err.status || 500).json({
    customMessage:'something terrible has happened inside users-router',
    message: err.message,
    stack: err.stack
  })
})

// do not forget to export the router
module.exports = router