const Post = require('../models/Post');

exports.create = async (req, res) => {
  const { text, imageUrl } = req.body;
  if (!text) return res.status(400).json({ message: 'text required' });
  const post = await Post.create({ author: req.user.id, text, imageUrl: imageUrl || '' });
  res.json(await post.populate('author', 'username name avatarUrl'));
};

exports.feed = async (req, res) => {
  const myId = req.user.id;
  const following = req.followingIds || [];
  const ids = [myId, ...following];
  const posts = await Post.find({ author: { $in: ids } })
    .populate('author', 'username name avatarUrl')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(posts);
};

exports.byUser = async (req, res) => {
  const userId = req.params.userId;
  const posts = await Post.find({ author: userId })
    .populate('author', 'username name avatarUrl')
    .sort({ createdAt: -1 });
  res.json(posts);
};

exports.getOne = async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'username name avatarUrl');
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
};

exports.toggleLike = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const uid = req.user.id;
  const idx = post.likes.findIndex(id => id.toString() === uid);
  if (idx >= 0) post.likes.splice(idx, 1);
  else post.likes.push(uid);
  await post.save();
  res.json({ likes: post.likes.length, liked: idx < 0 });
};

// New functions for editing and deleting posts
exports.edit = async (req, res) => {
  const { text, imageUrl } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.author.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
  
  post.text = text || post.text;
  post.imageUrl = imageUrl || post.imageUrl;
  await post.save();
  res.json(await post.populate('author', 'username name avatarUrl'));
};

exports.deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.author.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
  
  await Post.findByIdAndDelete(req.params.id);
  res.status(204).send(); // No content
};
