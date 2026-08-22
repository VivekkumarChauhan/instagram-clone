# 🚀 Lumigram Backend API

Production Express + Socket.IO + Cloudinary + MongoDB backend for the Lumigram mobile application.

---

## 🌟 Features
- **JWT Auth & Session Management**: Secure tokens, bcrypt password hashing, and real 6-digit email OTP verification via Nodemailer / Gmail SMTP.
- **Cloudinary Media Storage**: Signed video uploads and direct stream uploading for vertical reels.
- **Real-Time Direct Chat**: Socket.IO powered messaging with typing indicators, presence, and delivery receipts.
- **Render Ready**: Includes `render.yaml` for 1-click cloud deployment.

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` and set your credentials:

```env
PORT=5000
NODE_ENV=production

# MongoDB Atlas URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/instagram_clone

# JWT Security
JWT_SECRET=your_jwt_secret_key

# Cloudinary Media
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gmail SMTP for Real Email OTPs
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
```

---

## ☁️ Deploying to Render

1. Create a new **Web Service** on [Render Dashboard](https://dashboard.render.com).
2. Connect this repository (`instagram-clone-backend`).
3. Settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
4. Add the environment variables from `.env`.
5. Deploy!
