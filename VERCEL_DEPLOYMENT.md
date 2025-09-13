# Vercel Deployment Instructions

## Quick Deployment (Recommended)

### Option 1: Deploy from subdirectory
1. Navigate to the Next.js app:
   ```bash
   cd nextjs-todofu
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. In the import settings:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `nextjs-todofu`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

3. **Environment Variables** (Required):
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure JWT secret key (generate with: `openssl rand -base64 32`)
   - `NODE_ENV`: `production`

## Environment Variables

Copy the environment variables from `.env.local.example` to your Vercel project:

```bash
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todofu?retryWrites=true&w=majority

# JWT Secret for authentication (use a long, secure random string)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure

# Node Environment
NODE_ENV=production
```

## Important Notes

1. **MongoDB Connection**: Ensure your MongoDB cluster allows connections from Vercel (0.0.0.0/0 or Vercel's IP ranges)

2. **CORS**: The app is configured to automatically use the correct origin in production via `process.env.VERCEL_URL`

3. **API Routes**: All API endpoints are automatically available at `https://your-domain.vercel.app/api/*`

4. **Build Verification**: The app builds successfully with all features:
   - ✅ Authentication (login/register/logout)
   - ✅ Task management (CRUD operations)
   - ✅ Categories and tags
   - ✅ Calendar and analytics
   - ✅ Dark/light theme
   - ✅ Wallet system with time tracking

## Troubleshooting

- If you get 404 errors, ensure the **Root Directory** is set to `nextjs-todofu` in Vercel dashboard
- For database connection issues, verify the `MONGODB_URI` and network access settings
- For authentication issues, ensure `JWT_SECRET` is set and secure

## Post-Deployment

After deployment, your ToDoTofu app will be available with all features working:
- **Frontend**: React with Next.js App Router
- **Backend**: Next.js API routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based auth system
- **Styling**: Tailwind CSS with shadcn/ui components
