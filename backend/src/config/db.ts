import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const dbFile = process.env.DATABASE_FILE || 'civic_issue.db';
const dbPath = path.isAbsolute(dbFile) ? dbFile : path.join(process.cwd(), dbFile);

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log(`Connected to the SQLite database at ${dbPath}`);
  }
});

// A helper to run SQL queries as Promises
export const query = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const run = (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const get = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Initialize database tables
export const initDatabase = async (): Promise<void> => {
  console.log('Initializing database tables...');

  // Create tables
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      address TEXT,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('CITIZEN', 'ADMIN')) NOT NULL,
      profile_picture TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      department_id INTEGER,
      priority TEXT CHECK(priority IN ('Low', 'Medium', 'High', 'Critical')) NOT NULL,
      status TEXT CHECK(status IN ('Pending', 'Approved', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected')) NOT NULL DEFAULT 'Pending',
      address TEXT NOT NULL,
      landmark TEXT,
      latitude REAL,
      longitude REAL,
      citizen_id INTEGER NOT NULL,
      contact_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id),
      FOREIGN KEY (department_id) REFERENCES departments (id),
      FOREIGN KEY (citizen_id) REFERENCES users (id)
    )
  `);

  try {
    const columns = await query("PRAGMA table_info(complaints)") as { name: string }[];
    const columnNames = columns.map(c => c.name);
    if (!columnNames.includes('state')) {
      await run("ALTER TABLE complaints ADD COLUMN state TEXT");
    }
    if (!columnNames.includes('district')) {
      await run("ALTER TABLE complaints ADD COLUMN district TEXT");
    }
    if (!columnNames.includes('taluk')) {
      await run("ALTER TABLE complaints ADD COLUMN taluk TEXT");
    }
    if (!columnNames.includes('revenue_division')) {
      await run("ALTER TABLE complaints ADD COLUMN revenue_division TEXT");
    }
    if (!columnNames.includes('firka')) {
      await run("ALTER TABLE complaints ADD COLUMN firka TEXT");
    }
    if (!columnNames.includes('village_panchayat')) {
      await run("ALTER TABLE complaints ADD COLUMN village_panchayat TEXT");
    }
    console.log('Complaints table administrative columns verified/migrated.');
  } catch (err) {
    console.error('Error migrating complaints table:', err);
  }

  await run(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER NOT NULL,
      file_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0 CHECK(is_read IN (0, 1)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER UNIQUE NOT NULL,
      citizen_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      admin_response TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
      FOREIGN KEY (citizen_id) REFERENCES users (id)
    )
  `);

  // Seed Categories if empty
  const categoryCount = await get('SELECT COUNT(*) as count FROM categories');
  if (categoryCount.count === 0) {
    const defaultCategories = [
      'Road Damage', 'Garbage', 'Water Leakage', 'Drainage',
      'Street Light', 'Traffic Signal', 'Illegal Dumping',
      'Public Property Damage', 'Others'
    ];
    for (const cat of defaultCategories) {
      await run('INSERT INTO categories (name) VALUES (?)', [cat]);
    }
    console.log('Categories seeded.');
  }

  // Seed Departments if empty
  const deptCount = await get('SELECT COUNT(*) as count FROM departments');
  if (deptCount.count === 0) {
    const defaultDepts = [
      'Public Works Department', 'Sanitation Department',
      'Water Supply Department', 'Municipal Drainage Department',
      'Electrical Department', 'Traffic Control Department',
      'Environmental Protection Department', 'General Administration'
    ];
    for (const dept of defaultDepts) {
      await run('INSERT INTO departments (name) VALUES (?)', [dept]);
    }
    console.log('Departments seeded.');
  }

  // Seed Users if empty
  const userCount = await get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const citizenPassword = await bcrypt.hash('citizen123', salt);

    await run(`
      INSERT INTO users (name, email, password, role, phone, address) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'System Administrator',
      'admin@civic.gov',
      adminPassword,
      'ADMIN',
      '+1234567890',
      'Municipal HQ, Block 1'
    ]);

    await run(`
      INSERT INTO users (name, email, password, role, phone, address) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'John Citizen',
      'citizen@test.com',
      citizenPassword,
      'CITIZEN',
      '+9876543210',
      '123 Civic Street, Ward 5'
    ]);

    console.log('Seed users created (admin@civic.gov / admin123, citizen@test.com / citizen123).');
  }

  console.log('Database initialization completed.');
};

export default db;
