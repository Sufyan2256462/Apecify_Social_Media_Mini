const User = require('../models/User');

exports.getByUsername = async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() })
                         .select('-passwordHash')
                         .populate('followers following', 'username name avatarUrl');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

exports.follow = async (req, res) => {
  const targetId = req.params.id;
  if (targetId === req.user.id) return res.status(400).json({ message: 'Cannot follow yourself' });
  const me = await User.findById(req.user.id);
  const target = await User.findById(targetId);
  if (!target) return res.status(404).json({ message: 'User not found' });
  if (me.following.includes(targetId)) return res.status(400).json({ message: 'Already following' });
  me.following.push(targetId);
  target.followers.push(me._id);
  await me.save(); await target.save();
  res.json({ message: 'Followed', following: me.following.length });
};

exports.unfollow = async (req, res) => {
  const targetId = req.params.id;
  const me = await User.findById(req.user.id);
  const target = await User.findById(targetId);
  if (!target) return res.status(404).json({ message: 'User not found' });
  me.following = me.following.filter(id => id.toString() !== targetId);
  target.followers = target.followers.filter(id => id.toString() !== me._id.toString());
  await me.save(); await target.save();
  res.json({ message: 'Unfollowed', following: me.following.length });
};

exports.search = async (req, res) => {
  const q = req.query.q || '';
  const users = await User.find({ username: { $regex: q, $options: 'i' } })
                          .select('username name avatarUrl');
  res.json(users);
};
