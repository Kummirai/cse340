const pool = require("../database/");
const bcrypt = require("bcrypt");

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
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error("Registration failed");
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
    return result.rows[0] || null;
  } catch (error) {
    console.error("Get account by email error:", error);
    throw new Error("Database error");
  }
}

/* *****************************
 * Return account data using account ID
 * ***************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1",
      [account_id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Get account by ID error:", error);
    throw new Error("Database error");
  }
}

/* *****************************
 * Update account details
 * ***************************** */
async function updateAccount(
  account_id,
  account_firstname,
  account_lastname,
  account_email
) {
  try {
    const sql =
      "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Update account error:", error);
    throw new Error("Account update failed");
  }
}

/* *****************************
 * Update account password
 * ***************************** */
async function updatePassword(account_id, account_password) {
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const sql =
      "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";
    const result = await pool.query(sql, [hashedPassword, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Update password error:", error);
    throw new Error("Password update failed");
  }
}

/* *****************************
 * Get all accounts (for admin)
 * ***************************** */
async function getAllAccounts() {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account ORDER BY account_lastname"
    );
    return result.rows;
  } catch (error) {
    console.error("Get all accounts error:", error);
    throw new Error("Failed to retrieve accounts");
  }
}

/* *****************************
 * Update account type (for admin)
 * ***************************** */
async function updateAccountType(account_id, account_type) {
  try {
    const sql =
      "UPDATE account SET account_type = $1 WHERE account_id = $2 RETURNING *";
    const result = await pool.query(sql, [account_type, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Update account type error:", error);
    throw new Error("Account type update failed");
  }
}

module.exports = {
  registerAccount,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword,
  getAllAccounts,
  updateAccountType,
};
