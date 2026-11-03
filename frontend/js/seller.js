/* Listing details page: one seller and all of that seller's listings. The seller comes from the address: seller.html?id=2 */
Homey.init("seller");

(async function () {
  const id = Number(new URLSearchParams(location.search).get("id"));
  const results = await Promise.all([getSeller(id), getListings(id)]);
  const seller = results[0], list = results[1];

  if (!seller) {
    document.getElementById("sellerHeader").innerHTML = '<h1>This seller could not be found.</h1>';
    return;
  }

  document.getElementById("sellerHeader").innerHTML =
    '<img class="rounded-circle" src="' + Homey.esc(seller.photo) + '" alt="' + Homey.esc(seller.name) + '">' +
    '<div><h1 class="mb-1">' + Homey.esc(seller.name) + '</h1>' +
    '<p class="text-muted mb-0">' + (seller.category ? Homey.esc(seller.category) + ' &middot; ' : '') + Homey.esc(seller.city) + '</p></div>';

  document.getElementById("dishGrid").innerHTML = list.map(function (l) {
    return '<div class="col-md-6 col-lg-4 mb-4"><div class="bg-light rounded p-4 dish-card">' +
      '<img class="dish-img mb-3" src="' + Homey.esc(l.photo || PLACEHOLDER) + '" alt="' + Homey.esc(l.name) + '">' +
      '<h4 class="font-weight-bold">' + Homey.esc(l.name) + '</h4>' +
      '<p class="text-muted grow">' + Homey.esc(l.description) + '</p>' +
      '<p class="mb-1"><b>' + Homey.money(l.price) + '</b></p>' +
      '<p class="text-muted mb-3">' + Homey.esc(l.city || seller.city) + '</p>' +
      '<a class="btn btn-primary" href="order.html?listing=' + l.id + '">Order</a>' +
      '</div></div>';
  }).join("");
  document.getElementById("listingsEmpty").hidden = list.length !== 0;
})();
