# 🚀 Mini Social Media Platform

A beautiful, animated landing + fully working mini social network built with Express.js, MongoDB, and vanilla JavaScript.

![Social Mini Preview](https://via.placeholder.com/800x400?text=Social+Mini+Preview)

## ✨ Features

- **User Authentication** - Secure registration and login with JWT
- **User Profiles** - Customizable profiles with avatars and bio
- **Posts** - Create, read, update, and delete posts
- **Comments** - Add comments to posts
- **Likes** - Like/unlike posts
- **Follow System** - Follow/unfollow other users
- **Responsive Design** - Works on all devices
- **Modern UI** - Animated gradients and hover effects

## 🛠️ Tech Stack

**Frontend:**
- HTML5
- CSS3 (with animations)
- Vanilla JavaScript (ES6+)

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose ODM)
- JWT Authentication
- bcryptjs for password hashing

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/social-mini.git
cd social-mini
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Configure your .env file**
```env
MONGODB_URI=mongodb://localhost:27017/social-mini
JWT_SECRET=your-super-secret-jwt-key
PORT=4000
```

5. **Start MongoDB**
- Local: Make sure MongoDB is running
- Atlas: Update MONGODB_URI with your connection string

6. **Run the development server**
```bash
npm run dev
```

7. **Open your browser**
```
http://localhost:4000
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:username` | Get user profile |
| GET | `/api/users/search` | Search users |
| POST | `/api/users/:id/follow` | Follow user |
| POST | `/api/users/:id/unfollow` | Unfollow user |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts/feed` | Get feed posts |
| GET | `/api/posts/:id` | Get single post |
| POST | `/api/posts` | Create new post |
| DELETE | `/api/posts/:id` | Delete post |
| POST | `/api/posts/:id/like` | Like/unlike post |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/:postId` | Get post comments |
| POST | `/api/comments/:postId` | Add comment |

## 🎯 Usage Examples

### Register a new user
```javascript
// POST /api/auth/register
{
  "username": "johndoe",
  "password": "securepassword123",
  "name": "John Doe"
}
```

### Create a new post
```javascript
// POST /api/posts (with auth token)
{
  "text": "Hello, world! This is my first post 🎉"
}
```

## 🏗️ Project Structure

```
social-mini/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── commentController.js
│   ├── postController.js
│   └── userController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Comment.js
│   ├── Post.js
│   └── User.js
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── routes/
│   ├── authRoutes.js
│   ├── commentRoutes.js
│   ├── postRoutes.js
│   └── userRoutes.js
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with love for the developer community
- Inspired by modern social media platforms
- Special thanks to the open-source community

---

**Happy coding!** 🎉
