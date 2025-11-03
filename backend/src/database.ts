import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'form_builder',
  port: parseInt(process.env.DB_PORT || '3306')
};

export const pool = mysql.createPool(dbConfig);

export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create forms table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS forms (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        fields JSON NOT NULL,
        columns JSON NOT NULL,
        sections JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Add sections column to existing tables (migration)
    try {
      await connection.execute(`
        ALTER TABLE forms ADD COLUMN sections JSON
      `);
      console.log('Added sections column to forms table');
    } catch (error: any) {
      // Column might already exist, ignore the error
      if (!error.message.includes('Duplicate column')) {
        console.log('Sections column already exists or other error:', error.message);
      }
    }
    
    // Create form_submissions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS form_submissions (
        id VARCHAR(36) PRIMARY KEY,
        form_id VARCHAR(36) NOT NULL,
        data JSON NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
      )
    `);
    
    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}