//show password
const showPassordBtn = document.querySelector("#show-password");
const passwordField = document.querySelector("#account_password");

function showPassword() {
  if (passwordField.type === "password") {
    passwordField.type = "text";
    showPassordBtn.textContent = "Hide Password";
  } else {
    passwordField.type = "password";
    showPassordBtn.textContent = "Show Password";
  }
}
showPassordBtn.addEventListener("click", () => {
  showPassword();
});
