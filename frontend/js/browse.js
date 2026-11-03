/* Browse page: lists the sellers and filters them by city. */
Homey.init("browse");

(function () {
  const $ = function (id) { return document.getElementById(id); };
  const grid = $("sellerGrid"), emptyState = $("emptyState"), cityFilter = $("cityFilter"), resultCount = $("resultCount");

  /* "Welcome back, Sara." for whoever just logged in */
  try {
    const text = sessionStorage.getItem("homey_greeting");
    if (getCurrentUser() && text) { $("greeting").textContent = text; $("greeting").hidden = false; }
  } catch (err) { /* storage can be blocked */ }

  function card(s) {
    const link = "seller.html?id=" + s.id;
    return '' +
      '<div class="team-item col-md-4">' +
        '<div class="team-img mx-auto">' +
          '<a href="' + link + '"><img class="rounded-circle w-100 h-100" src="' + Homey.esc(s.photo) +
          '" alt="' + Homey.esc(s.name) + '" style="object-fit: cover;"></a>' +
        '</div>' +
        '<div class="position-relative text-center bg-light rounded px-4 py-5" style="margin-top: -100px;">' +
          '<a href="' + link + '"><h3 class="font-weight-bold mt-5 mb-3 pt-5">' + Homey.esc(s.name) + '</h3></a>' +
          (s.category ? '<h6 class="text-uppercase text-muted mb-2">' + Homey.esc(s.category) + '</h6>' : '') +
          '<p class="mb-3"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align:-2px"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg> ' +
            Homey.esc(s.city) + ' &middot; ' + s.dishCount + (s.dishCount === 1 ? ' dish' : ' dishes') + ' available</p>' +
          '<a class="btn btn-primary px-4" href="' + link + '">View menu</a>' +
        '</div>' +
      '</div>';
  }

  async function show(city) {
    let sellers;
    try { sellers = await getSellers(city); }
    catch (err) { grid.innerHTML = ""; Homey.say("We could not load the sellers. Check your connection and try again."); return; }
    grid.innerHTML = sellers.map(card).join("");
    emptyState.hidden = sellers.length !== 0;
    resultCount.textContent = sellers.length === 0 ? "" :
      "Showing " + sellers.length + (sellers.length === 1 ? " seller" : " sellers") +
      (city ? " in " + city : " in all cities");
  }

  async function start() {
    const cities = await getCities();
    cities.forEach(function (c) {
      const option = document.createElement("option");
      option.value = c; option.textContent = c;
      cityFilter.appendChild(option);
    });
    cityFilter.addEventListener("change", function () { show(cityFilter.value); });
    show("");
  }

  start();
})();
