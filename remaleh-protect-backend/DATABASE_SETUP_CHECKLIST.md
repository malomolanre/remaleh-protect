# Database Setup Checklist for Render PostgreSQL

## ✅ Environment Variables

Make sure these are set in your Render backend service:

- [ ] `DATABASE_URL` - Your Render PostgreSQL connection string
- [ ] `FLASK_ENV` - Set to `production` for Render
- [ ] `SECRET_KEY` - A secure secret key for JWT tokens
- [ ] `RENDER` - Set to `true` (Render sets this automatically)

## 🔗 DATABASE_URL Format

Your DATABASE_URL should look like:
```
postgresql://username:password@host:port/database_name
```

Example:
```
postgresql://remaleh_user:your_password@dpg-abc123-a.oregon-postgres.render.com/remaleh_protect
```

## 🚀 Testing Steps

1. **Test Database Connection:**
   ```bash
   cd remaleh-protect-backend
   python test_database_connection.py
   ```

2. **Check Backend Health:**
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```

3. **Verify Tables Exist:**
   The script will show you which tables are available in your database.

## 🐛 Common Issues

### Connection Refused
- Check if your Render PostgreSQL service is running
- Verify the DATABASE_URL is correct
- Check if your backend service can reach the database

### SSL Required
- Render PostgreSQL requires SSL
- Make sure `sslmode=require` is in your connection string
- The backend config handles this automatically

### Authentication Failed
- Verify username and password in DATABASE_URL
- Check if the user has proper permissions
- Ensure the database exists

## 📊 Expected Tables

After running the initialization, you should see:
- `users` - User accounts and authentication
- `learning_modules` - Learning content
- `learning_progress` - User progress tracking
- `community_reports` - Community threat reports
- `user_scans` - User scan history
- `threats` - Threat intelligence

## 🔧 Troubleshooting

1. **Check Render Logs:**
   - Go to your Render dashboard
   - Check the logs for your backend service
   - Look for database connection errors

2. **Verify Environment Variables:**
   - In Render dashboard, go to Environment
   - Ensure DATABASE_URL is set correctly
   - Check for any typos or missing values

3. **Test Locally:**
   - Copy your DATABASE_URL to a local .env file
   - Run the test script locally to verify connection

## 📱 Frontend Configuration

Make sure your frontend has the correct backend URL:

```bash
# In your frontend .env file
VITE_API_BASE=https://your-backend-service-name.onrender.com
```

## 🎯 Next Steps

Once database connection is working:

1. Start your backend service
2. Test the AdminDashboard in your frontend
3. Create your first admin user
4. Add learning modules
5. Test user management features

## 📞 Support

If you're still having issues:
1. Check the Render documentation for PostgreSQL
2. Verify your service plan supports external connections
3. Check if there are any IP restrictions
4. Ensure your backend service is in the same region as your database
