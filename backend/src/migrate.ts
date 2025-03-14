import fs from "fs";
import path from "path";
import pool from "./config/db";

async function runMigrations() {
    console.log("🔄 Running migrations...");

    // Ensure migrations table exists
    await pool.query(`
        CREATE TABLE IF NOT EXISTS migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Get already executed migrations
    const [executedMigrations] = await pool.query("SELECT name FROM migrations");
    const executedFiles = (executedMigrations as any[]).map(row => row.name);

    // Get all SQL files from migrations folder
    const files = fs.readdirSync("./migrations").filter(file => file.endsWith(".sql"));

    for (const file of files) {
        if (!executedFiles.includes(file)) {
            console.log(`🚀 Applying migration: ${file}`);
            const sql = fs.readFileSync(path.join("./migrations", file), "utf8");
            await pool.query(sql);
            await pool.query("INSERT INTO migrations (name) VALUES (?)", [file]);
        }
    }

    console.log("✅ All migrations applied.");
    process.exit();
}

runMigrations().catch(err => console.error("❌ Migration error:", err));
