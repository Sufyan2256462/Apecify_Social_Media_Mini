const Comment = require('../models/Comment');

exports.create = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'text required' });
  const comment = await Comment.create({ text, author: req.user.id, post: req.params.postId });
  res.json(await comment.populate('author', 'username name avatarUrl'));
};

exports.forPost = async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate('author', 'username name avatarUrl')
    .sort({ createdAt: 1 });
  res.json(comments);
};
