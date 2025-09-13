# ToDoTofu Vercel Deployment Guide

## Prerequisites
- Vercel account
- MongoDB Atlas database
- JWT secret key

## Environment Variables
Set these environment variables in your Vercel dashboard:

### Required Variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todofu?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure
NODE_ENV=production
```

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js framework

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Project Settings > Environment Variables
   - Add the required environment variables listed above

4. **Deploy**
   - Vercel will automatically build and deploy
   - The build process will:
     - Install dependencies in nextjs-todofu
     - Build the Next.js application
     - Deploy serverless functions for API routes

## API Configuration
✅ **No hardcoded localhost URLs** - The app automatically detects environment:
- **Development**: Uses `http://localhost:5001/api` (Express server)
- **Production**: Uses `/api` (Next.js API routes)

## Project Structure for Deployment
```
ToDoTofu/
├── nextjs-todofu/          # Next.js application (deployed to Vercel)
│   ├── src/app/api/        # API routes (serverless functions)
│   ├── src/components/     # React components  
│   └── .next/             # Build output
├── server/                 # Express server (NOT deployed, only for local dev)
└── vercel.json            # Vercel configuration
```

## What Gets Deployed
- ✅ Next.js frontend
- ✅ Next.js API routes (as serverless functions)
- ❌ Express server (not needed in production)

## Verification
After deployment, test these endpoints:
- `https://your-app.vercel.app/` - Frontend
- `https://your-app.vercel.app/api/health` - API health check
- `https://your-app.vercel.app/api/auth/login` - Authentication endpoint
