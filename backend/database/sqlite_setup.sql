-- Drop schemas and tables (SQLite does not support schemas, so names are simplified)
DROP TABLE IF EXISTS tournament;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS game;
DROP TABLE IF EXISTS users_has_tournament;

-- Create tournament table
CREATE TABLE IF NOT EXISTS tournament (
  tourId INTEGER PRIMARY KEY,
  number_of_players INTEGER NOT NULL DEFAULT 0,
  round_number INTEGER,
  tour_winner TEXT
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL,
  user_password TEXT,
  longest_rally INTEGER,
  num_of_loss INTEGER,
  num_of_win INTEGER,
  data_account_made TEXT,
  date_last_login TEXT
);

-- Create game table
CREATE TABLE IF NOT EXISTS game (
  gameId INTEGER PRIMARY KEY,
  leftId INTEGER,
  rightId INTEGER,
  tournamentId INTEGER,
  leftScore INTEGER DEFAULT 0,
  rightScore INTEGER DEFAULT 0,
  FOREIGN KEY (leftId) REFERENCES users(id),
  FOREIGN KEY (rightId) REFERENCES users(id),
  FOREIGN KEY (tournamentId) REFERENCES tournament(tourId)
);

-- Create users_has_tournament linking table
CREATE TABLE IF NOT EXISTS users_has_tournament (
  users_id INTEGER NOT NULL,
  tournament_tourId INTEGER NOT NULL,
  user_is_active INTEGER,
  PRIMARY KEY (users_id, tournament_tourId),
  FOREIGN KEY (users_id) REFERENCES users(id),
  FOREIGN KEY (tournament_tourId) REFERENCES tournament(tourId)
);
