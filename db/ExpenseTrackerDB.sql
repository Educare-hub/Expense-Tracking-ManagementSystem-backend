
-- EXPENSE TRACKER DATABASE 

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


IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'verification_code')
    ALTER TABLE Users ADD verification_code VARCHAR(6) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'code_expires_at')
    ALTER TABLE Users ADD code_expires_at DATETIME2 NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'verified')
    ALTER TABLE Users ADD verified BIT DEFAULT 0;


    -- column with error handling
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

-- i use this to updated data of column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'updated_at')
BEGIN
    ALTER TABLE users ADD updated_at DATETIME DEFAULT GETDATE();
END

SELECT * FROM users;



-- SELECT COLUMN_NAME, DATA_TYPE
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME = 'categories';


-- INSERT INTO categories (name, user_id)
-- VALUES ('TestCategory', 67);



-- /* SQL Server 2017 and above edition (14.0, 15.0, 16.0, 17.0) fron CHATDB*/
-- WITH fk_info AS (
--     SELECT
--         JSON_QUERY(
--             N'[' + STRING_AGG(
--                 CONVERT(nvarchar(max),
--                     JSON_QUERY(N'{
--                         "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(tp_schema.name, '"', ''), ''), 'json') +
--                         '", "table": "' + STRING_ESCAPE(COALESCE(REPLACE(tp.name, '"', ''), ''), 'json') +
--                         '", "column": "' + STRING_ESCAPE(COALESCE(REPLACE(cp.name, '"', ''), ''), 'json') +
--                         '", "foreign_key_name": "' + STRING_ESCAPE(COALESCE(REPLACE(fk.name, '"', ''), ''), 'json') +
--                         '", "reference_schema": "' + STRING_ESCAPE(COALESCE(REPLACE(tr_schema.name, '"', ''), ''), 'json') +
--                         '", "reference_table": "' + STRING_ESCAPE(COALESCE(REPLACE(tr.name, '"', ''), ''), 'json') +
--                         '", "reference_column": "' + STRING_ESCAPE(COALESCE(REPLACE(cr.name, '"', ''), ''), 'json') +
--                         '", "fk_def": "FOREIGN KEY (' + STRING_ESCAPE(COALESCE(REPLACE(cp.name, '"', ''), ''), 'json') +
--                         ') REFERENCES ' + STRING_ESCAPE(COALESCE(REPLACE(tr.name, '"', ''), ''), 'json') +
--                         '(' + STRING_ESCAPE(COALESCE(REPLACE(cr.name, '"', ''), ''), 'json') +
--                         ') ON DELETE ' + STRING_ESCAPE(fk.delete_referential_action_desc, 'json') +
--                         ' ON UPDATE ' + STRING_ESCAPE(fk.update_referential_action_desc, 'json') +
--                     '"}') COLLATE DATABASE_DEFAULT
--                 ), N','
--             ) + N']'
--         ) AS all_fks_json
--     FROM sys.foreign_keys AS fk
--     JOIN sys.foreign_key_columns AS fkc ON fk.object_id = fkc.constraint_object_id
--     JOIN sys.tables AS tp ON fkc.parent_object_id = tp.object_id
--     JOIN sys.schemas AS tp_schema ON tp.schema_id = tp_schema.schema_id
--     JOIN sys.columns AS cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
--     JOIN sys.tables AS tr ON fkc.referenced_object_id = tr.object_id
--     JOIN sys.schemas AS tr_schema ON tr.schema_id = tr_schema.schema_id
--     JOIN sys.columns AS cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
-- ), pk_info AS (
--     SELECT
--         JSON_QUERY(
--             N'[' +
--                 STRING_AGG(
--                     CONVERT(nvarchar(max),
--                         JSON_QUERY(N'{
--                             "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(pk.TABLE_SCHEMA, '"', ''), ''), 'json') +
--                             '", "table": "' + STRING_ESCAPE(COALESCE(REPLACE(pk.TABLE_NAME, '"', ''), ''), 'json') +
--                             '", "column": "' + STRING_ESCAPE(COALESCE(REPLACE(pk.COLUMN_NAME, '"', ''), ''), 'json') +
--                             '", "pk_def": "PRIMARY KEY (' + STRING_ESCAPE(pk.COLUMN_NAME, 'json') + N')"}') COLLATE DATABASE_DEFAULT
--                         ), N','
--                 ) + N']'
--         ) AS all_pks_json
--     FROM (
--         SELECT
--             kcu.TABLE_SCHEMA,
--             kcu.TABLE_NAME,
--             kcu.COLUMN_NAME
--         FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
--         JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
--             ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
--             AND kcu.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
--         WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
--     ) pk
-- ),
-- cols AS (
--     SELECT
--         JSON_QUERY(N'[' +
--             STRING_AGG(
--                 CONVERT(nvarchar(max),
--                     JSON_QUERY(N'{
--                         "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(cols.TABLE_SCHEMA, '"', ''), ''), 'json') +
--                         '", "table": "' + STRING_ESCAPE(COALESCE(REPLACE(cols.TABLE_NAME, '"', ''), ''), 'json') +
--                         '", "name": "' + STRING_ESCAPE(COALESCE(REPLACE(cols.COLUMN_NAME, '"', ''), ''), 'json') +
--                         '", "ordinal_position": ' + CAST(cols.ORDINAL_POSITION AS NVARCHAR(MAX)) +
--                         ', "type": "' + STRING_ESCAPE(LOWER(cols.DATA_TYPE), 'json') +
--                         '", "character_maximum_length": "' +
--                             CASE
--                                 WHEN cols.CHARACTER_MAXIMUM_LENGTH IS NULL THEN 'null'
--                                 ELSE CAST(cols.CHARACTER_MAXIMUM_LENGTH AS NVARCHAR(MAX))
--                             END +
--                         '", "precision": ' +
--                             CASE
--                                 WHEN cols.DATA_TYPE IN ('numeric', 'decimal')
--                                 THEN '{"precision":' + COALESCE(CAST(cols.NUMERIC_PRECISION AS NVARCHAR(MAX)), 'null') +
--                                      ',"scale":' + COALESCE(CAST(cols.NUMERIC_SCALE AS NVARCHAR(MAX)), 'null') + '}'
--                                 ELSE 'null'
--                             END +
--                         ', "nullable": ' + CASE WHEN cols.IS_NULLABLE = 'YES' THEN 'true' ELSE 'false' END +
--                         ', "default": ' + '""' +
--                         ', "collation": ' + CASE
--                             WHEN cols.COLLATION_NAME IS NULL THEN 'null'
--                             ELSE '"' + STRING_ESCAPE(cols.COLLATION_NAME, 'json') + '"'
--                         END +
--                         ', "is_identity": ' + CASE 
--                             WHEN COLUMNPROPERTY(OBJECT_ID(cols.TABLE_SCHEMA + '.' + cols.TABLE_NAME), cols.COLUMN_NAME, 'IsIdentity') = 1 
--                             THEN 'true' 
--                             ELSE 'false' 
--                         END +
--                     N'}') COLLATE DATABASE_DEFAULT
--                 ), N','
--             ) +
--         N']') AS all_columns_json
--     FROM INFORMATION_SCHEMA.COLUMNS cols
--     WHERE cols.TABLE_CATALOG = DB_NAME()
-- ),
-- indexes AS (
--     SELECT
--         N'[' +
--             STRING_AGG(
--                 CONVERT(nvarchar(max),
--                     JSON_QUERY(N'{
--                         "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(s.name, '"', ''), ''), 'json') +
--                         '", "table": "' + STRING_ESCAPE(COALESCE(REPLACE(t.name, '"', ''), ''), 'json') +
--                         '", "name": "' + STRING_ESCAPE(COALESCE(REPLACE(i.name, '"', ''), ''), 'json') +
--                         '", "column": "' + STRING_ESCAPE(COALESCE(REPLACE(c.name, '"', ''), ''), 'json') +
--                         '", "index_type": "' + STRING_ESCAPE(LOWER(i.type_desc), 'json') +
--                         '", "unique": ' + CASE WHEN i.is_unique = 1 THEN 'true' ELSE 'false' END +
--                         ', "direction": "' + CASE WHEN ic.is_descending_key = 1 THEN 'desc' ELSE 'asc' END +
--                         '", "column_position": ' + CAST(ic.key_ordinal AS nvarchar(max)) + N'}'
--                     ) COLLATE DATABASE_DEFAULT
--                 ), N','
--             ) +
--         N']' AS all_indexes_json
--     FROM sys.indexes i
--     JOIN sys.tables t ON i.object_id = t.object_id
--     JOIN sys.schemas s ON t.schema_id = s.schema_id
--     JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
--     JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
--     WHERE s.name LIKE '%' AND i.name IS NOT NULL AND ic.is_included_column = 0
-- ),
-- tbls AS (
--     SELECT
--         N'[' + STRING_AGG(
--                 CONVERT(nvarchar(max),
--                         JSON_QUERY(N'{
--                             "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(aggregated.schema_name, '"', ''), ''), 'json') +
--                             '", "table": "' + STRING_ESCAPE(COALESCE(REPLACE(aggregated.table_name, '"', ''), ''), 'json') +
--                             '", "row_count": ' + CAST(aggregated.row_count AS NVARCHAR(MAX)) +
--                             ', "table_type": "' + STRING_ESCAPE(aggregated.table_type, 'json') +
--                             '", "creation_date": "' + CONVERT(NVARCHAR(MAX), aggregated.creation_date, 120) + N'"}'
--                         ) COLLATE DATABASE_DEFAULT
--                     ), N','
--                 ) +
--         N']' AS all_tables_json
--     FROM (
--         SELECT
--             COALESCE(REPLACE(s.name, '"', ''), '') AS schema_name,
--             COALESCE(REPLACE(t.name, '"', ''), '') AS table_name,
--             SUM(p.rows) AS row_count,
--             t.type_desc AS table_type,
--             t.create_date AS creation_date
--         FROM sys.tables t
--         JOIN sys.schemas s ON t.schema_id = s.schema_id
--         JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0, 1)
--         WHERE s.name LIKE '%'
--         GROUP BY s.name, t.name, t.type_desc, t.create_date

--         UNION ALL

--         SELECT
--             COALESCE(REPLACE(s.name, '"', ''), '') AS table_name,
--             COALESCE(REPLACE(v.name, '"', ''), '') AS object_name,
--             0 AS row_count,
--             'VIEW' AS table_type,
--             v.create_date AS creation_date
--         FROM sys.views v
--         JOIN sys.schemas s ON v.schema_id = s.schema_id
--         WHERE s.name LIKE '%'
--     ) AS aggregated
-- ),
-- views AS (
--     SELECT
--         '[' + STRING_AGG(
--                 CONVERT(nvarchar(max),
--                 JSON_QUERY(N'{
--                     "schema": "' + STRING_ESCAPE(COALESCE(REPLACE(s.name, '"', ''), ''), 'json') +
--                     '", "view_name": "' + STRING_ESCAPE(COALESCE(REPLACE(v.name, '"', ''), ''), 'json') +
--                     '", "view_definition": ""}') COLLATE DATABASE_DEFAULT
--                 ), N','
--         ) + N']' AS all_views_json
--     FROM sys.views v
--     JOIN sys.schemas s ON v.schema_id = s.schema_id
--     JOIN sys.sql_modules m ON v.object_id = m.object_id
--     CROSS APPLY
--         (SELECT CONVERT(VARBINARY(MAX), m.definition) AS DefinitionBinary) AS bin
--     WHERE s.name LIKE '%'
-- )
-- SELECT JSON_QUERY(
--     N'{
--         "fk_info": ' + ISNULL((SELECT cast(all_fks_json as nvarchar(max)) FROM fk_info), N'[]') +
--         ', "pk_info": ' + ISNULL((SELECT cast(all_pks_json as nvarchar(max)) FROM pk_info), N'[]') +
--         ', "columns": ' + ISNULL((SELECT cast(all_columns_json as nvarchar(max)) FROM cols), N'[]') +
--         ', "indexes": ' + ISNULL((SELECT cast(all_indexes_json as nvarchar(max)) FROM indexes), N'[]') +
--         ', "tables": ' + ISNULL((SELECT cast(all_tables_json as nvarchar(max)) FROM tbls), N'[]') +
--         ', "views": ' + ISNULL((SELECT cast(all_views_json as nvarchar(max)) FROM views), N'[]') +
--         ', "database_name": "' + STRING_ESCAPE(DB_NAME(), 'json') +
--         '", "version": ""
--     }'
-- ) AS metadata_json_to_import;
