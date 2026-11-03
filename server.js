/* ============================================================
   HOMEY BACKEND (Sprint 1)
   - serves the pages in /frontend
   - answers the requests that frontend/js/api.js sends (/api/...)
   - reads and writes the SQLite database database/homey.db
   Run it with:  npm start     then open  http://localhost:3000
   ============================================================ */
"use strict";
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

let DatabaseSync;
try {
  ({ DatabaseSync } = require("node:sqlite"));        // SQLite is built into Node.js 22 and newer
} catch (err) {
  console.error("This project needs Node.js 22 or newer (it uses the SQLite built into Node).");
  console.error("You have " + process.version + ". Install the LTS version from https://nodejs.org and try again.");
  process.exit(1);
}
const express = require("express");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || path.join(ROOT, "database", "homey.db");
const UPLOADS = path.join(ROOT, "uploads");
fs.mkdirSync(UPLOADS, { recursive: true });

/* ---------- 1. the database ---------- */
const db = new DatabaseSync(DB_FILE);
db.exec("PRAGMA foreign_keys = ON;");                  // make SQLite enforce the links between tables

const hasTables = db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name = 'sellers'").get().n > 0;
if (!hasTables) {                                      // first start: build the tables and load the starting data
  db.exec(fs.readFileSync(path.join(ROOT, "database", "schema.sql"), "utf8"));
  db.exec(fs.readFileSync(path.join(ROOT, "database", "seed.sql"), "utf8"));
  console.log("Created the database from database/schema.sql and database/seed.sql");
}

/* ---------- 2. helpers ---------- */
/* database rows (snake_case) -> the objects the pages expect (camelCase) */
const toUser = (r) => ({ id: r.user_id, name: r.name, email: r.email, role: r.user_role, sellerId: r.seller_id });
const toSeller = (r) => ({ id: r.seller_id, name: r.name, category: r.category, city: r.city, photo: r.photo_url, dishCount: r.dish_count });
const toListing = (r) => ({ id: r.listing_id, sellerId: r.seller_id, name: r.name, price: r.price,
                            description: r.description, photo: r.photo_url, city: r.city });

/* passwords are stored hashed (scrypt with a random salt), never as plain text */
function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return "scrypt$" + salt.toString("hex") + "$" + hash.toString("hex");
}
function checkPassword(password, stored) {
  const parts = String(stored).split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const expected = Buffer.from(parts[2], "hex");
  const actual = crypto.scryptSync(password, Buffer.from(parts[1], "hex"), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

function startSession(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  db.prepare("INSERT INTO sessions (token, user_id) VALUES (:token, :userId)").run({ token: token, userId: userId });
  return token;
}

/* a photo arrives as text (a data URL); save it as a file and keep only its path in the database */
function savePhoto(dataUrl) {
  if (typeof dataUrl !== "string") return null;
  const m = /^data:image\/(png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) return null;
  const file = "listing-" + crypto.randomBytes(8).toString("hex") + "." + (m[1] === "jpeg" ? "jpg" : m[1]);
  fs.writeFileSync(path.join(UPLOADS, file), Buffer.from(m[2], "base64"));
  return "uploads/" + file;
}

/* who is making this request? (the page sends the login token in the Authorization header) */
function requireLogin(req, res, next) {
  const header = req.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const user = token ? db.prepare(
    "SELECT u.* FROM sessions s JOIN users u ON u.user_id = s.user_id WHERE s.token = :token").get({ token: token }) : null;
  if (!user) return res.status(401).json({ ok: false, error: "Please log in." });
  req.user = user;
  next();
}

/* ---------- 3. the routes (each one matches a function in frontend/js/api.js) ---------- */
const app = express();
app.use(express.json({ limit: "8mb" }));

const SELLER_SELECT =
  "SELECT s.seller_id, s.name, s.category, s.city, s.photo_url, " +
  "(SELECT COUNT(*) FROM listings l WHERE l.seller_id = s.seller_id) AS dish_count FROM sellers s";

app.get("/api/cities", (req, res) => {
  const rows = db.prepare("SELECT city FROM sellers WHERE city <> '' GROUP BY city ORDER BY MIN(seller_id)").all();
  res.json(rows.map((r) => r.city));
});

app.get("/api/sellers", (req, res) => {
  const city = req.query.city ? String(req.query.city) : null;
  const rows = db.prepare(SELLER_SELECT + " WHERE (:city IS NULL OR s.city = :city) ORDER BY s.seller_id").all({ city: city });
  res.json(rows.map(toSeller));
});

app.get("/api/sellers/:id", (req, res) => {
  const row = db.prepare(SELLER_SELECT + " WHERE s.seller_id = :id").get({ id: Number(req.params.id) });
  if (!row) return res.status(404).json({ error: "Seller not found" });
  res.json(toSeller(row));
});

app.get("/api/sellers/:id/listings", (req, res) => {
  const rows = db.prepare("SELECT * FROM listings WHERE seller_id = :id ORDER BY listing_id").all({ id: Number(req.params.id) });
  res.json(rows.map(toListing));
});

app.get("/api/listings/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM listings WHERE listing_id = :id").get({ id: Number(req.params.id) });
  if (!row) return res.status(404).json({ error: "Dish not found" });
  res.json(toListing(row));
});

app.post("/api/login", (req, res) => {
  const b = req.body || {};
  const user = db.prepare("SELECT * FROM users WHERE email = :email").get({ email: String(b.email || "") });
  if (!user || !checkPassword(String(b.password || ""), user.password_hash)) return res.json({ ok: false });
  res.json({ ok: true, user: toUser(user), token: startSession(user.user_id) });
});

app.post("/api/register", (req, res) => {
  const b = req.body || {};
  try {
    const result = db.prepare(
      "INSERT INTO users (name, email, password_hash, user_role) VALUES (:name, :email, :hash, :role)").run({
        name: String(b.name || "").trim(), email: String(b.email || "").trim(),
        hash: hashPassword(String(b.password || "")), role: String(b.role || "") });
    const user = db.prepare("SELECT * FROM users WHERE user_id = :id").get({ id: Number(result.lastInsertRowid) });
    res.json({ ok: true, user: toUser(user), token: startSession(user.user_id) });
  } catch (err) {                                       // for example: the email is already used (UNIQUE rule)
    res.json({ ok: false });
  }
});

app.post("/api/logout", requireLogin, (req, res) => {
  const token = (req.get("Authorization") || "").slice(7);
  db.prepare("DELETE FROM sessions WHERE token = :token").run({ token: token });
  res.json({ ok: true });
});

app.post("/api/listings", requireLogin, (req, res) => {
  if (req.user.user_role !== "seller") return res.status(403).json({ ok: false, error: "Only sellers can create listings." });
  const b = req.body || {};
  const city = String(b.city || "");
  const photoUrl = savePhoto(b.photo);
  try {
    db.exec("BEGIN");
    let sellerId = req.user.seller_id;
    if (!sellerId) {                                    // a new seller gets a shop with their first listing
      sellerId = Number(db.prepare("INSERT INTO sellers (name, category, city, photo_url) VALUES (:name, NULL, :city, NULL)")
        .run({ name: req.user.name, city: city }).lastInsertRowid);
      db.prepare("UPDATE users SET seller_id = :sellerId WHERE user_id = :userId").run({ sellerId: sellerId, userId: req.user.user_id });
    }
    const id = Number(db.prepare(
      "INSERT INTO listings (seller_id, name, price, description, photo_url, city) " +
      "VALUES (:sellerId, :name, :price, :description, :photo, :city)").run({
        sellerId: sellerId, name: String(b.name || "").trim(), price: Number(b.price) || 0,
        description: String(b.description || "").trim(), photo: photoUrl, city: city }).lastInsertRowid);
    db.exec("COMMIT");
    const row = db.prepare("SELECT * FROM listings WHERE listing_id = :id").get({ id: id });
    res.json({ ok: true, listing: toListing(row), sellerId: sellerId });
  } catch (err) {
    try { db.exec("ROLLBACK"); } catch (e) { /* nothing to undo */ }
    res.status(500).json({ ok: false });
  }
});

app.post("/api/orders", requireLogin, (req, res) => {
  const listing = db.prepare("SELECT * FROM listings WHERE listing_id = :id").get({ id: Number((req.body || {}).listingId) });
  if (!listing) return res.status(404).json({ ok: false, error: "Dish not found" });
  const result = db.prepare(                            // the price comes from the database, not from the page
    "INSERT INTO orders (customer_id, listing_id, seller_id, price) VALUES (:customer, :listing, :seller, :price)").run({
      customer: req.user.user_id, listing: listing.listing_id, seller: listing.seller_id, price: listing.price });
  res.json({ ok: true, order: { id: Number(result.lastInsertRowid), customerId: req.user.user_id,
                                listingId: listing.listing_id, sellerId: listing.seller_id, price: listing.price } });
});

app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

/* ---------- 4. the pages and the uploaded photos ---------- */
app.use("/uploads", express.static(UPLOADS));
app.use(express.static(path.join(ROOT, "frontend")));

app.use((err, req, res, next) => {                      // bad JSON, or a photo that is too large
  res.status(err.status || 500).json({ ok: false, error: "The request could not be read." });
});

app.listen(PORT, () => {
  console.log("Homey is running at http://localhost:" + PORT);
  console.log("Press Ctrl+C to stop it.");
});
