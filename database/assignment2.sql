-- 1 Insert the following new record to the account table
INSERT INTO account(account_firstname, account_lastname, account_email, account_password)
  VALUES('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 2 Modify the Tony Stark record to change the account_type to "Admin"
UPDATE account
SET account_type = 'Admin'
WHERE account_id = 1;

-- 3 Delete the Tony Stark record from the database.
DELETE FROM account
WHERE account_id = 1;

-- 4 