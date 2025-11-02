# 🚀 Deployment Guide

## Quick Deployment

### **Local Development**
```bash
# 1. Clone the repository
git clone https://github.com/arintashfiq/Form-Builderapp.git
cd Form-Builderapp

# 2. Install dependencies
chmod +x install.sh && ./install.sh

# 3. Set up MySQL database
mysql -u root -e "CREATE DATABASE form_builder;"

# 4. Configure environment
cd backend && cp .env.example .env
# Edit .env with your MySQL credentials

# 5. Start the application
npm run dev
```

### **Production Deployment**

#### **Prerequisites**
- Node.js 18+
- MySQL 8.0+
- PM2 (for process management)

#### **Steps**
```bash
# 1. Clone and install
git clone https://github.com/arintashfiq/Form-Builderapp.git
cd Form-Builderapp
npm run install:all

# 2. Build applications
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..

# 3. Set up production environment
cd backend
cp .env.example .env.production
# Configure production database settings

# 4. Start with PM2
pm2 start backend/dist/server.js --name "form-builder-api"
pm2 serve frontend/dist 3000 --name "form-builder-frontend"
pm2 save
```

### **Environment Variables**

Create `backend/.env` with:
```env
PORT=3001
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=form_builder
DB_PORT=3306
NODE_ENV=production
```

### **Database Setup**
```sql
CREATE DATABASE form_builder;
-- Tables will be created automatically on first run
```

### **Nginx Configuration** (Optional)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # File uploads
    location /uploads {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### **Docker Deployment** (Optional)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: form_builder
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: rootpassword
      DB_NAME: form_builder
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### **Health Checks**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/health
- Database: `mysql -u root -p -e "USE form_builder; SHOW TABLES;"`

### **Monitoring**
```bash
# Check PM2 processes
pm2 status

# View logs
pm2 logs form-builder-api
pm2 logs form-builder-frontend

# Restart services
pm2 restart all
```