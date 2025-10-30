-- Drop schemas and tables (SQLite does not support schemas, so names are simplified)
DROP TABLE IF EXISTS tournament;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS game;
DROP TABLE IF EXISTS user_has_tourney;

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
  username TEXT,
  user_password TEXT NOT NULL,
  longest_rally INTEGER DEFAULT 0,
  session_id TEXT DEFAULT NULL,
  num_of_loss INTEGER DEFAULT 0,
  num_of_win INTEGER DEFAULT 0,
  date_account_made TEXT NOT NULL,
  date_last_login TEXT DEFAULT NULL,
  user_password_prev1 TEXT DEFAULT NULL,
  user_password_prev2 TEXT DEFAULT NULL,
  user_password_prev3 TEXT DEFAULT NULL,
  avatar TEXT UNIQUE DEFAULT NULL
);

-- Create friends table
/*
If I am my_id and someone else is friend_id: 
friend_status:
	 = NULL, not friends, not requested, not received request
	 = 0 I requeseted friendship
	 = 1, are friends
blocked_by_me:
	= 0, I haven't blocked them
	 = 1, I blocked them
*/
CREATE TABLE IF NOT EXISTS friend (
  my_id TEXT NOT NULL, 
  friend_id TEXT NOT NULL,
  blocked_by_me INTEGER NOT NULL DEFAULT 0,
  friend_status INTEGER DEFAULT NULL,
  PRIMARY KEY (my_id, friend_id),
  FOREIGN KEY (my_id) REFERENCES users(user_id),
  FOREIGN KEY (friend_id) REFERENCES users(user_id)
);

-- Create game table
CREATE TABLE IF NOT EXISTS game (
  game_id TEXT PRIMARY KEY UNIQUE,
  left_id TEXT,
  right_id TEXT,
  game_tour_id TEXT,
  left_score INTEGER DEFAULT 0,
  right_score INTEGER DEFAULT 0,
  date_finished TEXT,
  FOREIGN KEY (left_id) REFERENCES users(user_id),
  FOREIGN KEY (right_id) REFERENCES users(user_id),
  FOREIGN KEY (game_tour_id) REFERENCES tournament(tour_id)
);

-- Create user_has_tournament linking table
CREATE TABLE IF NOT EXISTS user_has_tourney (
  user_tourney_user_id TEXT NOT NULL,
  user_tourney_tour_id TEXT NOT NULL,
  user_is_active INTEGER CHECK (user_is_active IN (0, 1)),
  final_round INTEGER, 
  PRIMARY KEY (user_tourney_user_id, user_tourney_tour_id),
  FOREIGN KEY (user_tourney_user_id) REFERENCES users(user_id),
  FOREIGN KEY (user_tourney_tour_id) REFERENCES tournament(tour_id)
);

CREATE INDEX IF NOT EXISTS index_session_id on users(session_id);
CREATE INDEX IF NOT EXISTS index_username ON users(username);

PRAGMA foreign_keys = ON;