# LMS Backend Deployment Guide

## 🚀 Quick Deployment Options

### 1. **Render (Recommended - Free)**

**Steps:**
1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

**Environment Variables to set in Render:**
```
NODE_ENV=production
MONGO_URI=mongodb+srv://ayushsingh186312:3avwBFwdkt8etyku@cluster0.ppeik28.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters
PORT=10000
```

**Your API will be available at:** `https://your-app-name.onrender.com`

### 2. **Railway**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### 3. **Heroku**

```bash
# Install Heroku CLI
heroku create your-lms-backend
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_jwt_secret"
git push heroku main
```

### 4. **Vercel (Serverless)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 📋 Pre-Deployment Checklist

- ✅ Package.json has start script
- ✅ Server listens on process.env.PORT
- ✅ CORS configured for production
- ✅ Error handling middleware exists
- ✅ Environment variables set
- ✅ MongoDB connection string ready
- ✅ JWT secret generated

## 🔧 Environment Variables

```bash
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_minimum_32_characters
PORT=10000
```

## 🧪 Testing Deployed API

After deployment, test your endpoints:

```bash
# Health check
curl https://your-app-name.onrender.com/health

# Root endpoint
curl https://your-app-name.onrender.com/

# Register admin
curl -X POST https://your-app-name.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"Admin123","role":"admin"}'
```

## 📊 Monitoring

- **Health Endpoint:** `GET /health`
- **Logs:** Check platform dashboard for logs
- **Database:** Monitor MongoDB Atlas

## 🛠️ Troubleshooting

**Common Issues:**

1. **Build Fails:** Check package.json dependencies
2. **App Won't Start:** Verify PORT configuration
3. **Database Connection:** Check MONGO_URI format
4. **CORS Issues:** Update origin domains in server.js

**Quick Fixes:**

```javascript
// Update CORS for your frontend domain
app.use(cors({
  origin: ['https://yourfrontend.com', 'https://www.yourfrontend.com'],
  credentials: true
}));
```

## 🎯 Next Steps

1. **Choose a deployment platform** (Render recommended)
2. **Set up GitHub repository**
3. **Configure environment variables**
4. **Deploy and test**
5. **Update frontend API URLs**

Your LMS backend is now ready for production! 🎉
