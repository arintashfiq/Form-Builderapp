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
### 7
. Section Navigation Issues

**Issue**: Custom section flow not working (e.g., Section 2 → Section 4 not skipping Section 3)
**Solutions**:
- **Save the form**: Section settings are only applied after clicking "Save Changes"
- **Check orange save button**: If button is orange, there are unsaved section changes
- **Verify section settings**: Click settings icon on section tab to check configuration
- **Console debugging**: Open browser dev tools to see navigation logs

**Issue**: Submit button not appearing/disappearing unexpectedly
**Solutions**:
- Check section's "Allow Submit" setting in section editor
- Verify you're on the last section of your allowed path
- Ensure required fields are filled

**Issue**: Next button disabled
**Solutions**:
- Fill all required fields in current section
- Check section's "Allow Next" setting
- Verify conditional dropdown fields have selections (if applicable)

### 8. Conditional Logic Problems

**Issue**: Dropdown conditional logic not triggering
**Solutions**:
- Ensure dropdown has options that match conditional rules exactly
- Check that target sections exist
- Save the form after editing conditional logic
- Verify conditional rules in field editor match dropdown options

**Issue**: Form gets stuck in conditional loop
**Solutions**:
- Check conditional rules don't create circular references
- Ensure all conditional paths lead to valid sections or form submission
- Use "end" target to submit form directly from conditional logic

### 9. Mobile Responsiveness Issues

**Issue**: Form not displaying correctly on mobile
**Solutions**:
- Clear browser cache and reload
- Check if using latest version (mobile improvements recently added)
- Test in different mobile browsers

**Issue**: Table fields not working on mobile
**Solutions**:
- Tables automatically switch to card layout on mobile
- Ensure JavaScript is enabled
- Try refreshing the page

### 10. Performance Issues

**Issue**: Form builder slow with many fields
**Solutions**:
- Organize fields into columns for better performance
- Use sections to break up large forms
- Consider splitting very large forms into multiple smaller forms

### 11. Data Loss Prevention

**Issue**: Lost work when browser crashes
**Solutions**:
- Save frequently using the "Save" button
- Watch for orange "Save Changes" button indicating unsaved work
- Use browser's back button carefully (may lose unsaved changes)

## Getting Help

If you encounter issues not covered here:

1. **Check Browser Console**: Open Developer Tools (F12) and look for error messages
2. **Check Backend Logs**: Look at the terminal running the backend for error messages
3. **Verify Setup**: Ensure all installation steps were completed correctly
4. **Database Check**: Use `./view-database.sh` to inspect database contents
5. **Clean Restart**: Stop all processes, clear caches, and restart

## System Requirements

- **Node.js**: 18.0.0 or higher
- **MySQL**: 8.0 or higher  
- **Browser**: Modern browser with JavaScript enabled
- **Memory**: At least 4GB RAM recommended
- **Storage**: 500MB free space for dependencies

## Debug Mode

For detailed debugging, check the browser console for:
- `🔄 handleNextSection called:` - Section navigation debugging
- `💾 SectionEditor saving updates:` - Section settings changes
- `🎯 Using configured next section:` - Custom flow confirmation
- `✅ Successfully navigating to section:` - Navigation success
