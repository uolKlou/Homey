/* Login page: checks the form, asks the data layer to log in, then goes to the next page. */
Homey.init("login");

(function () {
  const $ = function (id) { return document.getElementById(id); };
  const form = $("loginForm"), emailInput = $("email"), passwordInput = $("password"), submitBtn = $("submitBtn");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    $("formError").hidden = true;
    const emailOk = emailInput.value.trim() !== "", passwordOk = passwordInput.value !== "";
    Homey.setError(emailInput, $("emailError"), emailOk ? "" : "Enter your email address.");
    Homey.setError(passwordInput, $("passwordError"), passwordOk ? "" : "Enter your password.");
    if (!(emailOk && passwordOk)) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";
    let result;
    try { result = await loginRequest(emailInput.value.trim(), passwordInput.value); }
    catch (err) { result = { ok: false, networkError: true }; }
    submitBtn.disabled = false;
    submitBtn.textContent = "Login";

    if (!result.ok) {
      $("formError").textContent = result.networkError
        ? "We could not reach the server. Check your connection and try again."
        : "The email or password is wrong. Check them and try again.";
      $("formError").hidden = false;
      return;
    }
    Homey.afterAuth(result.user, false);
  });

  emailInput.addEventListener("input", function () { Homey.setError(emailInput, $("emailError"), ""); });
  passwordInput.addEventListener("input", function () { Homey.setError(passwordInput, $("passwordError"), ""); });
})();
