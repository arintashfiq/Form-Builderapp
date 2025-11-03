# Setup Instructions

## Quick Setup (Recommended)

Run these commands in order:

```bash
# 1. Install root dependencies
npm install

# 2. Install frontend dependencies
cd frontend && npm install && cd ..

# 3. Install backend dependencies
cd backend && npm install && cd ..

# 4. Setup MySQL database
mysql -u root -p
CREATE DATABASE form_builder;
exit

# 5. Configure backend environment
cd backend
cp .env.example .env
# Edit .env file - set DB_PASSWORD=your_mysql_password

# 6. Start the application
cd ..
npm run dev
```

## Manual Setup

If you prefer to set up each part individually:

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Database Configuration

Make sure MySQL is running and create the database:

```sql
CREATE DATABASE form_builder;
```

The application will automatically create the required tables on first run.

## Environment Variables

Edit `backend/.env` with your MySQL password:

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password_here
DB_NAME=form_builder
DB_PORT=3306
```

**Examples:**
- No password: `DB_PASSWORD=`
- With password: `DB_PASSWORD=mypassword123`

## Verification

After setup, you should be able to access:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/health

## Troubleshooting

**Port conflicts:** Change ports in the respective package.json files
**Database connection:** Verify MySQL is running and credentials are correct
**Dependencies:** Run `npm run install:all` from the root directory