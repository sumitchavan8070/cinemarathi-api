-- Step 1: Add 'admin' to the user_type enum (if not already done)
ALTER TABLE users 
MODIFY COLUMN user_type ENUM('actor','technician','production_house','studio','media','admin') NOT NULL;

-- Step 2: Create admin user
-- Replace 'YOUR_HASHED_PASSWORD' with the actual bcrypt hash
-- Replace the email, name, and other values as needed

INSERT INTO users (
    user_type,
    name,
    email,
    password_hash,
    is_verified,
    created_at
) VALUES (
    'admin',
    'Admin User',
    'admin@cinemarathi.com',
    '$2a$10$rOzJqXKqKqKqKqKqKqKqK.qKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqK',  -- Replace with actual bcrypt hash
    1,  -- is_verified = true
    NOW()
);

-- To generate a bcrypt hash, you can:
-- 1. Use the create-admin script: npm run create-admin
-- 2. Or use this Node.js one-liner:
--    node -e "const bcrypt=require('bcryptjs');bcrypt.hash('yourpassword',10).then(h=>console.log(h))"

