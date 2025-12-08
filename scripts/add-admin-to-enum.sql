-- Add 'admin' to the user_type enum
-- Run this SQL command in your MySQL database

ALTER TABLE users 
MODIFY COLUMN user_type ENUM('actor','technician','production_house','studio','media','admin') NOT NULL;

