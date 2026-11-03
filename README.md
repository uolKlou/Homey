# Homey (Sprint 1)

A marketplace where people sell and buy homemade food. This is the Sprint 1 version, built on a real SQLite database.

## What you need
- **Node.js 22 or newer** (the LTS version from https://nodejs.org). It includes `npm`, and SQLite is built in.
- A browser (Chrome or Edge).
- Optional, to look inside the database: **DB Browser for SQLite** (https://sqlitebrowser.org).

## Run it
1. Open a terminal **inside this folder** (the one that contains `package.json`).
2. `npm install` (first time only, needs internet).
3. `npm start`
4. Open **http://localhost:3000** in the browser.

Keep the terminal open while you use the system. Press `Ctrl + C` in it to stop. A line saying "SQLite is an experimental feature" is normal.

## Test accounts
| Role | Email | Password |
|---|---|---|
| Customer | sara@example.com | Test1234 |
| Seller | chef@example.com | Test1234 |

Use **Log out** in the menu to switch between them, or **Register** to create new ones.

## What you can do
- **Customer:** log in, pick a city, open a shop's menu, press Order, confirm. "Order placed" appears with an order number.
- **Seller:** log in, fill in the create-listing form (name, price, description, photo, location). The dish appears on the shop's menu.
- **Anyone:** Register creates a customer or seller account. A new seller gets a shop on their first listing.

Everything you create is saved in the database, so it is still there after you close the browser or stop the server.

## How it fits together
```
Pages (frontend/*.html)  ->  page scripts (frontend/js/*.js)  ->  frontend/js/api.js
      ->  requests to /api/...  ->  server.js  ->  SQL  ->  database/homey.db
```
- `frontend/js/api.js` is the only file the pages use to get data. Each function sends a request to the backend.
- `server.js` answers those requests with SQL queries on SQLite and serves the pages.
- On the first start, `server.js` builds `database/homey.db` from `database/schema.sql` and `database/seed.sql`.

## The database (database/schema.sql)
| Table | Holds |
|---|---|
| `sellers` | the shops: name, category, city, logo |
| `users` | accounts: name, email, hashed password, role (customer or seller), shop |
| `listings` | the dishes: shop, name, price, description, photo, city |
| `orders` | the orders: customer, dish, shop, price (the first order is #1001) |
| `sessions` | who is logged in (the login token) |

Rules enforced by the database: unique emails, a role that is only `customer` or `seller`, and every dish, order and account must point to something that exists (foreign keys).

Passwords are stored hashed (scrypt), never as plain text. Uploaded photos are saved as files in `uploads/`, and only their path is stored in the database.

## The backend routes (server.js)
| Route | What it does |
|---|---|
| `GET /api/cities` | the cities that have shops |
| `GET /api/sellers?city=` | the shops, optionally for one city, with their dish count |
| `GET /api/sellers/:id` | one shop |
| `GET /api/sellers/:id/listings` | the dishes of one shop |
| `GET /api/listings/:id` | one dish |
| `POST /api/register` | create an account |
| `POST /api/login` | log in |
| `POST /api/logout` | log out |
| `POST /api/listings` | create a dish (sellers only, must be logged in) |
| `POST /api/orders` | place an order (must be logged in; the price comes from the database) |

## Start over with fresh data
Stop the server, delete `database/homey.db` (and the files in `uploads/` if you want), then run `npm start` again. The database is rebuilt from the two SQL files.

## Project folders
```
server.js          the backend
package.json       the project list (npm install reads this)
database/          schema.sql, seed.sql (and homey.db, created on first start)
frontend/          the pages, styles, scripts, fonts and images
uploads/           photos uploaded with new listings
```

## Not in Sprint 1
Quantity and totals, payment, search and filters, seller profile, contacting a seller, and editing or deleting a listing.
