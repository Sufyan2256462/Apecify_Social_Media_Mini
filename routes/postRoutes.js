const router = require('express').Router();
const auth = require('../middleware/auth');
const { create, feed, byUser, getOne, toggleLike, edit, deletePost } = require('../controllers/postController');
const User = require('../models/User');

// Feed middleware to attach following list
router.use('/feed', auth, async (req, res, next) => {
  const me = await User.findById(req.user.id);
  req.followingIds = me.following || [];
  next();
});

router.post('/', auth, create);
router.get('/feed', auth, feed);
router.get('/user/:userId', byUser);
router.get('/:id', getOne);
router.post('/:id/like', auth, toggleLike);

// New routes for editing and deleting posts
router.put('/:id', auth, edit); // Route for editing a post
router.delete('/:id', auth, deletePost); // Route for deleting a post

module.exports = router;
