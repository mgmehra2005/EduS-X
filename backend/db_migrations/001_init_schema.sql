-- Initial schema for EduS-X (MySQL)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exercise (
  exercise_id INT AUTO_INCREMENT PRIMARY KEY,
  concept_id INT NOT NULL,
  problem_text TEXT,
  canonical_solution TEXT,
  difficulty_level VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS attempts (
  attempt_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exercise_id INT NOT NULL,
  student_answer TEXT,
  is_correct BOOLEAN,
  hints_used INT DEFAULT 0,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS mastery (
  user_id INT NOT NULL,
  concept_id INT NOT NULL,
  accuracy_rate FLOAT,
  hint_efficiency FLOAT,
  consistency_score FLOAT,
  mastery_score FLOAT,
  mastery_level VARCHAR(50),
  streak INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, concept_id)
);

CREATE TABLE IF NOT EXISTS ai_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_query TEXT NOT NULL,
  ai_response LONGTEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (user_query(255))
);
