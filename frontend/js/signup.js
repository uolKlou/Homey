/* Sign-up page: creates an account, logs the new user in, then goes to the next page. */
Homey.init("signup");

(function () {
  const $ = function (id) { return document.getElementById(id); };
  const form = $("signupForm");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    $("signupError").hidden = true;
    const name = $("sName").value.trim(), email = $("sEmail").value.trim(), password = $("sPassword").value;
    const role = form.querySelector('input[name="role"]:checked').value;
    Homey.setError($("sName"), $("sNameError"), name ? "" : "Enter your name.");
    Homey.setError($("sEmail"), $("sEmailError"), email ? "" : "Enter your email address.");
    Homey.setError($("sPassword"), $("sPasswordError"), password ? "" : "Enter a password.");
    if (!(name && email && password)) return;

    $("signupBtn").disabled = true;
    let result;
    try { result = await registerRequest({ name: name, email: email, password: password, role: role }); }
    catch (err) { result = { ok: false }; }
    $("signupBtn").disabled = false;

    if (!result.ok) {
      $("signupError").textContent = "The account could not be created. Try again.";
      $("signupError").hidden = false;
      return;
    }
    Homey.afterAuth(result.user, true);
  });

  ["sName", "sEmail", "sPassword"].forEach(function (id) {
    $(id).addEventListener("input", function () { Homey.setError($(id), $(id + "Error"), ""); });
  });
})();
