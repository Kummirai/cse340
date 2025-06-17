const { Pool } = require("pg");
require("dotenv").config();

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
      user_id INT REFERENCES users(user_id),
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

createReviewsTable().catch(console.error);
