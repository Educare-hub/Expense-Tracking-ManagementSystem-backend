
-- EXPENSE TRACKER DATABASE SETUP (CLEAN VERSION)


CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'User',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

ALTER TABLE Users 
ADD code_expires_at DATETIME2 NULL;

ALTER TABLE users 
ADD is_suspended BIT DEFAULT 0;

-- Optional: Clean old bad data
UPDATE Users SET verification_code = NULL, code_expires_at = NULL WHERE verified = 1;

ALTER TABLE Users 
ADD verification_code VARCHAR(6) NULL,
    code_expires_at DATETIME2 NULL,
    verified BIT DEFAULT 0,
    code_expires_at DATETIME2 NULL;

----REGISTRATION TABLE (NEW)
--CREATE TABLE Registration (
--    reg_id INT IDENTITY(1,1) PRIMARY KEY,
--    user_id INT NOT NULL,
--    username VARCHAR(100) NOT NULL,
--    email VARCHAR(255) NOT NULL,
--    registered_at DATETIME2 DEFAULT SYSDATETIME(),
--    FOREIGN KEY (user_id) REFERENCES Users(id)
--        ON DELETE CASCADE
--);
--GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'code_expires_at')
BEGIN
    ALTER TABLE Users ADD code_expires_at DATETIME2 NULL;
END

-- THIS WILL WORK 100% — NO ERROR EVEN IF COLUMNS EXIST
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'verification_code')
    ALTER TABLE Users ADD verification_code VARCHAR(6) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'code_expires_at')
    ALTER TABLE Users ADD code_expires_at DATETIME2 NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'verified')
    ALTER TABLE Users ADD verified BIT DEFAULT 0;


    -- THIS WILL ADD THE COLUMN NO MATTER WHAT
BEGIN TRY
    ALTER TABLE Users ADD code_expires_at DATETIME2 NULL;
    PRINT 'Column added successfully';
END TRY
BEGIN CATCH
    PRINT 'Column already exists or error: ' + ERROR_MESSAGE();
END CATCH

BEGIN TRY
    ALTER TABLE Users ADD verification_code VARCHAR(6) NULL;
END TRY
BEGIN CATCH END CATCH

BEGIN TRY
    ALTER TABLE Users ADD verified BIT DEFAULT 0;
END TRY
BEGIN CATCH END CATCH


CREATE TABLE Categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);



CREATE TABLE Expenses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NULL,
    amount DECIMAL(18,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'KES',
    note NVARCHAR(1000) NULL,
    is_recurring BIT DEFAULT 0,
    recurring_interval VARCHAR(50) NULL,
    expense_date DATE NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id)
        ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(id)
);


ALTER TABLE expenses ADD receipt_url VARCHAR(500) NULL;

INSERT INTO Users (username, email, password_hash, role)
VALUES
('Admin User', 'admin@example.com', 'hashed_password_here', 'Admin'),
('John Doe', 'john@example.com', 'hashed_password_here', 'User');



ALTER TABLE Users
ADD verification_code VARCHAR(6),
    verified BIT DEFAULT 0;
--INSERT INTO Registration (user_id, username, email)
--SELECT id, username, email FROM Users;
--GO

INSERT INTO Categories (name, user_id)
VALUES
('Food', 1),
('Transport', 1),
('Utilities', 2),
('Entertainment', 2);


INSERT INTO Expenses (user_id, category_id, amount, currency, note, expense_date)
VALUES
(2, 1, 1200.00, 'KES', 'Groceries at supermarket', '2025-10-25'),
(2, 2, 300.00, 'KES', 'Matatu fare', '2025-10-26');



-- Run these one by one — they won't fail if column already exists
BEGIN TRY ALTER TABLE Users ADD verification_code VARCHAR(6) NULL; END TRY BEGIN CATCH END CATCH
BEGIN TRY ALTER TABLE Users ADD code_expires_at DATETIME2 NULL; END TRY BEGIN CATCH END CATCH
BEGIN TRY ALTER TABLE Users ADD verified BIT NULL; END TRY BEGIN CATCH END CATCH
BEGIN TRY ALTER TABLE Users ALTER COLUMN verified BIT NULL; END TRY BEGIN CATCH END CATCH




SELECT * FROM Users;
SELECT * FROM Categories;
SELECT * FROM Expenses;

SELECT e.id, e.amount, e.currency, e.note, e.expense_date, c.name AS category
FROM Expenses e
LEFT JOIN Categories c ON e.category_id = c.id
WHERE e.user_id = 2;


SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Users';


SELECT id, email, username, verified, verification_code
FROM Users 
WHERE email = 'marywanjiku60@yahoo.com';

Update Users
SET role = 'Admin'
WHERE email = 'marywanjiku60@yahoo.com';

ALTER TABLE USERS
ADD isSuspended BIT DEFAULT 0;

ALTER TABLE USERS
ADD suspensionReason DATETIME NULL;

ALTER TABLE USERS
ADD oldEmail VARCHAR(255) NULL;


-- Add is_suspended if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'is_suspended')
BEGIN
    ALTER TABLE users ADD is_suspended BIT DEFAULT 0;
END

-- Add verified if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'verified')
BEGIN
    ALTER TABLE users ADD verified BIT DEFAULT 0;
END

-- Add created_at if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'created_at')
BEGIN
    ALTER TABLE users ADD created_at DATETIME DEFAULT GETDATE();
END

-- Add updated_at if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'updated_at')
BEGIN
    ALTER TABLE users ADD updated_at DATETIME DEFAULT GETDATE();
END

SELECT * FROM users;
