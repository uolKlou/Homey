/* Create-listing page (sellers only): saves a new dish under the logged-in seller. */
Homey.init("create-listing");

(async function () {
  const $ = function (id) { return document.getElementById(id); };
  const user = getCurrentUser();

  /* only a logged-in seller can create a listing */
  if (!user || user.role !== "seller") {
    Homey.flash("Log in as a seller to create a listing.");
    Homey.go("login.html");
    return;
  }

  const form = $("createForm");
  let photoData = "";                       // the photo chosen for the new listing

  (await getCities()).forEach(function (c) {
    const option = document.createElement("option");
    option.value = c; option.textContent = c;
    $("lCity").appendChild(option);
  });

  function shrink(dataUrl, done) {          // keeps the saved photo small
    const img = new Image();
    img.onload = function () {
      try {
        const scale = Math.min(1, 700 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.width * scale));
        c.height = Math.max(1, Math.round(img.height * scale));
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        done(c.toDataURL("image/jpeg", 0.8));
      } catch (err) { done(dataUrl); }
    };
    img.onerror = function () { done(dataUrl); };
    img.src = dataUrl;
  }

  $("lPhoto").addEventListener("change", function () {
    const file = this.files[0];
    photoData = "";
    $("lPreview").hidden = true;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      shrink(reader.result, function (url) {
        photoData = url;
        $("lPreview").src = url;
        $("lPreview").hidden = false;
      });
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const name = $("lName").value.trim(), description = $("lDesc").value.trim(), city = $("lCity").value;
    const price = Number($("lPrice").value);

    $("createBtn").disabled = true;
    let result;
    try { result = await createListing(user, { name: name, price: price, description: description, city: city, photo: photoData }); }
    catch (err) { result = { ok: false }; }
    $("createBtn").disabled = false;
    if (!result.ok) { Homey.say("The listing could not be saved. Try again."); return; }

    if (!user.sellerId) {                   // a new seller now has a shop
      user.sellerId = result.sellerId;
      setCurrentUser(user);
    }
    form.reset();
    photoData = "";
    $("lPreview").hidden = true;
    $("createDoneText").textContent = "\u201c" + name + "\u201d is now on your menu.";
    $("viewMine").href = "seller.html?id=" + result.sellerId;
    $("createDone").hidden = false;
  });
})();
