const { Pool } = require("pg");
require("dotenv").config();
const bcrypt = require("bcrypt");
// import db from "./database/index.js";

/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * *************** */
let pool;
if (process.env.NODE_ENV == "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params);
        console.log("executed query", { text });
        return res;
      } catch (error) {
        console.error("error in query", { text });
        throw error;
      }
    },
  };
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  module.exports = pool;
}

/* ***************
 * Create Reviews Table
 * *************** */
const createReviewsTable = async () => {
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS reviews (
  review_id SERIAL PRIMARY KEY,
  inv_id INT REFERENCES inventory(inv_id),
  account_id INT REFERENCES account(account_id),
  content TEXT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `;

  try {
    await pool.query(createTableQuery);
    console.log("Reviews table created successfully or already exists");
  } catch (error) {
    console.error("Error creating reviews table:", error);
    throw error;
  }
};

const seedUsers = async () => {
  const passwordHash = await bcrypt.hash("12345678", 10);

  // Check if users already exist
  const existingUsers = await pool.query(
    `SELECT account_email FROM account WHERE account_email IN ('basic@340.edu', 'happy@340.edu', 'manager@340.edu')`
  );

  const existingEmails = existingUsers.rows.map((row) => row.email);
  const usersToInsert = [];

  if (!existingEmails.includes("basic@340.edu")) {
    usersToInsert.push(`('Basic', 'User', 'basic@340.edu', $1, 'Client')`);
  }
  if (!existingEmails.includes("happy@340.edu")) {
    usersToInsert.push(
      `('Happy', 'Employee', 'happy@340.edu', $1, 'Employee')`
    );
  }
  if (!existingEmails.includes("manager@340.edu")) {
    usersToInsert.push(`('Manager', 'Admin', 'manager@340.edu', $1, 'Admin')`);
  }

  if (usersToInsert.length > 0) {
    await pool.query(
      `INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
       VALUES ${usersToInsert.join(", ")}`,
      [passwordHash]
    );
    console.log(`Seeded ${usersToInsert.length} users.`);
  } else {
    console.log("All users already exist - no seeding needed.");
  }
};

seedUsers();

createReviewsTable().catch(console.error);
