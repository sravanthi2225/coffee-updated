import fs from 'fs';
import path from 'path';
import db from './connection';

export function runMigrations(): void {
  try {
    console.log('[Migration] Running DDL schema migration...');
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schemaSql);
    console.log('[Migration] Schema created successfully (28 tables active).');

    // Ensure user schema has role and password fields
    const userCols = db.prepare('PRAGMA table_info(users)').all() as any[];
    const colNames = userCols.map(c => c.name);
    if (!colNames.includes('role')) {
      db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'CUSTOMER'");
      console.log('[Migration] Added column role to users');
    }
    if (!colNames.includes('password_hash')) {
      db.exec("ALTER TABLE users ADD COLUMN password_hash TEXT");
      console.log('[Migration] Added column password_hash to users');
    }
    if (!colNames.includes('reset_token')) {
      db.exec("ALTER TABLE users ADD COLUMN reset_token TEXT");
      console.log('[Migration] Added column reset_token to users');
    }
    if (!colNames.includes('reset_token_expires')) {
      db.exec("ALTER TABLE users ADD COLUMN reset_token_expires DATETIME");
      console.log('[Migration] Added column reset_token_expires to users');
    }

    // Synchronize latest seed data (idempotent INSERT OR REPLACE)
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log('[Migration] Synchronizing seed catalog and pricing data...');
      const seedSql = fs.readFileSync(seedPath, 'utf-8');
      db.pragma('foreign_keys = OFF');
      db.exec(seedSql);
      db.pragma('foreign_keys = ON');
      console.log('[Migration] Seed data synchronized successfully.');
    }
  } catch (error) {
    console.error('[Migration] Failed to run migrations:', error);
    throw error;
  }
}

// Allow direct execution: npx tsx src/db/migrate.ts
if (require.main === module) {
  runMigrations();
  process.exit(0);
}
