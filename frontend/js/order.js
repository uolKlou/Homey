/* Order page: shows the dish, then saves the order when the customer confirms. The dish comes from the address: order.html?listing=3 */
Homey.init("order");

(async function () {
  const $ = function (id) { return document.getElementById(id); };
  const listingId = Number(new URLSearchParams(location.search).get("listing"));
  const user = getCurrentUser();

  /* only a logged-in user can order: log in first, then come back to this dish */
  if (!user) {
    try { sessionStorage.setItem("homey_pending", JSON.stringify({ type: "order", listingId: listingId })); } catch (err) { /* storage can be blocked */ }
    Homey.flash("Log in to place your order.");
    Homey.go("login.html");
    return;
  }

  const listing = await getListing(listingId);
  if (!listing) {
    $("orderItem").innerHTML = '<p class="mb-0">This dish could not be found.</p>';
    $("confirmBtn").hidden = true;
    return;
  }
  const seller = await getSeller(listing.sellerId);

  $("orderItem").innerHTML =
    '<img src="' + Homey.esc(listing.photo || PLACEHOLDER) + '" alt="' + Homey.esc(listing.name) + '">' +
    '<div><h4 class="font-weight-bold mb-1">' + Homey.esc(listing.name) + '</h4>' +
    '<p class="text-muted mb-1">from ' + Homey.esc(seller ? seller.name : "") + '</p>' +
    '<p class="mb-0"><b>' + Homey.money(listing.price) + '</b></p></div>';
  $("orderBack").href = "seller.html?id=" + listing.sellerId;

  $("confirmBtn").addEventListener("click", async function () {
    $("confirmBtn").disabled = true;
    let result;
    try { result = await placeOrder(user, listing.id); }
    catch (err) { result = { ok: false }; }
    $("confirmBtn").disabled = false;
    if (!result.ok) { Homey.say("The order could not be placed. Try again."); return; }
    $("orderDoneText").textContent = "Order #" + result.order.id + ": " + listing.name +
      " from " + (seller ? seller.name : "the seller") + ". Price: " + Homey.money(result.order.price) + ".";
    $("orderForm").hidden = true;
    $("orderDone").hidden = false;
  });
})();
