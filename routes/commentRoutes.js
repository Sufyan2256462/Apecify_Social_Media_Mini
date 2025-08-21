const router = require('express').Router();
const auth = require('../middleware/auth');
const { create, forPost } = require('../controllers/commentController');

router.post('/:postId', auth, create);
router.get('/:postId', forPost);

module.exports = router;
