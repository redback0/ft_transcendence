-- SQLite version of the schema

-- Drop tables if they exist
DROP TABLE IF EXISTS tournament;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS game;

-- Create the tournament table
CREATE TABLE tournament (
  tourId INTEGER PRIMARY KEY,
  number_of_players INTEGER NOT NULL DEFAULT 0,
  round_number INTEGER,
  active_players TEXT,
  non_active_players TEXT
);

-- Create the users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL,
  user_password TEXT,
  longest_rally INTEGER,
  num_of_loss INTEGER,
  num_of_win INTEGER,
  tournament_tourId INTEGER,
  data_account_made TEXT,
  date_last_login TEXT,
  FOREIGN KEY (tournament_tourId) REFERENCES tournament (tourId)
);

-- Create the game table
CREATE TABLE game (
  gameId INTEGER PRIMARY KEY,
  leftId INTEGER,
  rightId INTEGER,
  tournamentId INTEGER NOT NULL,
  leftScore INTEGER DEFAULT 0,
  rightScore INTEGER DEFAULT 0,
  FOREIGN KEY (leftId) REFERENCES users (id),
  FOREIGN KEY (rightId) REFERENCES users (id),
  FOREIGN KEY (tournamentId) REFERENCES tournament (tourId)
);
