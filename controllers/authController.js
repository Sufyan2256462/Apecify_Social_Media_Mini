const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { username, password, name } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username and password required' });
    const exists = await User.findOne({ username: username.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Username already taken' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username: username.toLowerCase(), passwordHash, name: name || username });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  res.json(user);
};
