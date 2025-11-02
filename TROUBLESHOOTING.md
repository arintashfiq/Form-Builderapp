# Troubleshooting Guide

## Common Issues and Solutions

### 1. TypeScript Errors During Development

**Issue**: TypeScript errors about missing modules or types
**Solution**: These are expected before dependencies are installed. Run:
```bash
npm run install:all
```

### 2. Database Connection Errors

**Issue**: `Error: connect ECONNREFUSED 127.0.0.1:3306`
**Solutions**:
- Ensure MySQL is running: `brew services start mysql` (macOS) or `sudo service mysql start` (Linux)
- Check database credentials in `backend/.env`
- Verify database exists: `mysql -u root -p` then `SHOW DATABASES;`

### 3. Port Already in Use

**Issue**: `Error: listen EADDRINUSE: address already in use :::3000`
**Solutions**:
- Kill process using port: `lsof -ti:3000 | xargs kill -9`
- Change port in `frontend/vite.config.ts` or `backend/src/server.ts`

### 4. Module Not Found Errors

**Issue**: Cannot find module 'react' or similar
**Solution**: 
```bash
cd frontend && npm install
cd ../backend && npm install
```

### 5. File Upload Issues

**Issue**: File uploads failing
**Solutions**:
- Check `backend/uploads/` directory exists (created automatically)
- Verify file size is under 10MB
- Ensure file type is supported (pdf, doc, docx, jpg, png, gif, txt)

### 6. CORS Errors

**Issue**: Cross-origin request blocked
**Solution**: Backend already configured for CORS. If issues persist, check:
- Frontend is running on port 3000
- Backend is running on port 3001
- No proxy configuration conflicts

### 7. Database Tables Not Created

**Issue**: Table doesn't exist errors
**Solution**: Tables are created automatically on first backend start. If issues:
```bash
cd backend
npm run dev
# Check console for database initialization messages
```

### 8. Build Errors

**Issue**: Build fails with TypeScript errors
**Solution**:
```bash
# Clean install
rm -rf node_modules frontend/node_modules backend/node_modules
npm run install:all

# Check TypeScript configuration
cd frontend && npx tsc --noEmit
cd ../backend && npx tsc --noEmit
```

## Development Tips

### Hot Reload Not Working
- Restart development servers: `Ctrl+C` then `npm run dev`
- Clear browser cache
- Check file watchers aren't at limit: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf`

### Performance Issues
- Use `npm run dev:frontend` and `npm run dev:backend` separately for debugging
- Check MySQL query performance in console logs
- Monitor network tab for slow API calls

### Database Reset
```sql
DROP DATABASE form_builder;
CREATE DATABASE form_builder;
```
Then restart backend to recreate tables.

## Getting Help

1. Check console logs in both frontend and backend terminals
2. Verify all prerequisites are installed and running
3. Ensure all environment variables are set correctly
4. Test API endpoints directly: `curl http://localhost:3001/api/health`

## System Requirements

- **Node.js**: 18.0.0 or higher
- **MySQL**: 8.0 or higher  
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 1GB free space for dependencies and uploads