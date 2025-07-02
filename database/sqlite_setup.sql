-- Drop schemas and tables (SQLite does not support schemas, so names are simplified)
DROP TABLE IF EXISTS tournament;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS game;
DROP TABLE IF EXISTS user_has_tournament;

-- Create tournament table
CREATE TABLE IF NOT EXISTS tournament (
  tour_id TEXT PRIMARY KEY UNIQUE,
  number_of_players INTEGER NOT NULL DEFAULT 0,
  round_number INTEGER,
  tour_winner TEXT,
  tour_name TEXT
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY UNIQUE,
  username TEXT NOT NULL,
  user_password TEXT,
  longest_rally INTEGER,
  session_id TEXT,
  num_of_loss INTEGER,
  num_of_win INTEGER,
  date_account_made TEXT,
  date_last_login TEXT,
  user_password_prev1 TEXT,
  user_password_prev2 TEXT,
  user_password_prev3 TEXT,
  avatar TEXT UNIQUE
);

-- Create game table
CREATE TABLE IF NOT EXISTS game (
  game_id TEXT PRIMARY KEY UNIQUE,
  left_id TEXT,
  right_id TEXT,
  game_tour_id TEXT,
  left_score INTEGER DEFAULT 0,
  right_score INTEGER DEFAULT 0,
  FOREIGN KEY (left_id) REFERENCES users(user_id),
  FOREIGN KEY (right_id) REFERENCES users(user_id),
  FOREIGN KEY (game_tour_id) REFERENCES tournament(tour_id)
);

-- Create user_has_tournament linking table
CREATE TABLE IF NOT EXISTS user_has_tournament (
  user_tournament_user_id TEXT NOT NULL,
  user_tournament_tour_id TEXT NOT NULL,
  user_is_active INTEGER CHECK (user_is_active IN (0, 1)),
  final_round INTEGER, 
  PRIMARY KEY (user_tournament_user_id, user_tournament_tour_id),
  FOREIGN KEY (user_tournament_user_id) REFERENCES users(user_id),
  FOREIGN KEY (user_tournament_tour_id) REFERENCES tournament(tour_id)
);

CREATE INDEX IF NOT EXISTS index_username ON users(username);

PRAGMA foreign_keys = ON;