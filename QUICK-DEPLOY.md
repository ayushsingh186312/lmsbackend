# 🚀 Quick Deployment Guide

## Your LMS Backend is Ready for Deployment! ✅

All checks passed - your application is production-ready.

## 📋 Step-by-Step Deployment (Render - Recommended)

### 1. **Push to GitHub (if not already done)**

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial LMS Backend deployment"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/lms-backend.git

# Push to GitHub
git push -u origin main
```

### 2. **Deploy on Render**

1. Go to **[render.com](https://render.com)**
2. Click **"New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure settings:**
   - **Name:** `lms-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### 3. **Set Environment Variables in Render**

In the Render dashboard, add these environment variables:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://ayushsingh186312:3avwBFwdkt8etyku@cluster0.ppeik28.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=lms_super_secure_jwt_secret_2024_production_key_32_chars
PORT=10000
```

### 4. **Deploy!**

Click **"Create Web Service"** and wait for deployment.

Your API will be available at: **`https://your-app-name.onrender.com`**

---

## 🧪 Test Your Deployed API

### Health Check
```bash
curl https://your-app-name.onrender.com/health
```

### Register Admin User
```bash
curl -X POST https://your-app-name.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@lms.com",
    "password": "Admin123",
    "role": "admin"
  }'
```

### Create Course (Admin)
```bash
curl -X POST https://your-app-name.onrender.com/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "JavaScript Fundamentals",
    "description": "Learn JavaScript basics",
    "instructorName": "John Smith",
    "price": 99.99
  }'
```

---

## 🔄 Alternative Deployment Options

### Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Heroku
```bash
heroku create lms-backend
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_jwt_secret"
git push heroku main
```

---

## 📊 Your API Endpoints

**Base URL:** `https://your-app-name.onrender.com/api`

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Courses (Admin)
- `POST /courses` - Create course
- `GET /courses` - Get all courses
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

### Student Features
- `POST /enrollments` - Enroll in course
- `GET /enrollments` - My enrollments
- `POST /enrollments/:id/lessons/:lessonId/complete` - Mark lesson complete
- `POST /enrollments/:id/quizzes/:quizId/attempt` - Submit quiz

### Progress Tracking
- `GET /progress/course/:courseId` - Course progress
- `GET /progress/quiz-attempts/:quizId` - Quiz attempts
- `GET /progress/overview` - Overall progress

---

## 🎉 You're Done!

Your LMS backend is now deployed and ready to use. Update your frontend to use the new API URL.

**Next Steps:**
1. Test all endpoints
2. Update frontend API configuration
3. Set up monitoring and logging
4. Configure custom domain (optional)

🌟 **Happy Learning Management!** 🌟
