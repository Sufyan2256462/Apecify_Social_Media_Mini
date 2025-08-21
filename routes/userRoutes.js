const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { getByUsername, follow, unfollow, search } = require('../controllers/userController');

// middleware to preload following IDs for feed performance (optional)
router.use('/feed', auth, async (req, res, next) => {
  const me = await User.findById(req.user.id);
  req.followingIds = me.following || [];
  next();
});

router.get('/search', search);
router.get('/:username', getByUsername);
router.post('/:id/follow', auth, follow);
router.post('/:id/unfollow', auth, unfollow);

module.exports = router;
