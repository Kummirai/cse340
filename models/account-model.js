const pool = require("../database/");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
  } catch (error) {
    return error.message;
  }
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [account_email]
    );
    return result.rows[0] || null; // Return null if no account found
  } catch (error) {
    console.error("Error fetching account by email:", error);
    throw error; // Throw error to be caught by controller
  }
}

async function getAccountById(account_id) {
  const sql = "SELECT * FROM account WHERE account_id = $1";
  const data = await pool.query(sql, [account_id]);
  return data.rows[0];
}

async function updateAccountInfo(account_id, firstname, lastname, email) {
  const sql =
    "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
  return await pool.query(sql, [firstname, lastname, email, account_id]);
}

async function updatePassword(account_id, password) {
  const sql =
    "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";
  return await pool.query(sql, [password, account_id]);
}

module.exports = {
  registerAccount,
  getAccountByEmail,
  getAccountById,
  updateAccountInfo,
  updatePassword,
};
