/* ============================================================
   DATA ACCESS - every page gets its data through the functions in this file.
   Each function sends a request to the backend (server.js), which reads and
   writes the SQLite database (database/homey.db). The pages never touch the
   database themselves.

   Every function returns a Promise, so the pages wait for the answer with await.
   Who is logged in is kept in this browser tab (session storage), together with
   a login token that proves it to the backend.
   ============================================================ */

const API = "/api";
const USER_KEY = "homey_user";
const TOKEN_KEY = "homey_token";
const PLACEHOLDER = "img/placeholder.svg";

function storageWorks() {
  try { sessionStorage.setItem("homey_test", "1"); sessionStorage.removeItem("homey_test"); return true; }
  catch (err) { return false; }
}

/* ---------- sending a request ---------- */
function getToken() {
  try { return sessionStorage.getItem(TOKEN_KEY) || ""; } catch (err) { return ""; }
}

async function call(method, url, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(API + url, { method: method, headers: headers, body: body === undefined ? undefined : JSON.stringify(body) });
  let data = null;
  try { data = await res.json(); } catch (err) { data = null; }
  return { status: res.status, data: data };
}

/* Round picture with the first letter, for a seller who has no logo yet */
function avatarFor(name) {
  const letter = (String(name).trim().charAt(0) || "?").toUpperCase().replace(/[<>&"']/g, "?");
  return "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#fbf1cf"/>' +
    '<text x="60" y="78" font-family="Arial, sans-serif" font-size="56" font-weight="700" text-anchor="middle" fill="#311802">' +
    letter + '</text></svg>');
}

function withPhoto(seller) {
  return Object.assign({}, seller, { photo: seller.photo || avatarFor(seller.name) });
}

/* ---------- accounts ---------- */
async function loginRequest(email, password) {
  const r = await call("POST", "/login", { email: email, password: password });
  if (r.data && r.data.ok) {
    try { sessionStorage.setItem(TOKEN_KEY, r.data.token); } catch (err) { /* storage can be blocked */ }
    return { ok: true, user: r.data.user };
  }
  return { ok: false };
}

async function registerRequest(data) {
  const r = await call("POST", "/register", data);
  if (r.data && r.data.ok) {
    try { sessionStorage.setItem(TOKEN_KEY, r.data.token); } catch (err) { /* storage can be blocked */ }
    return { ok: true, user: r.data.user };
  }
  return { ok: false };
}

/* Who is logged in (kept for this tab) */
function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) { return null; }
}

function setCurrentUser(user) {
  try { sessionStorage.setItem(USER_KEY, JSON.stringify(user)); } catch (err) { /* storage can be blocked */ }
}

function logout() {
  if (getToken()) call("POST", "/logout").catch(function () { /* the server may be off; log out here anyway */ });
  try {
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem("homey_greeting");
    sessionStorage.removeItem("homey_pending");
  } catch (err) { /* nothing to clear */ }
}

/* ---------- sellers and listings ---------- */
async function getCities() {
  const r = await call("GET", "/cities");
  return r.data || [];
}

/* Sellers, optionally for one city. Each seller includes dishCount. */
async function getSellers(city) {
  const r = await call("GET", "/sellers?city=" + encodeURIComponent(city || ""));
  return (r.data || []).map(withPhoto);
}

async function getSeller(id) {
  const r = await call("GET", "/sellers/" + encodeURIComponent(id));
  return r.status === 200 ? withPhoto(r.data) : null;
}

async function getListings(sellerId) {
  const r = await call("GET", "/sellers/" + encodeURIComponent(sellerId) + "/listings");
  return r.data || [];
}

async function getListing(id) {
  const r = await call("GET", "/listings/" + encodeURIComponent(id));
  return r.status === 200 ? r.data : null;
}

/* A seller creates a listing. A seller with no shop yet gets one, using the name they signed up with. */
async function createListing(user, data) {
  const r = await call("POST", "/listings", data);
  return r.data && r.data.ok ? r.data : { ok: false };
}

/* ---------- orders ---------- */

/* A customer places an order */
async function placeOrder(user, listingId) {
  const r = await call("POST", "/orders", { listingId: listingId });
  return r.data && r.data.ok ? r.data : { ok: false };
}
