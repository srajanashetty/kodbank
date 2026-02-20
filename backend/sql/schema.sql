-- KodBank database schema
-- Run this in your Aiven MySQL database if tables don't exist

CREATE TABLE IF NOT EXISTS kodusers (
  uid VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'Customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS UserToken (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(500) NOT NULL,
  uid VARCHAR(50) NOT NULL,
  expairy DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usertoken_token ON UserToken(token);
CREATE INDEX idx_usertoken_expairy ON UserToken(expairy);
