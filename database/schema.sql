-- Homey database schema (SQLite). Sprint 1: accounts, shops, dishes, orders.
PRAGMA foreign_keys = ON;

CREATE TABLE sellers (
  seller_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  category   TEXT,
  city       TEXT NOT NULL,
  photo_url  TEXT
);

CREATE TABLE users (
  user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  user_role     TEXT NOT NULL CHECK (user_role IN ('customer', 'seller')),
  seller_id     INTEGER REFERENCES sellers (seller_id)
);

CREATE TABLE listings (
  listing_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id   INTEGER NOT NULL REFERENCES sellers (seller_id),
  name        TEXT NOT NULL,
  price       REAL NOT NULL,
  description TEXT,
  photo_url   TEXT,
  city        TEXT
);

CREATE TABLE orders (
  order_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES users (user_id),
  listing_id  INTEGER NOT NULL REFERENCES listings (listing_id),
  seller_id   INTEGER NOT NULL REFERENCES sellers (seller_id),
  price       REAL NOT NULL
);

-- keeps a user logged in between requests (and between server restarts)
CREATE TABLE sessions (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users (user_id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- the first order gets the number 1001
INSERT INTO sqlite_sequence (name, seq) VALUES ('orders', 1000);
