/* ============================================================
   SHARED PAGE PARTS - the navbar, the footer, the message bar and a few helpers.
   Every page calls Homey.init("page-name") once. To add a menu link, change the
   NAV_HTML text below and it appears on every page.
   ============================================================ */
const Homey = {

  NAV_HTML: `<nav class="navbar navbar-expand-lg bg-body-tertiary text-center">
        <div class="container-fluid">
            <a class="navbar-brand" href="login.html" id="brandLink"><img class="img-fluid logo" src="img/logo.png"></a>
            <button class="navbar-toggler " type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="browse.html" id="chefsLink">Chefs</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="create-listing.html" id="createLink" hidden>Create listing</a>
                    </li>
                </ul>
                
            <div class="text-center login my-5 my-md-0 ">
                <a class=" py-2 px-5 font-weight-bold ms-3" id="authLink" href="login.html">Register</a>
              </div>
            </div>
           
            <div class="col-md-6 text-center text-lg-right">
                <div class="d-inline-flex align-items-center">
                </div>
            </div>

    </div>
    </nav>`,

  FOOTER_HTML: `<footer class="footer text-center text-md-left">

        <section class="bg-light py-4 py-md-5 py-xl-8 border-top border-light">
            <div class="container overflow-hidden">
                <div class="row gy-4 gy-lg-0 justify-content-xl-between">

                    <div class="col-12 col-md-4 col-lg-3 col-xl-2 my-5 my-md-0">
                        <div class="widget">
                            <h4 class="widget-title mb-4">Get in Touch</h4>
                            <address class="mb-4">0000 North Dis, Riyadh, KSA</address>
                            <p class="mb-1">
                                <a class="link-secondary text-decoration-none" href="tel:+15057922430">(000)
                                    000-0000</a>
                            </p>
                            <p class="mb-0">
                                <a class="link-secondary text-decoration-none" href="mailto:demo@yourdomain.com">Hello@
                                    Homey.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Copyright - Bootstrap Brain Component -->
        <div class="bg-light py-4 py-md-3  py-xl-8 border-top border-light-subtle ">
            <div class="container overflow-hidden">
                <div class="row gy-4 gy-md-0 align-items-center">
                    <div class="col-12  order-1 order-md-0">
                        <div class="copyright text-center">
                            &copy; 2026. All Rights Reserved.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>`,

  go: function (url) { location.href = url; },

  esc: function (text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  },

  money: function (n) {
    const v = Math.round(Number(n) * 100) / 100;
    return "SAR " + (Number.isInteger(v) ? v : v.toFixed(2));
  },

  setError: function (input, box, message) {
    box.textContent = message;
    if (input) input.classList.toggle("invalid", message !== "");
  },

  /* A short message under the navbar */
  say: function (message) {
    const box = document.getElementById("notice");
    if (!box) return;
    box.textContent = message;
    box.hidden = false;
    clearTimeout(Homey._timer);
    Homey._timer = setTimeout(function () { box.hidden = true; }, 4500);
  },

  /* A message to show on the NEXT page */
  flash: function (message) {
    try { sessionStorage.setItem("homey_flash", message); } catch (err) { /* storage can be blocked */ }
  },

  /* Called after a successful login or sign-up */
  afterAuth: function (user, isNew) {
    setCurrentUser(user);
    let pending = null;
    try {
      sessionStorage.setItem("homey_greeting", (isNew ? "Welcome, " : "Welcome back, ") + user.name + ".");
      pending = JSON.parse(sessionStorage.getItem("homey_pending") || "null");
      sessionStorage.removeItem("homey_pending");
    } catch (err) { /* storage can be blocked */ }
    if (pending && pending.type === "order") { Homey.go("order.html?listing=" + pending.listingId); return; }
    Homey.go(user.role === "seller" ? "create-listing.html" : "browse.html");
  },

  /* Draws the navbar and footer and sets the menu for whoever is logged in */
  init: function (page) {
    document.getElementById("site-nav").innerHTML = Homey.NAV_HTML +
      '<div class="container mt-3"><p class="notice" id="notice" role="status" hidden></p></div>';
    document.getElementById("site-footer").innerHTML = Homey.FOOTER_HTML;

    const user = getCurrentUser();
    const authLink = document.getElementById("authLink");
    document.getElementById("brandLink").href = user ? "browse.html" : "login.html";
    document.getElementById("createLink").hidden = !(user && user.role === "seller");

    if (user) {
      authLink.textContent = "Log out";
      authLink.href = "#";
      authLink.addEventListener("click", function (e) {
        e.preventDefault();
        logout();
        Homey.flash("You have been logged out.");
        Homey.go("login.html");
      });
    } else if (page === "login") {
      authLink.textContent = "Register";
      authLink.href = "signup.html";
    } else {
      authLink.textContent = "Login";
      authLink.href = "login.html";
    }

    /* the menu button on a phone */
    const toggler = document.querySelector(".navbar-toggler");
    const menu = document.getElementById("navbarNav");
    if (toggler && menu) toggler.addEventListener("click", function () {
      toggler.setAttribute("aria-expanded", String(menu.classList.toggle("show")));
    });

    try {
      const m = sessionStorage.getItem("homey_flash");
      if (m) { sessionStorage.removeItem("homey_flash"); Homey.say(m); }
    } catch (err) { /* storage can be blocked */ }
    if (!storageWorks()) Homey.say("This browser blocks storage, so the pages cannot share data. Use Chrome or Edge.");
  }
};
