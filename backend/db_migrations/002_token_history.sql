-- Token history table to track issued JWTs
CREATE TABLE IF NOT EXISTS token_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  user_agent VARCHAR(1024),
  ip_address VARCHAR(64),
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
